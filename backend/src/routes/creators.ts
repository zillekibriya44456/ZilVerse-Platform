import prisma from '../lib/prisma';
import express from 'express';


const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const creators = await prisma.creatorProfile.findMany({
      include: { user: { select: { name: true, avatar: true } } },
      orderBy: { followers: 'desc' }
    });
    res.json(creators);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { niche, followers, platform, bio, userId } = req.body;
    let uid = userId;
    if (!uid) {
       const user = await prisma.user.findFirst();
       if (!user) return res.status(400).json({ error: 'No users exist.' });
       uid = user.id;
    }

    const creator = await prisma.creatorProfile.upsert({
      where: { userId: uid },
      update: { niche, followers: parseInt(followers || '0'), platform, bio },
      create: { userId: uid, niche, followers: parseInt(followers || '0'), platform, bio }
    });
    res.status(201).json(creator);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register creator' });
  }
});

export default router;
