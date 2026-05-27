import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all freelancers
router.get('/', async (req, res) => {
  try {
    const freelancers = await prisma.freelancerProfile.findMany({
      include: {
        user: {
          select: { name: true, email: true, avatar: true }
        }
      }
    });
    res.json(freelancers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch freelancers' });
  }
});

// Create/Update freelancer profile
router.post('/register', async (req, res) => {
  try {
    const { title, hourlyRate, skills, bio, portfolio, userId } = req.body;
    
    let uid = userId;
    if (!uid) {
       const user = await prisma.user.findFirst();
       if (!user) return res.status(400).json({ error: 'No users exist. Please sign up first.' });
       uid = user.id;
    }

    const freelancer = await prisma.freelancerProfile.upsert({
      where: { userId: uid },
      update: {
        title,
        hourlyRate: parseFloat(hourlyRate),
        skills,
        bio,
        portfolio
      },
      create: {
        userId: uid,
        title,
        hourlyRate: parseFloat(hourlyRate),
        skills,
        bio,
        portfolio
      }
    });
    res.status(200).json(freelancer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register freelancer profile' });
  }
});

export default router;
