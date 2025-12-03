import { useState, useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { convertToText } from '../services/speechToText';
import { VoiceRecorderHook } from '../types';
import { MESSAGES } from '../config/constants';
import {api} from '../services/api'

const RECORDING_OPTIONS = {
  isMeteringEnabled: true,
  android: {
    extension: '.wav',
    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.MAX,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/wav',
    bitsPerSecond: 128000,
  },
};

export const useVoiceRecorder = (): VoiceRecorderHook => {
  const [transcript, setTranscript] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioFileUri, setAudioFileUri] = useState<string>('');
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  // Track actual recording start time
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      if (isRecording || recordingRef.current) return;

      console.log('🎤 Starting recording...');
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert(MESSAGES.PERMISSION_DENIED);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      setTranscript('');
      setAudioFileUri('');

      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
      recordingRef.current = recording;
      startTimeRef.current = Date.now(); // MARK START TIME
      
      setIsRecording(true);
      console.log('✅ Recording started');
    } catch (error) {
      console.error('❌ Recording error:', error);
      setIsRecording(false);
      recordingRef.current = null;
    }
  }, [isRecording]);

  const stopRecording = useCallback(async (): Promise<void> => {
    if (!recordingRef.current) return;

    // Check if recording was too short (less than 1 second)
    const duration = Date.now() - startTimeRef.current;
    if (duration < 1000) {
      console.log('⚠️ Recording too short (<1s), discarding...');
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {}
      recordingRef.current = null;
      setIsRecording(false);
      return; // Exit early, don't send to API
    }

    console.log('⏹️ Stopping recording...');
    setIsRecording(false);
    setIsProcessing(true);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error('No URI');

      // Double check file size
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists || (fileInfo.size || 0) < 1000) {
        throw new Error('File too small or empty');
      }

      console.log('✅ File saved:', uri);
      setAudioFileUri(uri);

      console.log('🔄 Converting...');
      const text = await convertToText(uri);
      setTranscript(text);

      if(text && text !== 'No speech detected.') {
        console.log('Saving voice note to DB...');
        await api.saveVoiceNote(text, uri);
        console.log('Saved to DB!');
      }

      console.log('✅ Done!');
    } catch (error) {
      console.error('❌ Stop error:', error);
      // Don't show error to user for cancelled/short recordings
      // setTranscript('Error processing recording'); 
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearTranscript = useCallback((): void => {
    setTranscript('');
    if (audioFileUri) {
      FileSystem.deleteAsync(audioFileUri, { idempotent: true }).catch(() => {});
      setAudioFileUri('');
    }
  }, [audioFileUri]);

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