import { Audio } from 'expo-audio';
import { MESSAGES } from '../config/constants';


export const requestPermissions = async (): Promise<boolean> => {
  try {
    const [permissionResponse, requestResponse] = await Audio.getPermisssionAsync();
    if (permissionResponse.status !== 'granted') {
      const {status} =await Audio.requestPermissionAsync();
      if (status !== 'granted') {
        alert(MESSAGES.PERMISSION_DENIED);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Permission error:', error);
    return false;
  }
};

export const configureAudio = async (): Promise<void> => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid:false,
  });
};

export const createRecording = async (): Promise<Audio.Recording> => {
try {
  const recording = new Audio.Recording();

  await recording.prepareToRecordAsync({
    isMeteringEnabled: false,
    android: {
      extension:'.m4a',
      outputFormat: Audio.AndroidOutputFormat.MPEG_4,
      AudioEncoder: Audio.AndroidAudioEncoder.ACC,
      sampleRate: 44100,
      numberOfChanncels: 2,
      bitRate: 128000,
    },
    ios: {
      extension:'.m4a',
      outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
      audioQuality: Audio.IOSAudioQuality.HIGH,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  });

  await recording.startAsync();
  return recording;
} catch (error) {
  console.error('Error creating recording:', error);
  throw error;
}
};

export const stopAndGetUri = async (recording: Audio.Recording): Promise<string> => {
  try {
    await recording.stopAndUnloadAsync();
    const uri= recording.getURI();

    if(!uri) {
      throw new Error('No recording URI found');
    }

    console.log('Audio file saved at:', uri);
    return uri;
    } catch (error) {
      console.error('Error stopping recording', error);
      throw error;
  }
};