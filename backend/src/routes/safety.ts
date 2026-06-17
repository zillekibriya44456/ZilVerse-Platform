import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { createNotification } from './notifications';

const router = Router();

// ── POST /api/safety/report ───────────────────────────────────────────────────
router.post('/report', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const reporterId     = (req as any).user.id;
    const { reportedUserId, reason, details } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ message: 'reportedUserId and reason are required' });
    }
    if (reporterId === reportedUserId) {
      return res.status(400).json({ message: 'Cannot report yourself' });
    }

    // Check target exists
    const target = await prisma.user.findUnique({ where: { id: reportedUserId } });
    if (!target) return res.status(404).json({ message: 'User not found' });

    // Prevent duplicate open reports
    const existing = await prisma.userReport.findFirst({
      where: { reporterId, reportedUserId, status: 'PENDING' },
    });
    if (existing) {
      return res.status(409).json({ message: 'You already have a pending report for this user' });
    }

    const report = await prisma.userReport.create({
      data: { reporterId, reportedUserId, reason, details: details || '' },
    });

    // Reduce trust score of reported user (soft signal)
    await prisma.user.update({
      where: { id: reportedUserId },
      data:  { trustScore: { decrement: 5 } },
    });

    res.status(201).json({ message: 'Report submitted', reportId: report.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/safety/reports (admin) ──────────────────────────────────────────
router.get('/reports', requireAdmin, async (req: Request, res: Response): Promise<any> => {
  try {
    const status = req.query.status as string || 'PENDING';
    const page   = parseInt(req.query.page as string) || 1;
    const limit  = 20;

    const [reports, total] = await prisma.$transaction([
      prisma.userReport.findMany({
        where:   status === 'ALL' ? {} : { status },
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
        include: {
          reporter:     { select: { id: true, name: true, email: true, avatar: true } },
          reportedUser: { select: { id: true, name: true, email: true, avatar: true, trustScore: true, isBanned: true, isSuspended: true } },
        },
      }),
      prisma.userReport.count({ where: status === 'ALL' ? {} : { status } }),
    ]);

    res.json({ data: reports, total, page });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/safety/reports/:id/review (admin) ───────────────────────────────
router.post('/reports/:id/review', requireAdmin, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body; // REVIEWED | DISMISSED | ACTION_TAKEN
    await prisma.userReport.update({ where: { id }, data: { status, adminNote } });
    res.json({ message: 'Report updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/safety/block ────────────────────────────────────────────────────
router.post('/block', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const blockerId  = (req as any).user.id;
    const { blockedId } = req.body;

    if (blockerId === blockedId) return res.status(400).json({ message: 'Cannot block yourself' });

    const target = await prisma.user.findUnique({ where: { id: blockedId } });
    if (!target) return res.status(404).json({ message: 'User not found' });

    await prisma.block.upsert({
      where:  { blockerId_blockedId: { blockerId, blockedId } },
      update: {},
      create: { blockerId, blockedId },
    });

    res.json({ message: `${target.name} has been blocked` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE /api/safety/block/:blockedId ──────────────────────────────────────
router.delete('/block/:blockedId', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const blockerId  = (req as any).user.id;
    const { blockedId } = req.params;
    await prisma.block.deleteMany({ where: { blockerId, blockedId } });
    res.json({ message: 'User unblocked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/safety/blocks ────────────────────────────────────────────────────
router.get('/blocks', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const blockerId = (req as any).user.id;
    const blocks = await prisma.block.findMany({
      where:   { blockerId },
      include: { blocked: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/safety/admin/suspend/:userId ────────────────────────────────────
router.post('/admin/suspend/:userId', requireAdmin, async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const io = req.app.get('io');

    await prisma.user.update({
      where: { id: userId },
      data:  { isSuspended: true, suspendedReason: reason || 'Violation of terms' },
    });

    // Revoke all active sessions
    await prisma.userSession.updateMany({ where: { userId }, data: { isRevoked: true } });

    // Notify user
    await createNotification(userId, 'Account Suspended', `Your account has been suspended: ${reason || 'Terms violation'}`, 'system', { io });

    // Force disconnect socket
    if (io) io.to(userId).emit('account_suspended', { reason });

    res.json({ message: 'User suspended' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/safety/admin/ban/:userId ───────────────────────────────────────
router.post('/admin/ban/:userId', requireAdmin, async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const io = req.app.get('io');

    await prisma.user.update({
      where: { id: userId },
      data:  { isBanned: true, trustScore: 0, suspendedReason: reason || 'Permanent ban' },
    });

    await prisma.userSession.updateMany({ where: { userId }, data: { isRevoked: true } });

    if (io) io.to(userId).emit('account_banned', { reason });

    res.json({ message: 'User banned' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/safety/admin/restore/:userId ────────────────────────────────────
router.post('/admin/restore/:userId', requireAdmin, async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const io = req.app.get('io');
    await prisma.user.update({
      where: { id: userId },
      data:  { isBanned: false, isSuspended: false, suspendedReason: null, trustScore: 100 },
    });
    await createNotification(userId, 'Account Restored', 'Your account has been restored. Welcome back!', 'system', { io });
    res.json({ message: 'User restored' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/safety/admin/users (admin — fraud dashboard) ────────────────────
router.get('/admin/users', requireAdmin, async (req: Request, res: Response): Promise<any> => {
  try {
    const page  = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const filter = req.query.filter as string; // banned | suspended | low-trust

    const where: any = {};
    if (filter === 'banned')    where.isBanned    = true;
    if (filter === 'suspended') where.isSuspended = true;
    if (filter === 'low-trust') where.trustScore  = { lt: 50 };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy: { trustScore: 'asc' },
        skip:    (page - 1) * limit,
        take:    limit,
        select:  { id: true, name: true, email: true, avatar: true, trustScore: true, isBanned: true, isSuspended: true, suspendedReason: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ data: users, total, page });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
