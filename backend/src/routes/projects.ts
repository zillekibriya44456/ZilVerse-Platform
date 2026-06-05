import prisma from '../lib/prisma';
import { Router, Request, Response } from 'express';

import { authenticateToken } from '../middleware/auth';
import { uploadVideo, getFileUrl } from '../config/cloudinary';

const router = Router();


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
router.post('/upload-video', authenticateToken, uploadVideo.single('video'), async (req: any, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided.' });
    }
    const videoUrl = getFileUrl(req.file);
    res.status(200).json({ videoUrl });
  } catch (error) {
    console.error('[PROJECT VIDEO UPLOAD ERROR]', error);
    res.status(500).json({ error: 'Failed to upload demo video.' });
  }
});

export default router;
