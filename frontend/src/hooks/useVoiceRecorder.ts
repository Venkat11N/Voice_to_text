import { useState, useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { convertToText } from '../services/speechToText';
import { VoiceRecorderHook } from '../types';
import { MESSAGES } from '../config/constants';

// Recording options that Wit.ai can understand
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
    outputFormat: Audio.IOSOutputFormat.LINEARPCM, // Raw PCM format
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
  
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        console.log('🔧 Setting up audio...');
        
        const { granted } = await Audio.requestPermissionsAsync();
        
        if (!granted) {
          alert(MESSAGES.PERMISSION_DENIED);
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        console.log('✅ Audio setup complete');
      } catch (error) {
        console.error('Setup error:', error);
      }
    };
    
    setup();

    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      if (isRecording || recordingRef.current) {
        console.log('⚠️ Already recording');
        return;
      }

      console.log('🎤 Starting recording...');

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert(MESSAGES.PERMISSION_DENIED);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setTranscript('');
      setAudioFileUri('');

      console.log('📼 Creating WAV/PCM recording...');
      
      // Use our custom recording options
      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);

      recordingRef.current = recording;
      setIsRecording(true);
      
      console.log('✅ Recording started (WAV/PCM format)');
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
      await recordingRef.current.stopAndUnloadAsync();
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recordingRef.current.getURI();
      console.log('📁 Recording URI:', uri);

      recordingRef.current = null;

      if (!uri) {
        throw new Error('No recording URI');
      }

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
      console.error('❌ Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setTranscript('Error: ' + errorMsg);
      recordingRef.current = null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearTranscript = useCallback((): void => {
    setTranscript('');
    
    if (audioFileUri) {
      FileSystem.deleteAsync(audioFileUri, { idempotent: true })
        .then(() => console.log('🗑️ File deleted'))
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