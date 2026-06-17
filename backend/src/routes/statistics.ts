import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { eventBus } from '../utils/eventBus';

const router = express.Router();

let cachedStats: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds

async function fetchLiveStatistics() {
  try {
    const jobsWithLocations = await prisma.job.findMany({ select: { location: true }, distinct: ['location'] });
    const coursesWithCountries = await prisma.academyCourse.findMany({ select: { countryCode: true }, distinct: ['countryCode'] });
    const countriesCount = new Set([...jobsWithLocations.map(j => j.location), ...coursesWithCountries.map((c: any) => c.countryCode)]).size;

    const usersCount = await prisma.user.count();
    const freelancersCount = await prisma.user.count({ where: { role: 'FREELANCER' } });
    const projectsSold = await prisma.transaction.count({ where: { status: 'COMPLETED', type: 'ESCROW_RELEASE' } });
    const jobsPosted = await prisma.job.count();

    const revenueResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' }
    });
    const revenue = revenueResult._sum.amount || 0;

    const serviceRatings = await prisma.digitalService.aggregate({ _avg: { rating: true }, _count: { rating: true } });
    const avgRating = serviceRatings._avg.rating || 5.0;
    const satisfaction = Math.min(100, Math.round((avgRating / 5) * 100));

    return {
      countries: countriesCount,
      users: usersCount,
      freelancers: freelancersCount,
      projectsSold: projectsSold,
      jobsPosted: jobsPosted,
      revenue: revenue,
      satisfaction: satisfaction
    };
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return null;
  }
}

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

router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

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

  const onUpdate = async () => {
    const stats = await fetchLiveStatistics();
    if (stats) {
      cachedStats = stats;
      lastFetchTime = Date.now();
      res.write(`data: ${JSON.stringify(stats)}\n\n`);
    }
  };

  // Heartbeat every 25s to keep proxy/browser alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25_000);

  eventBus.on('stats_updated', onUpdate);

  req.on('close', () => {
    clearInterval(heartbeat);
    eventBus.off('stats_updated', onUpdate);
    res.end();
  });
});

export default router;
