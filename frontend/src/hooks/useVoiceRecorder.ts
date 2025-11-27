import { useState, useRef, MutableRefObject } from 'react';
import { Audio } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { 
  requestPermissions, 
  configureAudio, 
  createRecording, 
  stopAndGetUri 
} from '../services/audioRecorder';
import { convertToText } from '../services/speechToText';

export interface VoiceRecorderHook {
  transcript: string;
  isRecording: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearTranscript: () => void;
  setTranscript: (text: string) => void; 
}

export const useVoiceRecorder = (): VoiceRecorderHook => {
  const [transcript, setTranscript] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioFileUri, setAudioFileUri] = useState<string>('');
  const recordingRef: MutableRefObject<Audio.Recording | null> = useRef<Audio.Recording | null>(null);

  const startRecording = async (): Promise<void> => {
    try {
      const hasPermission: boolean = await requestPermissions();
      if (!hasPermission) {
        console.log('Permission denied');
        return;
      }

      await configureAudio();
      const recording: Audio.Recording = await createRecording();
      
      if (!recording) {
        console.error('Failed to create recording');
        return;
      }

      recordingRef.current = recording;
      setIsRecording(true);
      setTranscript('');
      setAudioFileUri('');
      console.log('🎤 Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
      alert('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async (): Promise<void> => {
    try {
      if (!recordingRef.current) {
        console.error('No active recording');
        setIsRecording(false);
        return;
      }

      console.log('⏹️ Stopping recording...');
      setIsRecording(false);
      setIsProcessing(true);

      const uri: string = await stopAndGetUri(recordingRef.current);
      setAudioFileUri(uri);
      

      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('📁 Audio File Details:', {
        uri: uri,
        size: fileInfo.size ? `${(fileInfo.size / 1024).toFixed(2)} KB` : 'Unknown',
        exists: fileInfo.exists,
      });

      const text: string = await convertToText(uri);
      setTranscript(text);
      
      recordingRef.current = null;
    } catch (error) {
      console.error('Stop recording error:', error);
      setTranscript('Error processing recording. Please try again.');
    } finally {
      setIsProcessing(false);
      setIsRecording(false);
    }
  };

  const clearTranscript = (): void => {
    setTranscript('');
    

    if (audioFileUri) {
      FileSystem.deleteAsync(audioFileUri, { idempotent: true })
        .then(() => console.log('🗑️ Audio file deleted'))
        .catch((err) => console.log('Could not delete file:', err));
    }
  };

  return {
    transcript,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    clearTranscript,
    setTranscript, 
  };
};