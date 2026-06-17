import prisma from '../lib/prisma';
import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

let cache: any[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 30_000;

// GET /api/academy?category=&level=&limit=&q=
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { category, level, limit, q } = req.query;
    const take = parseInt(limit as string) || 50;

    // Use cache only for unfiltered requests
    const isFiltered = !!(category || level || q);
    const now = Date.now();

    if (!isFiltered && cache && now - lastFetch < CACHE_TTL) {
      return res.json(cache);
    }

    const where: any = {};
    if (category)           where.category = { contains: category as string, mode: 'insensitive' };
    if (level)              where.level    = { contains: level    as string, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { title:      { contains: q as string, mode: 'insensitive' } },
        { instructor: { contains: q as string, mode: 'insensitive' } },
        { category:   { contains: q as string, mode: 'insensitive' } },
      ];
    }

    const courses = await prisma.academyCourse.findMany({
      where,
      orderBy: { students: 'desc' },
      take
    });

    if (!isFiltered) {
      cache = courses;
      lastFetch = now;
    }

    return res.json(courses);
  } catch (error) {
    console.error('Academy fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/academy/categories — list unique categories
router.get('/categories', async (_req: Request, res: Response): Promise<any> => {
  try {
    const cats = await prisma.academyCourse.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });
    return res.json(cats.map(c => c.category));
  } catch {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/academy/:id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const course = await prisma.academyCourse.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    return res.json(course);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// POST /api/academy/create
router.post('/create', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, instructor, level, duration, description, price, countryCode, language, category, students, rating, image } = req.body;
    if (!title || !instructor) return res.status(400).json({ error: 'Title and instructor are required' });

    const course = await prisma.academyCourse.create({
      data: {
        title,
        instructor,
        level:       level       || 'Beginner',
        duration:    duration    || '1 Hour',
        description: description || '',
        price:       parseFloat(price || '0'),
        countryCode: countryCode || 'US',
        language:    language    || 'English',
        category:    category    || 'Development',
        students:    parseInt(students || '0', 10),
        rating:      parseFloat(rating || '5.0'),
        image:       image || '/avatars/avatar_1.png'
      }
    });

    cache = null; // invalidate cache
    return res.status(201).json(course);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create course' });
  }
});

export default router;
