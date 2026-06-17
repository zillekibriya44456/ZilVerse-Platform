import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

let cachedFreelancers: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// GET /api/freelancers?q=&skills=&minRate=&maxRate=&page=&limit=
router.get('/', async (req: any, res: any) => {
  try {
    const now = Date.now();
    const { q, skills, minRate, maxRate, page, limit } = req.query;
    const pg    = parseInt(page  as string) || 1;
    const take  = parseInt(limit as string) || 30;
    const skip  = (pg - 1) * take;
    const isFiltered = !!(q || skills || minRate || maxRate);

    // Serve cache for unfiltered requests only
    if (!isFiltered && cachedFreelancers && now - lastCacheTime < CACHE_TTL) {
      return res.json(cachedFreelancers);
    }

    const where: any = {};

    // Rate range
    if (minRate || maxRate) {
      where.hourlyRate = {};
      if (minRate) where.hourlyRate.gte = parseFloat(minRate as string);
      if (maxRate) where.hourlyRate.lte = parseFloat(maxRate as string);
    }

    // Skills filter (comma-separated, match any)
    if (skills) {
      const skillList = (skills as string).split(',').map(s => s.trim()).filter(Boolean);
      where.skills = { hasSome: skillList };
    }

    // Full-text search on title/bio via user name
    if (q) {
      where.OR = [
        { title: { contains: q as string, mode: 'insensitive' } },
        { bio:   { contains: q as string, mode: 'insensitive' } },
        { user:  { name: { contains: q as string, mode: 'insensitive' } } },
      ];
    }

    const [freelancers, total] = await Promise.all([
      prisma.freelancerProfile.findMany({
        where,
        include: { user: { select: { name: true, email: true, avatar: true, verified: true } } },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.freelancerProfile.count({ where })
    ]);

    const result = {
      data: freelancers,
      total,
      page: pg,
      totalPages: Math.ceil(total / take),
    };

    if (!isFiltered) {
      cachedFreelancers = result;
      lastCacheTime = now;
    }

    return res.json(result);
  } catch (error) {
    console.error('Freelancers fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch freelancers' });
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
