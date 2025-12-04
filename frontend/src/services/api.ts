import { BACKEND_URL } from '../config/constants';

export const api = {
  saveVoiceNote: async (text: string, audioUri: string) => {
    try {
      const formData = new FormData();
      formData.append('text', text);

      const fileType = audioUri.split('.').pop();
      const fileName = `recording.${fileType}`;

      // @ts-ignore
      formData.append('audio', {
        uri: audioUri,
        name: fileName,
        type: `audio/${fileType}`,
      });

      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return await response.json();
    } catch (error) {
      console.error('API Error (Voice):', error);
      throw error; // Throw error so UI knows it failed
    }
  },

  saveText: async (text: string) => {
    try {
      console.log('🚀 Attempting to fetch:', `${BACKEND_URL}/text`); 
      const response = await fetch(`${BACKEND_URL}/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error (Text):', error);
      throw error; 
    }
  }
};