import prisma from '../lib/prisma';
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadVideo, getFileUrl } from '../config/cloudinary';

const router = Router();

let cachedProjects: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

// GET /api/projects?q=&category=&minPrice=&maxPrice=&page=&limit=&sort=
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { q, category, minPrice, maxPrice, page, limit, sort } = req.query;
    const pg   = parseInt(page  as string) || 1;
    const take = parseInt(limit as string) || 30;
    const skip = (pg - 1) * take;
    const isFiltered = !!(q || category || minPrice || maxPrice);

    if (!isFiltered && pg === 1 && cachedProjects && Date.now() - lastCacheTime < CACHE_TTL) {
      return res.json(cachedProjects);
    }

    const where: any = {};
    if (category && category !== 'All') where.category = { contains: category as string, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }
    if (q) {
      where.OR = [
        { title:       { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    // Sort ordering
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'Price: Low to High') orderBy = { price: 'asc' };
    if (sort === 'Price: High to Low') orderBy = { price: 'desc' };
    if (sort === 'Popular') orderBy = [{ sales: 'desc' }, { rating: 'desc' }];

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          seller: { select: { name: true, email: true, avatar: true, verified: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.project.count({ where }),
    ]);

    const result = { data: projects, total, page: pg, totalPages: Math.ceil(total / take) };

    if (!isFiltered && pg === 1) {
      cachedProjects = result;
      lastCacheTime = Date.now();
    }

    return res.json(result);
  } catch (error) {
    console.error('[PROJECT FETCH ERROR]', error);
    return res.status(500).json({ message: 'Server error fetching projects' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { seller: { select: { name: true, email: true, avatar: true, verified: true } } },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    return res.json(project);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects (auth required)
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description, price, videoUrl, category } = req.body;
    const sellerId = (req as any).user?.id;

    if (!sellerId) return res.status(401).json({ error: 'Unauthorized user context.' });
    if (!title || !description || isNaN(parseFloat(price))) {
      return res.status(400).json({ error: 'Missing required project attributes or invalid price.' });
    }

    const newProject = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category || 'Software',
        sellerId,
        videoUrl: videoUrl || null,
      },
    });

    // Invalidate cache
    cachedProjects = null;

    return res.status(201).json(newProject);
  } catch (error) {
    console.error('[PROJECT CREATE ERROR]', error);
    return res.status(500).json({ message: 'Server error creating project' });
  }
});

// POST /api/projects/upload-video (authenticated)
router.post('/upload-video', authenticateToken, uploadVideo.single('video'), async (req: any, res: Response): Promise<any> => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file provided.' });
    const videoUrl = getFileUrl(req.file);
    return res.status(200).json({ videoUrl });
  } catch (error) {
    console.error('[PROJECT VIDEO UPLOAD ERROR]', error);
    return res.status(500).json({ error: 'Failed to upload demo video.' });
  }
});

export default router;
