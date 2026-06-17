import prisma from '../lib/prisma';
import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

let cachedPosts: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 30_000; // 30s

// GET /api/discussions?q=&category=&page=&limit=
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { q, category, page, limit } = req.query;
    const pg   = parseInt(page  as string) || 1;
    const take = parseInt(limit as string) || 50;
    const skip = (pg - 1) * take;
    const isFiltered = !!(q || category);

    // Serve cache for unfiltered first page
    if (!isFiltered && pg === 1 && cachedPosts && Date.now() - lastCacheTime < CACHE_TTL) {
      return res.json(cachedPosts);
    }

    const where: any = {};
    if (category && category !== 'All') where.category = category;
    if (q) {
      where.OR = [
        { title:   { contains: q as string, mode: 'insensitive' } },
        { content: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    const posts = await prisma.discussionPost.findMany({
      where,
      include: {
        author: { select: { name: true, avatar: true, verified: true } },
        replies: {
          include: { author: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    if (!isFiltered && pg === 1) {
      cachedPosts = posts;
      lastCacheTime = Date.now();
    }

    return res.json(posts);
  } catch (error) {
    console.error('Discussions fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch discussions' });
  }
});

// POST /api/discussions/create (auth required)
router.post('/create', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, content, category } = req.body;
    const uid = (req as any).user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized context.' });
    if (!title?.trim() || !content?.trim()) return res.status(400).json({ error: 'Title and content are required.' });

    const post = await prisma.discussionPost.create({
      data: { title: title.trim(), content: content.trim(), category: category || 'General', authorId: uid },
      include: { author: { select: { name: true, avatar: true } } }
    });

    // Invalidate cache
    cachedPosts = null;

    return res.status(201).json(post);
  } catch (error) {
    console.error('Create discussion error:', error);
    return res.status(500).json({ error: 'Failed to create discussion post' });
  }
});

// POST /api/discussions/reply (auth required)
router.post('/reply', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId, content } = req.body;
    const uid = (req as any).user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized context.' });
    if (!content?.trim()) return res.status(400).json({ error: 'Reply content is required.' });

    const existingPost = await prisma.discussionPost.findUnique({ where: { id: String(postId) } });
    if (!existingPost) return res.status(404).json({ error: 'Discussion post not found.' });

    const reply = await prisma.discussionReply.create({
      data: { postId: String(postId), content: content.trim(), authorId: uid },
      include: { author: { select: { name: true, avatar: true } } }
    });

    // Invalidate cache
    cachedPosts = null;

    return res.status(201).json(reply);
  } catch (error) {
    console.error('Reply error:', error);
    return res.status(500).json({ error: 'Failed to submit reply' });
  }
});

// POST /api/discussions/:id/upvote (auth required)
router.post('/:id/upvote', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const post = await prisma.discussionPost.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
      select: { id: true, upvotes: true }
    });
    cachedPosts = null;
    return res.json(post);
  } catch (error) {
    console.error('Upvote error:', error);
    return res.status(500).json({ error: 'Failed to upvote post' });
  }
});

export default router;
