import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

let cache: any[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 30_000;

// GET /api/events?type=&q=&limit=
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { type, q, limit } = req.query;
    const take = parseInt(limit as string) || 50;
    const isFiltered = !!(type || q);
    const now = Date.now();

    if (!isFiltered && cache && now - lastFetch < CACHE_TTL) {
      return res.json(cache);
    }

    const where: any = {};
    if (type) where.type = { contains: type as string, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { title:       { contains: q as string, mode: 'insensitive' } },
        { location:    { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take
    });

    if (!isFiltered) {
      cache = events;
      lastFetch = now;
    }

    return res.json(events);
  } catch (error) {
    console.error('Events fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/types — list unique event types
router.get('/types', async (_req: Request, res: Response): Promise<any> => {
  try {
    const types = await prisma.event.findMany({
      select: { type: true },
      distinct: ['type'],
      orderBy: { type: 'asc' }
    });
    return res.json(types.map(t => t.type));
  } catch {
    return res.status(500).json({ error: 'Failed to fetch types' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    return res.json(event);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/events/create
router.post('/create', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, type, date, location, description, category, isFree } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });

    const event = await prisma.event.create({
      data: {
        title:       title.trim(),
        type:        type        || 'Virtual',
        date,
        location:    location    || 'Online',
        description: description || '',
        category:    category    || 'Full Stack',
        isFree:      isFree !== undefined ? Boolean(isFree) : true,
      }
    });

    cache = null; // invalidate cache
    return res.status(201).json(event);
  } catch (error) {
    console.error('Event create error:', error);
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;
