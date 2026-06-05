import prisma from '../lib/prisma';
import express from 'express';

import { authenticateToken } from '../middleware/auth';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const posts = await prisma.discussionPost.findMany({
      include: { 
        author: { select: { name: true, avatar: true } },
        replies: {
          include: { author: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const uid = (req as any).user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized context.' });

    const post = await prisma.discussionPost.create({
      data: { title, content, category, authorId: uid }
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create discussion post' });
  }
});

// Reply to a discussion post
router.post('/reply', authenticateToken, async (req, res) => {
  try {
    const { postId, content } = req.body;
    const uid = (req as any).user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized context.' });

    const existingPost = await prisma.discussionPost.findUnique({
      where: { id: String(postId) }
    });

    if (!existingPost) {
      return res.status(404).json({ error: 'Discussion post not found.' });
    }

    const reply = await prisma.discussionReply.create({
      data: {
        postId: String(postId),
        content,
        authorId: uid
      }
    });
    res.status(201).json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit reply' });
  }
});

export default router;
