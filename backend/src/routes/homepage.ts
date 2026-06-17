import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

let cache: any = null;
let lastFetch = 0;
const CACHE_TTL = 30_000; // 30s

// GET /api/homepage/featured
router.get('/featured', async (req: Request, res: Response): Promise<any> => {
  try {
    const now = Date.now();
    if (cache && now - lastFetch < CACHE_TTL) {
      return res.json(cache);
    }

    const [
      featuredFreelancers,
      featuredProjects,
      featuredServices,
      latestJobs,
      topCourses,
      upcomingEvents,
      featuredTestimonials,
      stats,
    ] = await Promise.all([
      // Top freelancers
      prisma.user.findMany({
        where: { role: 'FREELANCER' },
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          verified: true,
          freelancerProfile: {
            select: { title: true, hourlyRate: true, skills: true }
          }
        },
        take: 6,
        orderBy: { createdAt: 'desc' }
      }),

      // Featured Projects
      prisma.project.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          images: true,
          seller: { select: { name: true, avatar: true } }
        }
      }),

      // Top Services (highest rated)
      prisma.digitalService.findMany({
        take: 4,
        orderBy: { rating: 'desc' },
        select: {
          id: true,
          title: true,
          price: true,
          rating: true,
          sales: true,
          category: true,
          seller: { select: { name: true, avatar: true } }
        }
      }),

      // Latest Jobs
      prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          type: true,
          salary: true,
          employer: { select: { name: true, avatar: true } }
        }
      }),

      // Top Courses
      prisma.academyCourse.findMany({
        take: 4,
        orderBy: { students: 'desc' },
        select: {
          id: true,
          title: true,
          instructor: true,
          category: true,
          level: true,
          price: true,
          rating: true,
          students: true,
          image: true
        }
      }),

      // Upcoming Events (sorted by date ascending so next event is first)
      prisma.event.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          type: true,
          date: true,
          location: true,
          description: true,
          category: true,
          isFree: true,
        }
      }),

      // Featured Testimonials (verified, top-rated)
      prisma.testimonial.findMany({
        where: { verified: true },
        orderBy: [{ stars: 'desc' }, { createdAt: 'desc' }],
        take: 6
      }),

      // Stats snapshot
      Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'FREELANCER' } }),
        prisma.job.count(),
        prisma.academyCourse.aggregate({ _sum: { students: true } }),
      ]).then(([users, freelancers, jobs, courseAgg]) => ({
        users,
        freelancers,
        jobs,
        totalStudents: courseAgg._sum.students || 0,
      })),
    ]);

    const result = {
      freelancers: featuredFreelancers,
      projects: featuredProjects,
      services: featuredServices,
      jobs: latestJobs,
      courses: topCourses,
      events: upcomingEvents,
      testimonials: featuredTestimonials,
      stats,
    };

    cache = result;
    lastFetch = now;

    return res.json(result);
  } catch (error) {
    console.error('Error fetching homepage featured content:', error);
    return res.status(500).json({ error: 'Server error fetching featured content' });
  }
});

export default router;
