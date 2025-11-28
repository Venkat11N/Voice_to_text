import { 
  useAudioRecorder, 
  AudioModule, 
  RecordingOptions,
  RecordingPresets 
} from 'expo-audio';
import { MESSAGES } from '../config/constants';


export const requestPermissions = async (): Promise<boolean> => {
  try {
    console.log('Requesting audio permission...');


    const status = await AudioModule.requestRecordingPermissionsAsync();
    
    console.log('Permission response:', status);
    
    if (!status.granted) {
      alert(MESSAGES.PERMISSION_DENIED);
      return false;
    }
    
    console.log('✅ Permission granted');
    return true;
  } catch (error) {
    console.error('Permission error:', error);
    alert('Failed to get microphone permission');
    return false;
  }
};

export const configureAudio = async (): Promise<void> => {
  try {
    console.log('Configuring audio mode...');


    await AudioModule.setAudioModeAsync({
      playsInSilentMode: true,
      shouldRouteThroughEarpiece: false,
    });
    
    console.log('✅ Audio mode configured');
  } catch (error) {
    console.error('Audio configuration error:', error);
    throw error;
  }
};


export const recordingOptions: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  extension: '.m4a',
};