import { useState, useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { convertToText } from '../services/speechToText';
import { VoiceRecorderHook } from '../types';
import { MESSAGES } from '../config/constants';

// Recording options
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

  // Initialize permissions on mount (optional but good UX)
  useEffect(() => {
    const getPermissions = async () => {
      try {
        await Audio.requestPermissionsAsync();
      } catch (error) {
        console.error('Permission request error:', error);
      }
    };
    getPermissions();

    // Cleanup
    return () => {
      if (recordingRef.current) {
        try {
          recordingRef.current.stopAndUnloadAsync();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      // Check if already recording
      if (isRecording || recordingRef.current) {
        console.log('⚠️ Already recording');
        return;
      }

      console.log('🎤 Starting recording...');

      // 1. Always Request Permission check
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert(MESSAGES.PERMISSION_DENIED);
        return;
      }

      // 2. ALWAYS Reset Audio Mode before EVERY recording
      // This fixes the "Recording not allowed on iOS" error
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Clear previous state
      setTranscript('');
      setAudioFileUri('');

      console.log('📼 Creating recording instance...');
      
      // 3. Create new recording
      const { recording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS
      );

      recordingRef.current = recording;
      setIsRecording(true);
      
      console.log('✅ Recording started');
    } catch (error) {
      console.error('❌ Recording error:', error);
      setIsRecording(false);
      recordingRef.current = null;
      
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to start recording: ' + errorMsg);
    }
  }, [isRecording]);

  const stopRecording = useCallback(async (): Promise<void> => {
    try {
      if (!recordingRef.current) {
        console.log('⚠️ No active recording');
        setIsRecording(false);
        return;
      }

      console.log('⏹️ Stopping recording...');
      setIsRecording(false);
      setIsProcessing(true);

      console.log('📼 Stopping and unloading...');
      
      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      
      // OPTIONAL: Disable recording mode to allow playback through speakers
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      // Get URI
      const uri = recordingRef.current.getURI();
      console.log('📁 Recording URI:', uri);

      // Clear recording reference
      recordingRef.current = null;

      if (!uri) {
        throw new Error('No recording URI');
      }

      // Check file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('📊 File info:', fileInfo);

      if (!fileInfo.exists || !fileInfo.size) {
        throw new Error('Recording file not found or empty');
      }

      const fileSizeKB = (fileInfo.size / 1024).toFixed(2);
      const fileExtension = uri.split('.').pop()?.toLowerCase();
      console.log('✅ File saved:', `${fileSizeKB} KB`);
      console.log('📁 File extension:', fileExtension);
      
      setAudioFileUri(uri);

      console.log('🔄 Converting speech to text...');
      const text = await convertToText(uri);
      console.log('📝 Transcription result:', text);
      
      setTranscript(text);

      console.log('✅ Done!');
    } catch (error) {
      console.error('❌ Stop recording error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setTranscript('Error: ' + errorMsg);
      recordingRef.current = null;
    } finally {
      setIsProcessing(false);
      setIsRecording(false);
    }
  }, []);

  const clearTranscript = useCallback((): void => {
    setTranscript('');
    if (audioFileUri) {
      // Optional: Delete file when clearing transcript
      FileSystem.deleteAsync(audioFileUri, { idempotent: true })
        .catch(() => console.log('Could not delete'));
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