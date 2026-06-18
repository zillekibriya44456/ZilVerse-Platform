import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

const INITIAL_TESTIMONIALS = [
  { stars: 5, text: "Got my e-commerce site built within a week! The team was professional and delivered exactly what I needed.", name: "Rahul Kapoor", role: "Buyer · Retail Business Owner, Delhi", initials: "RK", color: "#3b82f6", avatar: "/avatars/avatar_1.png", verified: true },
  { stars: 5, text: "Sold 3 of my source code projects within the first month. The marketplace is clean, buyers are real. Best platform for student devs.", name: "Anjali Joshi", role: "Seller · CSE Student, Pune", initials: "AJ", color: "#10b981", avatar: "/avatars/hr_female.png", verified: true },
  { stars: 5, text: "As a freelancer, I've landed 5 clients through ZilVerse in 2 months. My income doubled this quarter!", name: "Mohammed Hassan", role: "Freelancer · Full-Stack Dev, Hyderabad", initials: "MH", color: "#a855f7", avatar: "/avatars/avatar_2.png", verified: true },
  { stars: 5, text: "Found a hospital management system for my final year project with full documentation and viva support. Absolute lifesaver!", name: "Priya Sharma", role: "Buyer · BCA Student, Bengaluru", initials: "PS", color: "#f59e0b", avatar: "/avatars/hr_1.png", verified: true },
  { stars: 5, text: "Hired a React developer within 24 hours for my startup MVP. The quality was excellent. ZilVerse saved me weeks of searching.", name: "Zara Noor", role: "Buyer · Startup Founder, Dubai", initials: "ZN", color: "#ef4444", avatar: "/avatars/hr_2.png", verified: true },
  { stars: 5, text: "The job board helped me find a remote internship in under a week. The interface is clean and applying is super simple!", name: "Karan Patel", role: "Jobseeker · IT Graduate, Mumbai", initials: "KP", color: "#ec4899", avatar: "/avatars/hr_male.png", verified: true },
];

let cachedTestimonials: any = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

// GET /api/testimonials?verified=true
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const now = Date.now();
    const onlyVerified = req.query.verified === 'true';

    if (!onlyVerified && cachedTestimonials && now - lastCacheTime < CACHE_TTL) {
      return res.json(cachedTestimonials);
    }

    let testimonials = await prisma.testimonial.findMany({
      ...(onlyVerified ? { where: { verified: true } } : {}),
      orderBy: [{ stars: 'desc' }, { createdAt: 'desc' }],
      take: 20
    });

    if (testimonials.length === 0) {
      await prisma.testimonial.createMany({ data: INITIAL_TESTIMONIALS });
      testimonials = await prisma.testimonial.findMany({
        ...(onlyVerified ? { where: { verified: true } } : {}),
        orderBy: [{ stars: 'desc' }, { createdAt: 'desc' }],
        take: 20
      });
    }

    if (!onlyVerified) {
      cachedTestimonials = testimonials;
      lastCacheTime = now;
    }

    return res.json(testimonials);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching testimonials' });
  }
});

// GET /api/testimonials/featured — verified only, max 6, for homepage
router.get('/featured', async (_req: Request, res: Response): Promise<any> => {
  try {
    const now = Date.now();
    if (cachedTestimonials && now - lastCacheTime < CACHE_TTL) {
      const featured = cachedTestimonials.filter((t: any) => t.verified).slice(0, 6);
      return res.json(featured);
    }

    const testimonials = await prisma.testimonial.findMany({
      where: { verified: true },
      orderBy: [{ stars: 'desc' }, { createdAt: 'desc' }],
      take: 6
    });

    if (testimonials.length === 0) {
      // Seed and return initials (all verified)
      await prisma.testimonial.createMany({ data: INITIAL_TESTIMONIALS });
      const seeded = await prisma.testimonial.findMany({
        orderBy: [{ stars: 'desc' }],
        take: 6
      });
      return res.json(seeded);
    }

    return res.json(testimonials);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching featured testimonials' });
  }
});


// POST a new testimonial
router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { stars, text, name, role, avatar } = req.body;

    if (!text || !name || !role) {
      return res.status(400).json({ error: 'Please provide feedback message, your name, and your role.' });
    }

    const initials = name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U';

    const colors = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)] as string;

    const newTestimonial = await prisma.testimonial.create({
      data: {
        stars: stars ? parseInt(stars) : 5,
        text,
        name,
        role,
        initials,
        color: randomColor,
        avatar: avatar || null,
        verified: false // Unverified until admin approves
      }
    });

    // Invalidate cache
    cachedTestimonials = null;

    res.status(201).json(newTestimonial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating testimonial' });
  }
});

export default router;
