import { Audio } from 'expo-av'


export interface RecordingStatus {
  isRecording: boolean;
  isProcessing: boolean;
}

export interface RecordingStatus {
  isRecording: boolean;
  isProcessing: boolean;
}

export interface VoiceRecorderHook{
  transcript: string;
  isRecording: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearTranscript: () => void;
  setTranscript: (text: string) => void;
}

export interface MicButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}

export interface TranscriptDisplayProps {
  transcript: string;
  isProcessing: boolean;
}

export interface StatusIndicatorProps {
  isRecording: boolean;
  isProcessing: boolean;
}

export interface ApiResponse{
  granted: boolean;
  status?: string;
}

export enum RecordingState {
  IDLE="idle",
  RECORDING="recording",
  PROCESSING="processing",
}


// return (result as any).text || MESSAGES.NO_AUDIO;