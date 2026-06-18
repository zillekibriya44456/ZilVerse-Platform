import express, { Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Seeded certification data (used if DB is empty)
const SEED_CERTS = [
  { title: 'Full-Stack Web Development', provider: 'ZilVerse Academy', category: 'Technology', level: 'Intermediate', duration: '12 weeks' },
  { title: 'React & Next.js Mastery',    provider: 'ZilVerse Academy', category: 'Technology', level: 'Advanced',     duration: '8 weeks'  },
  { title: 'UI/UX Design Fundamentals',  provider: 'ZilVerse Academy', category: 'Design',     level: 'Beginner',     duration: '6 weeks'  },
  { title: 'Data Science with Python',   provider: 'ZilVerse Academy', category: 'Data',       level: 'Intermediate', duration: '10 weeks' },
  { title: 'Digital Marketing Mastery',  provider: 'ZilVerse Academy', category: 'Marketing',  level: 'Beginner',     duration: '4 weeks'  },
  { title: 'Cloud Computing (AWS)',       provider: 'ZilVerse Academy', category: 'Cloud',      level: 'Advanced',     duration: '8 weeks'  },
  { title: 'Mobile App Development',     provider: 'ZilVerse Academy', category: 'Technology', level: 'Intermediate', duration: '10 weeks' },
  { title: 'Freelancing Fundamentals',   provider: 'ZilVerse Academy', category: 'Business',   level: 'Beginner',     duration: '3 weeks'  },
  { title: 'AI & Machine Learning',      provider: 'ZilVerse Academy', category: 'AI',         level: 'Advanced',     duration: '12 weeks' },
  { title: 'Cybersecurity Essentials',   provider: 'ZilVerse Academy', category: 'Security',   level: 'Intermediate', duration: '6 weeks'  },
  { title: 'Startup & Entrepreneurship', provider: 'ZilVerse Academy', category: 'Business',   level: 'Beginner',     duration: '5 weeks'  },
  { title: 'Blockchain Development',     provider: 'ZilVerse Academy', category: 'Technology', level: 'Advanced',     duration: '8 weeks'  },
];

// GET /api/certifications — list all with user progress if logged in
router.get('/', async (req: any, res: Response): Promise<any> => {
  try {
    let certs = await prisma.certification.findMany({ orderBy: { category: 'asc' } });

    // Auto-seed if empty
    if (certs.length === 0) {
      await prisma.certification.createMany({ data: SEED_CERTS });
      certs = await prisma.certification.findMany({ orderBy: { category: 'asc' } });
    }

    // If authenticated, attach user progress
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || '');
        const userCerts = await prisma.userCertification.findMany({
          where: { userId: decoded.id },
          select: { certificationId: true, progress: true, status: true, completedAt: true },
        });
        const progressMap = Object.fromEntries(userCerts.map(uc => [uc.certificationId, uc]));
        return res.json(certs.map(c => ({ ...c, userProgress: progressMap[c.id] || null })));
      } catch {}
    }

    return res.json(certs.map(c => ({ ...c, userProgress: null })));
  } catch (e) {
    return res.status(500).json({ message: 'Failed to fetch certifications' });
  }
});

// GET /api/certifications/my — user's saved certifications
router.get('/my', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const data = await prisma.userCertification.findMany({
      where:   { userId: req.user.id },
      include: { certification: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(data);
  } catch { return res.status(500).json({ message: 'Failed to fetch' }); }
});

// POST /api/certifications/:id/enroll — enroll in a cert
router.post('/:id/enroll', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const existing = await prisma.userCertification.findUnique({
      where: { userId_certificationId: { userId: req.user.id, certificationId: req.params.id } },
    });
    if (existing) return res.json(existing);

    const data = await prisma.userCertification.create({
      data: { userId: req.user.id, certificationId: req.params.id, progress: 0, status: 'IN_PROGRESS' },
      include: { certification: true },
    });
    return res.json(data);
  } catch { return res.status(500).json({ message: 'Failed to enroll' }); }
});

// PATCH /api/certifications/:id/progress — update progress
router.patch('/:id/progress', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const { progress } = req.body;
    const pct = Math.min(100, Math.max(0, parseInt(progress) || 0));
    const status    = pct >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
    const completedAt = pct >= 100 ? new Date() : null;

    const data = await prisma.userCertification.update({
      where: { userId_certificationId: { userId: req.user.id, certificationId: req.params.id } },
      data:  { progress: pct, status, completedAt },
      include: { certification: true },
    });
    return res.json(data);
  } catch { return res.status(500).json({ message: 'Failed to update progress' }); }
});

// DELETE /api/certifications/:id/unenroll
router.delete('/:id/unenroll', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    await prisma.userCertification.delete({
      where: { userId_certificationId: { userId: req.user.id, certificationId: req.params.id } },
    });
    return res.json({ success: true });
  } catch { return res.status(500).json({ message: 'Failed to unenroll' }); }
});

// POST /api/certifications — admin create cert
router.post('/', requireAdmin, async (req: any, res: Response): Promise<any> => {
  try {
    const data = await prisma.certification.create({ data: req.body });
    return res.json(data);
  } catch { return res.status(500).json({ message: 'Failed to create' }); }
});

export default router;
