import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
// @ts-ignore
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for demo video uploads
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, uploadsDir);
  },
  filename: function (req: any, file: any, cb: any) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'demo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// GET all projects
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        seller: {
          select: { name: true, email: true }
        }
      }
    });
    res.json(projects);
  } catch (error) {
    console.error('[PROJECT FETCH ERROR]', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
});

// POST a new project (Authenticated client context)
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description, price, videoUrl } = req.body;
    const sellerId = (req as any).user?.id;

    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized user context.' });
    }

    if (!title || !description || isNaN(parseFloat(price))) {
      return res.status(400).json({ error: 'Missing required project attributes or invalid price.' });
    }

    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        sellerId,
        videoUrl: videoUrl || null
      }
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('[PROJECT CREATE ERROR]', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
});

// POST /api/projects/upload-video (Authenticated upload project demo video)
router.post('/upload-video', authenticateToken, upload.single('video'), async (req: any, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided.' });
    }
    const videoUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ videoUrl });
  } catch (error) {
    console.error('[PROJECT VIDEO UPLOAD ERROR]', error);
    res.status(500).json({ error: 'Failed to upload demo video.' });
  }
});

export default router;
