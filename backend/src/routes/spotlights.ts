import prisma from '../lib/prisma';
import { Router, Response } from 'express';

import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();


// GET all Creator Spotlights
router.get('/', async (req, res): Promise<any> => {
  try {
    const spotlights = await prisma.creatorSpotlight.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(spotlights);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching spotlights' });
  }
});

// POST a new Creator Spotlight (Authenticated)
router.post('/', authenticateToken, async (req: any, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user context.' });
    }

    const { name, role, pitch, videoUrl, image, project } = req.body;

    if (!name || !role || !pitch || !videoUrl || !project) {
      return res.status(400).json({ error: 'Missing required spotlight fields.' });
    }

    const newSpotlight = await prisma.creatorSpotlight.create({
      data: {
        name,
        role,
        pitch,
        videoUrl,
        image: image || '/creators/creator_1.png',
        project,
        userId
      }
    });

    res.status(201).json(newSpotlight);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating spotlight' });
  }
});

export default router;
