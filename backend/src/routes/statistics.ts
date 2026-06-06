import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { eventBus } from '../utils/eventBus';

const router = express.Router();

// Cache variables
let cachedStats: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds

async function fetchLiveStatistics() {
  try {
    // 1. Countries (Since User doesn't have countryCode yet, we count distinct locations in Jobs and Courses as a proxy for global reach, or just return real registered users count as proxy if needed. Actually we'll count unique locations in jobs as proxy)
    const jobsWithLocations = await prisma.job.findMany({ select: { location: true }, distinct: ['location'] });
    const coursesWithCountries = await prisma.academyCourse.findMany({ select: { countryCode: true }, distinct: ['countryCode'] });
    const uniqueCountriesCount = Math.max(1, new Set([...jobsWithLocations.map(j => j.location), ...coursesWithCountries.map((c: any) => c.countryCode)]).size);

    // 2. Freelancers
    const freelancersCount = await prisma.user.count({
      where: { role: 'FREELANCER' }
    });

    // 3. Projects Sold
    const projectsSold = await prisma.transaction.count({
      where: { status: 'COMPLETED' }
    });

    // 4. Jobs Posted
    const jobsPosted = await prisma.job.count();

    // 5. Satisfaction
    const serviceRatings = await prisma.digitalService.aggregate({ _avg: { rating: true } });
    const avgRating = serviceRatings._avg.rating || 5.0;
    const satisfaction = Math.min(100, Math.round((avgRating / 5) * 100));

    return {
      countries: uniqueCountriesCount,
      freelancers: freelancersCount,
      projectsSold: projectsSold,
      jobsPosted: jobsPosted,
      satisfaction: satisfaction
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return null;
  }
}

// Get standard stats
router.get('/', async (req: Request, res: Response) => {
  const now = Date.now();
  if (cachedStats && now - lastFetchTime < CACHE_TTL) {
    return res.json(cachedStats);
  }

  const stats = await fetchLiveStatistics();
  if (stats) {
    cachedStats = stats;
    lastFetchTime = now;
    return res.json(stats);
  } else {
    return res.status(500).json({ error: "Database unavailable" });
  }
});

// SSE Stream for Real-Time Updates
router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial data immediately
  if (cachedStats) {
    res.write(`data: ${JSON.stringify(cachedStats)}\n\n`);
  } else {
    fetchLiveStatistics().then(stats => {
      if (stats) {
        cachedStats = stats;
        lastFetchTime = Date.now();
        res.write(`data: ${JSON.stringify(stats)}\n\n`);
      }
    });
  }

  // Listen to event bus for updates
  const onUpdate = async () => {
    const stats = await fetchLiveStatistics();
    if (stats) {
      cachedStats = stats;
      lastFetchTime = Date.now();
      res.write(`data: ${JSON.stringify(stats)}\n\n`);
    }
  };

  eventBus.on('stats_updated', onUpdate);

  req.on('close', () => {
    eventBus.off('stats_updated', onUpdate);
  });
});

export default router;
