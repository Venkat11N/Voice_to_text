import * as FileSystem from 'expo-file-system/legacy';
import { WIT_AI_TOKEN, WIT_API_URL, MESSAGES } from '../config/constants';

interface WitResponse {
  text?: string;
  is_final?: boolean;
  error?: string;
  entities?: object;
  intents?: object[];
  traits?: object;
  speech?: {
    confidence: number;
    tokens: Array<{
      token: string;
      confidence: number;
      start: number;
      end: number;
    }>;
  };
}

// Parse multiple JSON objects from Wit.ai streaming response
const parseWitResponse = (responseText: string): string => {
  try {
    // Split by newlines or }{ to separate JSON objects
    const jsonStrings = responseText
      .split(/\n/)
      .filter(line => line.trim().startsWith('{'));

    console.log('📦 Found', jsonStrings.length, 'JSON objects');

    let finalText = '';

    for (const jsonStr of jsonStrings) {
      try {
        const parsed: WitResponse = JSON.parse(jsonStr.trim());
        
        // Get the text from this response
        if (parsed.text) {
          finalText = parsed.text;
        }

        // If this is the final response, use it
        if (parsed.is_final && parsed.text) {
          console.log('✅ Found final response:', parsed.text);
          return parsed.text;
        }
      } catch (e) {
        // Skip invalid JSON chunks
        continue;
      }
    }

    // If no final response found, return the last text we got
    return finalText || '';
  } catch (error) {
    console.error('Parse error:', error);
    return '';
  }
};

// Alternative: Extract text using regex (simpler)
const extractTextFromResponse = (responseText: string): string => {
  try {
    // Find the last "text": "..." in the response
    const textMatches = responseText.match(/"text"\s*:\s*"([^"]*)"/g);
    
    if (textMatches && textMatches.length > 0) {
      // Get the last text match (most complete)
      const lastMatch = textMatches[textMatches.length - 1];
      const textValue = lastMatch.match(/"text"\s*:\s*"([^"]*)"/);
      
      if (textValue && textValue[1]) {
        console.log('✅ Extracted text:', textValue[1]);
        return textValue[1];
      }
    }
    
    return '';
  } catch (error) {
    console.error('Extract error:', error);
    return '';
  }
};

export const convertToText = async (audioUri: string): Promise<string> => {
  try {
    console.log('📤 Starting speech-to-text conversion...');
    
    if (!WIT_AI_TOKEN || WIT_AI_TOKEN.length < 10) {
      return 'Error: Token not configured';
    }

    console.log('🔑 Using token:', WIT_AI_TOKEN.substring(0, 8) + '...');

    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    
    if (!fileInfo.exists) {
      throw new Error('Audio file does not exist');
    }

    const fileSizeKB = ((fileInfo.size || 0) / 1024).toFixed(2);
    const fileExtension = audioUri.split('.').pop()?.toLowerCase();
    
    console.log('📊 File size:', `${fileSizeKB} KB`);
    console.log('📄 File extension:', fileExtension);

    // Determine content type
    const contentType = fileExtension === 'wav' ? 'audio/wav' : 'audio/mpeg';

    console.log('📖 Reading audio file...');
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!audioBase64 || audioBase64.length === 0) {
      throw new Error('Failed to read audio file');
    }

    console.log('📊 Base64 length:', audioBase64.length);

    // Convert base64 to binary
    console.log('🔄 Converting to binary...');
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log('📤 Sending to Wit.ai...');
    console.log('   - Content-Type:', contentType);
    console.log('   - Body size:', bytes.length, 'bytes');

    const response = await fetch(WIT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WIT_AI_TOKEN}`,
        'Content-Type': contentType,
      },
      body: bytes,
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      return `API error ${response.status}`;
    }

    const responseText = await response.text();
    console.log('📥 Raw response length:', responseText.length);

    // Parse the streaming response
    let transcribedText = extractTextFromResponse(responseText);
    
    // If regex method didn't work, try JSON parsing method
    if (!transcribedText) {
      transcribedText = parseWitResponse(responseText);
    }

    console.log('✅ Final transcribed text:', transcribedText);
    
    if (!transcribedText || transcribedText.trim() === '') {
      return 'No speech detected. Please speak clearly and try again.';
    }
    
    return transcribedText.trim();
  } catch (error) {
    console.error('❌ speechToText Error:', error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return MESSAGES.ERROR;
  }
};

export default convertToText;