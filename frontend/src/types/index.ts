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

export interface AudioPermission {
  granted: boolean;
  status?: StatusIndicatorProps;
}

export enum RecordingState {
  IDLE="idle",
  RECORDING="recording",
  PROCESSING="processing",
}
