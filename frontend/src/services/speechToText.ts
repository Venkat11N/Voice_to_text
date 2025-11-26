import * as FileSystem from 'expo-file-system';
import {WIT_AI_TOKEN, WIT_API_URL, MESSAGES, API_TIMEOUT} from '../config/constants';
import { ApiResponse } from '../types';

export const convertToText = async(audioUri: string)<string> => {
  const controller = new AbortController();
  const timeoutId= setTimeout(()=> controller.abort(), API_TIMEOUT)


try{
  const audioBase64: string = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await fetch(WIT_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WIT_AI_TOKEN}`,
      'Content-Type':'audio/wav',
    },
    body: audioBase64,
    signal: controller.signal,
  });

  clearTimeout(timeoutId)

  if(!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse = await response.json();
  return result.text || MESSAGES.NO_AUDIO;
} catch (error) {
  clearTimeout(timeoutId);

  if(error instanceof Error) {
    console.error('Wit.ai error:' error.message);

    if(error.name === 'AbortError') {
      return 'Request timeout - please try again';
    }
  }

  return MESSAGES.ERROR;
  }
};