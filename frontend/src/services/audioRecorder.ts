import { Audio } from 'expo-av';
import { MESSAGES } from '../config/constants';
import { AudioPermission } from '../types';

export const requestPermissions = async (): Promise<boolean> => {
  try {
    const permission: AudioPermission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      alert(MESSAGES.PERMISSION_DENIED);
      return false;
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
  });
};

export const createRecording = async (): Promise<Audio.Recording> => {
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  return recording;
};

export const stopAndGetUri = async (recording: Audio.Recording): Promise<string> => {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  
  if (!uri) {
    throw new Error('No recording URI found');
  }
  
  return uri;
};