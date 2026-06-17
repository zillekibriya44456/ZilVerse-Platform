import prisma from '../lib/prisma';
import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

let cachedServices: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute (services change infrequently)

// GET /api/services?q=&category=&page=&limit=
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { q, category, page, limit } = req.query;
    const pg   = parseInt(page  as string) || 1;
    const take = parseInt(limit as string) || 50;
    const skip = (pg - 1) * take;
    const isFiltered = !!(q || category);

    if (!isFiltered && pg === 1 && cachedServices && Date.now() - lastCacheTime < CACHE_TTL) {
      return res.json(cachedServices);
    }

    const where: any = {};
    if (category) where.category = { contains: category as string, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { title:       { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { category:    { contains: q as string, mode: 'insensitive' } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.digitalService.findMany({
        where,
        include: { seller: { select: { name: true, avatar: true, verified: true } } },
        orderBy: [{ rating: 'desc' }, { sales: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      prisma.digitalService.count({ where }),
    ]);

    const result = { data: services, total, page: pg, totalPages: Math.ceil(total / take) };

    if (!isFiltered && pg === 1) {
      cachedServices = result;
      lastCacheTime = Date.now();
    }

    return res.json(result);
  } catch (error) {
    console.error('Services fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/services/categories — distinct category list
router.get('/categories', async (_req: Request, res: Response): Promise<any> => {
  try {
    const rows = await prisma.digitalService.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return res.json(rows.map(r => r.category).filter(Boolean));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/services/create (auth required)
router.post('/create', authenticateToken, async (req: any, res: any) => {
  try {
    const { title, description, price, category, deliveryTime } = req.body;
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized user context.' });
    if (!title || !description || isNaN(parseFloat(price))) {
      return res.status(400).json({ error: 'Title, description, and valid price are required.' });
    }

    const service = await prisma.digitalService.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category || 'Software',
        deliveryTime: deliveryTime || '3 Days',
        sellerId: uid,
      },
    });

    // Invalidate cache
    cachedServices = null;

    return res.status(201).json(service);
  } catch (error) {
    console.error('Service create error:', error);
    return res.status(500).json({ error: 'Failed to create digital service' });
  }
});

// POST /api/services/quote
router.post('/quote', async (req: Request, res: Response): Promise<any> => {
  try {
    const { serviceTitle, name, email, phone, company, budget, message, status } = req.body;
    if (!serviceTitle || !name || !email || !message) {
      return res.status(400).json({ error: 'serviceTitle, name, email, and message are required.' });
    }

    const quote = await prisma.serviceQuote.create({
      data: {
        serviceTitle,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone || null,
        company: company || null,
        budget: budget || null,
        message: message.trim(),
        status: status || 'PENDING',
      },
    });

    return res.status(201).json(quote);
  } catch (error) {
    console.error('Quote error:', error);
    return res.status(500).json({ error: 'Failed to submit quote request' });
  }
});

// GET /api/services/quotes (admin)
router.get('/quotes', async (_req: Request, res: Response): Promise<any> => {
  try {
    const quotes = await prisma.serviceQuote.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(quotes);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

export default router;
