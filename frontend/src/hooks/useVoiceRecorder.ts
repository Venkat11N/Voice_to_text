import { useState, useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { convertToText } from '../services/speechToText';
import { VoiceRecorderHook } from '../types';
import { MESSAGES } from '../config/constants';

// Recording options
const RECORDING_OPTIONS = {
  isMeteringEnabled: false,
  android: {
    extension: '.wav',
    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.MAX,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/wav',
    bitsPerSecond: 256000,
  },
};

export const useVoiceRecorder = (): VoiceRecorderHook => {
  const [transcript, setTranscript] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioFileUri, setAudioFileUri] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAudio = async () => {
      try {
        console.log('🔧 Initializing audio...');
        
        // Check if Audio is available
        if (!Audio) {
          console.error('❌ Audio module not available');
          return;
        }

        // Request permissions
        const permissionResponse = await Audio.requestPermissionsAsync();
        
        if (!permissionResponse.granted) {
          console.log('❌ Permission denied');
          if (isMounted) {
            alert(MESSAGES.PERMISSION_DENIED);
          }
          return;
        }

        // Set audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        if (isMounted) {
          setIsInitialized(true);
          console.log('✅ Audio initialized');
        }
      } catch (error) {
        console.error('❌ Audio initialization error:', error);
      }
    };

    initializeAudio();

    // Cleanup
    return () => {
      isMounted = false;
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

      // Check if audio is initialized
      if (!isInitialized) {
        console.log('⚠️ Audio not initialized yet');
        
        // Try to initialize again
        const permission = await Audio.requestPermissionsAsync();
        if (!permission.granted) {
          alert(MESSAGES.PERMISSION_DENIED);
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      console.log('🎤 Starting recording...');

      // Clear previous state
      setTranscript('');
      setAudioFileUri('');

      console.log('📼 Creating recording instance...');
      
      // Create new recording - Check if Audio.Recording exists
      if (!Audio.Recording) {
        console.error('❌ Audio.Recording not available');
        alert('Audio recording not available on this device');
        return;
      }

      // Create recording with try-catch
      let recording: Audio.Recording | null = null;
      
      try {
        const recordingResult = await Audio.Recording.createAsync(
          RECORDING_OPTIONS
        );
        recording = recordingResult.recording;
      } catch (createError) {
        console.error('❌ Failed to create recording:', createError);
        alert('Failed to start recording. Please try again.');
        return;
      }

      if (!recording) {
        console.error('❌ Recording object is null');
        return;
      }

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
  }, [isRecording, isInitialized]);

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
      
      // Stop recording with error handling
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (stopError) {
        console.error('Error stopping recording:', stopError);
      }
      
      // Reset audio mode
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      } catch (modeError) {
        console.error('Error resetting audio mode:', modeError);
      }

      // Get URI safely
      let uri: string | null = null;
      try {
        uri = recordingRef.current.getURI();
      } catch (uriError) {
        console.error('Error getting URI:', uriError);
      }

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