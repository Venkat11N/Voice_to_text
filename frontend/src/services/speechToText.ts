import * as FileSystem from 'expo-file-system';
import { WIT_AI_TOKEN, WIT_API_URL, MESSAGES, API_TIMEOUT } from '../config/constants';
import { ApiResponse } from '../types';

export const convertToText = async (audioUri: string): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    console.log('📤 Sending audio from:', audioUri);
    

    const audioBase64: string = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64', 
    });

    if (!audioBase64) {
      throw new Error('Failed to read audio file');
    }

    console.log('📊 Audio file size (base64):', audioBase64.length);


    const response = await fetch(WIT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WIT_AI_TOKEN}`,
        'Content-Type': 'audio/mpeg', 
      },
      body: audioBase64,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse = await response.json();
    console.log('✅ Transcription result:', result);
    
    return result.text || MESSAGES.NO_AUDIO;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      console.error('Wit.ai error:', error.message);
      
      if (error.name === 'AbortError') {
        return 'Request timeout - please try again';
      }
    }
    
    return MESSAGES.ERROR;
  }
};


export const convertToTextWithFormData = async (audioUri: string): Promise<string> => {
  try {
    console.log('📤 Sending audio from:', audioUri);
    

    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    console.log('📁 File info:', fileInfo);


    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: 'base64',
    });


    const audioBlob = {
      uri: audioUri,
      type: 'audio/mpeg',
      name: 'audio.mp3',
    };


    const formData = new FormData();
    formData.append('audio', audioBlob as any);

    const response = await fetch(WIT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WIT_AI_TOKEN}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const result = await response.json();
    console.log('✅ Result:', result);
    
    return result.text || MESSAGES.NO_AUDIO;
  } catch (error) {
    console.error('Error:', error);
    return MESSAGES.ERROR;
  }
};