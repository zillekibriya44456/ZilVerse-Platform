import express, { Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// GET /api/innovation — list ideas (public)
router.get('/', async (req: any, res: Response): Promise<any> => {
  try {
    const page  = parseInt(req.query.page  as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { cat, sort } = req.query;

    const where: any = {};
    if (cat && cat !== 'All') where.category = cat;

    const [ideas, total] = await Promise.all([
      prisma.innovationIdea.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        include: {
          creator:     { select: { name: true, avatar: true } },
          votes:       { select: { userId: true, vote: true } },
          teamMembers: { select: { userId: true, role: true, status: true } },
        },
        orderBy: sort === 'new'
          ? { createdAt: 'desc' }
          : { upvotes: 'desc' },
      }),
      prisma.innovationIdea.count({ where }),
    ]);

    // Attach userVote if authenticated
    let userId: string | null = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const d: any = jwt.default.verify(token, process.env.JWT_SECRET || '');
        userId = d.id;
      } catch {}
    }

    const enriched = ideas.map(idea => ({
      ...idea,
      userVote: userId ? (idea.votes.find(v => v.userId === userId)?.vote || 0) : 0,
    }));

    return res.json({ data: enriched, total, page });
  } catch (e) {
    console.error('[Innovation] List error:', e);
    return res.status(500).json({ message: 'Failed to fetch ideas' });
  }
});

// POST /api/innovation — submit new idea
router.post('/', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const { title, description, category, tags } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description required' });

    const idea = await prisma.innovationIdea.create({
      data: {
        title,
        description,
        category:  category || 'Product',
        tags:      JSON.stringify(Array.isArray(tags) ? tags : []),
        creatorId: req.user.id,
      },
      include: {
        creator:     { select: { name: true, avatar: true } },
        teamMembers: { select: { userId: true, role: true, status: true } },
      },
    });

    return res.json(idea);
  } catch (e) {
    console.error('[Innovation] Create error:', e);
    return res.status(500).json({ message: 'Failed to create idea' });
  }
});

// POST /api/innovation/:id/vote — upvote (+1) or downvote (-1)
router.post('/:id/vote', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const { vote } = req.body;
    if (vote !== 1 && vote !== -1) return res.status(400).json({ message: 'Vote must be +1 or -1' });

    const idea = await prisma.innovationIdea.findUnique({ where: { id: req.params.id } });
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (idea.creatorId === req.user.id) return res.status(403).json({ message: 'Cannot vote on your own idea' });

    // Toggle: if same vote exists, remove it; otherwise upsert
    const existing = await prisma.ideaVote.findUnique({
      where: { ideaId_userId: { ideaId: req.params.id, userId: req.user.id } },
    });

    if (existing && existing.vote === vote) {
      // Remove vote
      await prisma.ideaVote.delete({
        where: { ideaId_userId: { ideaId: req.params.id, userId: req.user.id } },
      });
      await prisma.innovationIdea.update({
        where: { id: req.params.id },
        data:  vote === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
      });
    } else {
      // Reverse previous vote if it existed
      if (existing) {
        await prisma.innovationIdea.update({
          where: { id: req.params.id },
          data:  existing.vote === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
        });
      }
      await prisma.ideaVote.upsert({
        where:  { ideaId_userId: { ideaId: req.params.id, userId: req.user.id } },
        create: { ideaId: req.params.id, userId: req.user.id, vote },
        update: { vote },
      });
      await prisma.innovationIdea.update({
        where: { id: req.params.id },
        data:  vote === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
      });
    }

    const updated = await prisma.innovationIdea.findUnique({ where: { id: req.params.id } });
    return res.json(updated);
  } catch (e) {
    console.error('[Innovation] Vote error:', e);
    return res.status(500).json({ message: 'Failed to vote' });
  }
});

// POST /api/innovation/:id/join-team — request to join idea team
router.post('/:id/join-team', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const idea = await prisma.innovationIdea.findUnique({ where: { id: req.params.id } });
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (idea.creatorId === req.user.id) return res.status(403).json({ message: 'You are already the creator' });

    const existing = await prisma.ideaTeamMember.findUnique({
      where: { ideaId_userId: { ideaId: req.params.id, userId: req.user.id } },
    });
    if (existing) return res.status(400).json({ message: 'Already requested to join' });

    const member = await prisma.ideaTeamMember.create({
      data: {
        ideaId: req.params.id,
        userId: req.user.id,
        status: 'PENDING',
      },
    });

    return res.json(member);
  } catch (e) {
    console.error('[Innovation] Join team error:', e);
    return res.status(500).json({ message: 'Failed to request team join' });
  }
});

// PATCH /api/innovation/:id/team/:memberId — accept/reject team request (creator only)
router.patch('/:id/team/:memberId', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const idea = await prisma.innovationIdea.findUnique({ where: { id: req.params.id } });
    if (!idea || idea.creatorId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const { status } = req.body; // ACCEPTED | REJECTED
    const updated = await prisma.ideaTeamMember.update({
      where: { id: req.params.memberId },
      data:  { status },
    });
    return res.json(updated);
  } catch {
    return res.status(500).json({ message: 'Failed to update team member' });
  }
});

// PATCH /api/innovation/:id — update status (creator only)
router.patch('/:id', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const idea = await prisma.innovationIdea.findUnique({ where: { id: req.params.id } });
    if (!idea || idea.creatorId !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const updated = await prisma.innovationIdea.update({
      where: { id: req.params.id },
      data:  { status: req.body.status },
    });
    return res.json(updated);
  } catch {
    return res.status(500).json({ message: 'Failed to update' });
  }
});

export default router;
