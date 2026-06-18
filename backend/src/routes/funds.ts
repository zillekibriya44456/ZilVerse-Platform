import express from 'express';
import prisma from '../lib/prisma';
import { requireAuth as authenticateToken } from '../middleware/auth';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const router = express.Router();

// ── Pitch upload config ────────────────────────────────────────────────────────
const uploadDir = path.join(process.cwd(), 'uploads', 'pitches');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|doc|docx|ppt|pptx/;
    const extOk  = allowed.test(path.extname(file.originalname).toLowerCase());
    if (extOk) cb(null, true);
    else cb(new Error('Only PDF, Word documents or PowerPoint slides are allowed.'));
  },
});

// Get all fund grants
router.get('/', async (req, res) => {
  try {
    const grants = await prisma.fundGrant.findMany({
      include: {
        creator: { select: { name: true, email: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(grants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fund grants' });
  }
});

// GET /api/funds/investor-matches (authenticated)
router.get('/investor-matches', authenticateToken, async (req: any, res: any) => {
  try {
    const uid = req.user?.id;
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const sectors = user.skills ? user.skills.split(',').map(s => s.trim().toLowerCase()) : [];

    const grants = await prisma.fundGrant.findMany({
      where: {
        status: 'OPEN',
      },
      include: {
        creator: { select: { name: true, email: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const matched = grants.map(grant => {
      let score = 0;
      if (grant.sector && sectors.includes(grant.sector.toLowerCase())) {
        score = 100;
      } else if (grant.sector && sectors.some(s => grant.sector?.toLowerCase().includes(s))) {
        score = 50;
      }
      return { ...grant, matchScore: score };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return res.json(matched);
  } catch (error) {
    console.error('[INVESTOR MATCH ERROR]', error);
    return res.status(500).json({ error: 'Failed to fetch investor matches' });
  }
});

// GET /api/funds/:id
router.get('/:id', async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { id } = req.params as Record<string, string>;
    const grant = await prisma.fundGrant.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true, email: true, avatar: true, headline: true } }
      }
    });
    if (!grant) return res.status(404).json({ error: 'Grant not found' });
    return res.json(grant);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch grant details' });
  }
});

// Post a new grant
router.post('/create', authenticateToken, async (req: any, res: any) => {
  try {
    const { title, organization, amount, description, deadline, website, stage, sector, targetAmount } = req.body;
    
    const uid = req.user?.id;
    if (!uid) {
       return res.status(401).json({ error: 'Unauthorized user context.' });
    }

    const grant = await prisma.fundGrant.create({
      data: {
        title,
        organization,
        amount: String(amount),
        description,
        deadline: deadline || 'Rolling',
        creatorId: uid,
        website: website || null,
        stage: stage || null,
        sector: sector || null,
        targetAmount: targetAmount ? parseFloat(targetAmount) : null,
      }
    });
    return res.status(201).json(grant);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create fund grant' });
  }
});

// POST /api/funds/:id/pitch (authenticated, creator-only)
router.post('/:id/pitch', authenticateToken, upload.single('pitch'), async (req: any, res: any) => {
  try {
    const { id } = req.params as Record<string, string>;
    const uid = req.user?.id;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const grant = await prisma.fundGrant.findUnique({ where: { id } });
    if (!grant) return res.status(404).json({ error: 'Grant/Pitch not found.' });
    if (grant.creatorId !== uid) return res.status(403).json({ error: 'Forbidden: You do not own this grant listing.' });

    const relativePath = `/uploads/pitches/${req.file.filename}`;
    const updated = await prisma.fundGrant.update({
      where: { id },
      data: { pitchDeck: relativePath }
    });

    return res.json(updated);
  } catch (error) {
    console.error('[PITCH DECK UPLOAD ERROR]', error);
    return res.status(500).json({ error: 'Failed to upload pitch deck' });
  }
});

// POST /api/funds/:id/interest (authenticated)
router.post('/:id/interest', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params as Record<string, string>;
    const uid = req.user?.id;
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const grant = await prisma.fundGrant.findUnique({ where: { id } });
    if (!grant) return res.status(404).json({ error: 'Grant/Pitch not found.' });

    const updated = await prisma.fundGrant.update({
      where: { id },
      data: { investorId: uid }
    });

    const io = req.app.get('io');
    if (io) {
      io.emit(`notification:${grant.creatorId}`, {
        title: 'Investor Interest Received',
        message: `Investor ${user.name || 'Anonymous'} has expressed interest in your pitch: ${grant.title}`,
        type: 'alert',
        link: `/fund`
      });
    }

    await prisma.notification.create({
      data: {
        userId: grant.creatorId,
        title: 'Investor Interest Received',
        message: `Investor ${user.name || 'Anonymous'} has expressed interest in your pitch: ${grant.title}`,
        type: 'alert',
        link: `/fund`
      }
    });

    return res.json({ success: true, grant: updated });
  } catch (error) {
    console.error('[EXPRESS INTEREST ERROR]', error);
    return res.status(500).json({ error: 'Failed to express interest' });
  }
});

export default router;
