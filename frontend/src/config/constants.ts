export const WIT_AI_TOKEN: string =process.env.WIT_API_TOKEN;

export const WIT_API_URL:string = ''

export interface MessagesType {
  readonly DEFAULT: string;
  readonly RECORDING: string;
  readonly PROCESSING: string;
  readonly READY: string;
  readonly ERROR: string;
  readonly NO_AUDIO: string;
  readonly PERMISSION_DENIED: string;
  readonly CONVERTING: string;
}

export const MESSAGES: MessagesType = {
  DEFAULT: 'Press and hold the mic button to speak',
  RECORDING: 'Recording... Release to stop',
  PROCESSING: 'Processing',
  READY: 'Press & hold to record',
  ERROR: 'Error converting speech',
  NO_AUDIO: 'Could not understand audio',
  PERMISSION_DENIED: 'Microphone permission needed',
  CONVERTING: 'Converting speech to text...',
} as const;

export const API_TIMEOUT: number = 30000;