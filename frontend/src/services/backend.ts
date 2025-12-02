import {BACKEND_URL} from '../config/constants';


export const saveToBackend = async(text: string, audioUri: string) => {
  try {
    const formData = new FormData();

    formData.append('text',  text);

    const fileType = audioUri.split('.').pop()
    const fileName = `recording.${fileType}`;

    const audioBlob = await fetch(audioUri).then(res => res.blob());
    formData.append('audio', audioBlob, fileName);

    console.log('Uploading to:', `${BACKEND_URL}/upload`)

    const response = await fetch(`${BACKEND_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type' : 'multipart/form-data',
      },
    });

    const result = await response.json();
    console.log('Backend Saved:', result);
    return result;
  } catch (error) {
    console.error('Backend Error:, error');
  }
}