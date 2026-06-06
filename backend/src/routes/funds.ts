import express from 'express';
import prisma from '../lib/prisma';

import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all fund grants
router.get('/', async (req, res) => {
  try {
    const grants = await prisma.fundGrant.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(grants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fund grants' });
  }
});

// Post a new grant
router.post('/create', authenticateToken, async (req: any, res: any) => {
  try {
    const { title, organization, amount, description, deadline } = req.body;
    
    const uid = req.user?.id;
    if (!uid) {
       return res.status(401).json({ error: 'Unauthorized user context.' });
    }

    const grant = await prisma.fundGrant.create({
      data: {
        title,
        organization,
        amount,
        description,
        deadline: deadline || 'Rolling',
        creatorId: uid
      }
    });
    res.status(201).json(grant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create fund grant' });
  }
});

export default router;
