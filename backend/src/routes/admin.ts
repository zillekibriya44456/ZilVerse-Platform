import express from 'express';
import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@zilverse.com';
const ADMIN_PASSWORD = 'Zil@Admin2026';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing.");
}

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password, totpCode } = req.body;
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Simple 2FA: code must equal '2FA26' for demo
  if (totpCode !== '2FA26') {
    return res.status(401).json({ error: 'Invalid 2FA code' });
  }
  const token = jwt.sign({ role: 'super_admin', email }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, role: 'super_admin' });
});

// Middleware
const adminAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'super_admin') return res.status(403).json({ error: 'Forbidden' });
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Global Stats
router.get('/stats', adminAuth, async (req: any, res: any) => {
  try {
    const [
      users,
      projects,
      jobs,
      services,
      reels,
      discussions,
      activeFreelancers,
      depositsSum
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.job.count(),
      prisma.digitalService.count(),
      prisma.reel.count(),
      prisma.discussionPost.count(),
      prisma.freelancerProfile.count(),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'DEPOSIT', status: 'COMPLETED' }
      })
    ]);

    const totalRev = depositsSum._sum.amount || 0.0;

    // Calculate real growth rate based on users signed up in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    const growthPercent = users > 0 ? ((newUsersLast30Days / users) * 100).toFixed(1) : '0.0';

    // Get live Socket.io visitors
    const io = req.app.get('io');
    const liveSocketCount = io ? io.sockets.sockets.size : 0;
    const liveVisitors = Math.max(1, liveSocketCount); // minimum 1 (admin session itself)

    // Calculate server uptime
    const uptimeSec = process.uptime();
    const hrs = Math.floor(uptimeSec / 3600);
    const mins = Math.floor((uptimeSec % 3600) / 60);
    const uptimeStr = `${hrs}h ${mins}m`;

    res.json({
      totalUsers: users,
      totalProjects: projects,
      totalJobs: jobs,
      totalServices: services,
      totalReels: reels,
      totalDiscussions: discussions,
      liveVisitors,
      activeFreelancers,
      monthlyGrowth: `+${growthPercent}%`,
      totalRevenue: `$${totalRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      serverStatus: 'Healthy',
      uptime: uptimeStr,
    });
  } catch (error) {
    console.error('[ADMIN STATS FETCH ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// All Users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete User
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// All Projects
router.get('/projects', adminAuth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { seller: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Contact Messages
router.get('/contacts', adminAuth, async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Public: get active notifications (no auth needed - all visitors see this)
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await prisma.globalNotification.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    res.json(notifications);
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Admin: Send and save global notification
router.post('/notify', adminAuth, async (req, res) => {
  const { title, message, type } = req.body;
  try {
    const notification = await prisma.globalNotification.create({
      data: { title, message, type: type || 'announcement' }
    });
    const io = req.app.get('io');
    if (io) {
      io.emit('new_notification', notification);
    }
    res.json({ success: true, notification });
  } catch {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Admin: Dismiss/deactivate a notification
router.delete('/notifications/:id', adminAuth, async (req, res) => {
  try {
    await prisma.globalNotification.update({
      where: { id: req.params.id },
      data: { active: false }
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to dismiss notification' });
  }
});

export default router;
