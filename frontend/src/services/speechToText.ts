import * as FileSystem from 'expo-file-system/legacy';
import { WIT_AI_TOKEN, WIT_API_URL, MESSAGES } from '../config/constants';

const parseWitResponse = (responseText: string): string => {
  let finalTranscription = "";
  let braceCount = 0;
  let startIndex = 0;
  let chunks: any[] = [];

  // 1. Extract all JSON objects from the stream
  for (let i = 0; i < responseText.length; i++) {
    const char = responseText[i];
    if (char === '{') {
      if (braceCount === 0) startIndex = i;
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0) {
        try {
          const jsonString = responseText.substring(startIndex, i + 1);
          const data = JSON.parse(jsonString);
          chunks.push(data);
        } catch (e) {}
      }
    }
  }

  console.log(`📦 Parsed ${chunks.length} chunks from Wit.ai`);

  // 2. Logic to get the best text
  // Wit.ai /dictation sends multiple is_final blocks for long speech.
  // We need to join all blocks that have is_final=true.
  // If no is_final, we take the text from the very last chunk.

  const finalChunks = chunks.filter(c => c.is_final);

  if (finalChunks.length > 0) {
    // Join all final segments (e.g. "Hello." + " How are you?")
    finalTranscription = finalChunks.map(c => c.text).join(' ');
  } else if (chunks.length > 0) {
    // Fallback: Take the text from the absolute last chunk received
    finalTranscription = chunks[chunks.length - 1].text;
  }

  return finalTranscription.trim();
};

export const convertToText = async (audioUri: string): Promise<string> => {
  try {
    console.log('📤 Fetching Blob from URI...');
    
    const response = await fetch(audioUri);
    const blob = await response.blob();

    console.log(`📊 Blob size: ${blob.size}`);

    console.log('📤 Sending Blob to Wit.ai...');
    
    const witResponse = await fetch(WIT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WIT_AI_TOKEN}`,
        'Content-Type': 'audio/wav',
      },
      body: blob 
    });

    const text = await witResponse.text();
    console.log('📥 Wit.ai Status:', witResponse.status);

    if (!witResponse.ok) {
      console.error('❌ Wit Error:', text);
      return `Error: ${witResponse.status}`;
    }

    const transcription = parseWitResponse(text);
    console.log('✅ Result:', transcription);
    return transcription || 'No speech detected';

  } catch (error) {
    console.error('❌ Error:', error);
    return MESSAGES.ERROR;
  }
};

export default convertToText;