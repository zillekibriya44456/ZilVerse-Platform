import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/homepage/featured
router.get('/featured', async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Featured Freelancers (top rated or latest)
    const featuredFreelancers = await prisma.user.findMany({
      where: { role: 'FREELANCER' },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        freelancerProfile: {
          select: {
            title: true,
            hourlyRate: true,
            skills: true
          }
        }
      },
      take: 4,
      orderBy: { createdAt: 'desc' }
    });

    // 2. Featured Projects
    const featuredProjects = await prisma.project.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        seller: {
          select: { name: true, avatar: true }
        }
      }
    });

    // 3. Featured Services
    const featuredServices = await prisma.digitalService.findMany({
      take: 3,
      orderBy: { rating: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        rating: true,
        sales: true,
        category: true,
        seller: {
          select: { name: true, avatar: true }
        }
      }
    });

    return res.json({
      freelancers: featuredFreelancers,
      projects: featuredProjects,
      services: featuredServices
    });
  } catch (error) {
    console.error('Error fetching homepage featured content:', error);
    return res.status(500).json({ error: 'Server error fetching featured content' });
  }
});

export default router;
