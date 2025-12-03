import express, {Application} from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import transcriptionRoutes from './routes/transcriptionRoutes';

dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URL = process.env.MONGODB_URL || '';

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const connectDB = async () => {
  try {
  await mongoose.connect(MONGODB_URL);
  console.log('✅ MongoDB Connected Successfully');
} catch (error) {
  console.error('❌ MongoDB Connection Failed', error);
  process.exit(1);
}
};


app.use('/api', transcriptionRoutes);

const start = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
};

start();


