import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Transcription from '../models/Transcription';

const router = express.Router();

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({storage: storage});

router.post('/upload', upload.single('audio'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({error: 'No audio file uploaded'});
      return;
    }

    const {text} = req.body;

    const newRecord = new Transcription({
      text: text,
      audioPath: req.file.filename
    });

    const savedRecord = await newRecord.save();

    res.status(201).json({
      message: 'Saved successfully',
      data: savedRecord
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({error: 'Server error while saving'});
  }
});

router.post('/text', async(req:Request, res: Response): Promise<void> => {
  try {
    const {text} = req.body;

    if(!text) {
      res.status(400).json({error: 'Text is required'});
      return;
    }

    const newRecord = new Transcription({
      text: text,
    });
    await newRecord.save()

    res.status(201).json({message: 'Text saved', data: newRecord});
  } catch (error) {
    console.error('Text Save Error:', error);
    res.status(500).json({error: 'Server error'});
  }
});

const uplaod = multer({ storage: storage});

router.post('/upload', upload.single('audio'), async(req: Request, res: Response, ) => {
 try {
  if (!req.file) {
    res.status(400).json({error: 'No audio file uploaded'});
    return;
  }
  const { text } = req.body;

  const newRecord = new Transcription({
    text: text,
    audioPath: req.file.filename
  });

  const savedRecord = await newRecord.save();

  res.status(201).json({
    message: 'Saved successfully',
    data: savedRecord
  });
 } catch (error) {
  console.error('Uplaod Error:', error);
  res.status(500).json({error: 'Server error while saving'});
 }
});

router.get('/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const history = await Transcription.find().sort({createdAt: -1});
    res.status(200).json(history);
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({error: 'Server error fetching history'});
  }
});

export default router;