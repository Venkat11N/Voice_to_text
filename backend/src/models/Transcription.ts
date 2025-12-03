import mongoose, { Schema, Document } from 'mongoose';


export interface ITranscription extends Document {
  text: string;
  audioPath?: string;
  createdAt: Date;
}


const TranscriptionSchema: Schema = new Schema({
  text: { 
    type: String, 
    required: true 
  },
  audioPath: { 
    type: String, 
    required: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});


export default mongoose.model<ITranscription>('Transcription', TranscriptionSchema);