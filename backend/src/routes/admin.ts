import prisma from '../lib/prisma';
import express from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

const router = express.Router();


const ADMIN_EMAIL = 'admin@zilverse.com';
const ADMIN_PASSWORD = 'Zil@Admin2026';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is missing.');

// ─── Auth ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password, totpCode } = req.body;
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Invalid credentials' });
  if (totpCode !== '2FA26')
    return res.status(401).json({ error: 'Invalid 2FA code' });
  const token = jwt.sign({ role: 'super_admin', email }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, role: 'super_admin' });
});

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

// ─── MASTER STATS (all real DB) ───────────────────────────────────────────────
router.get('/stats', adminAuth, async (req: any, res: any) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const last30 = new Date(now); last30.setDate(now.getDate() - 30);

    const [
      totalUsers, todayUsers, monthlyUsers,
      totalFreelancers, totalJobs, totalProjects, totalServices, totalReels,
      totalDiscussions, totalApplications, totalInterviews, totalMessages,
      totalResearch, totalTransactions,
      todayRevRaw, weekRevRaw, monthRevRaw, yearRevRaw, totalRevRaw,
      escrowHeld, pendingPayouts, completedPayouts,
      openDisputes, pendingWithdrawals,
      recentUsers, recentJobs, recentApps, recentTxns,
      reelLikes, reelComments, follows,
      newUsersLast30,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.freelancerProfile.count(),
      prisma.job.count(),
      prisma.project.count(),
      prisma.digitalService.count(),
      prisma.reel.count(),
      prisma.discussionPost.count(),
      prisma.jobApplication.count(),
      prisma.interviewResult.count(),
      prisma.message.count(),
      prisma.researchPaper.count(),
      prisma.transaction.count(),

      // Revenue (completed deposits/transactions)
      prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED', createdAt: { gte: startOfDay } } }),
      prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED', createdAt: { gte: startOfWeek } } }),
      prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } } }),
      prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED', createdAt: { gte: startOfYear } } }),
      prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } }),

      // Escrow
      prisma.escrow.aggregate({ _sum: { amount: true }, where: { status: 'HELD' } }),
      prisma.escrow.aggregate({ _sum: { amount: true }, where: { status: 'RELEASED' } }),
      prisma.escrow.count({ where: { status: 'RELEASED' } }),

      prisma.dispute.count({ where: { status: 'OPEN' } }),
      prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),

      // Recent activity raw data
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.job.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, title: true, company: true, createdAt: true } }),
      prisma.jobApplication.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { applicant: { select: { name: true } }, job: { select: { title: true } } } }),
      prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 15, include: { user: { select: { name: true } } } }),

      prisma.reelLike.count(),
      prisma.reelComment.count(),
      prisma.follow.count(),
      prisma.user.count({ where: { createdAt: { gte: last30 } } }),
    ]);

    const io = req.app.get('io');
    const liveVisitors = io ? Math.max(1, io.sockets.sockets.size) : 1;
    const uptimeSec = process.uptime();
    const uptime = `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m`;
    const growthPercent = totalUsers > 0 ? ((newUsersLast30 / totalUsers) * 100).toFixed(1) : '0.0';

    // Build real activity feed from DB events
    const activityFeed: any[] = [];
    recentUsers.slice(0, 5).forEach(u => activityFeed.push({ type: 'user_registered', icon: '👤', color: '#a78bfa', text: `New user registered: ${u.name || u.email}`, time: u.createdAt }));
    recentJobs.slice(0, 3).forEach(j => activityFeed.push({ type: 'job_posted', icon: '💼', color: '#22d3ee', text: `Job posted: "${j.title}" by ${j.company}`, time: j.createdAt }));
    recentApps.slice(0, 3).forEach((a: any) => activityFeed.push({ type: 'job_application', icon: '📋', color: '#34d399', text: `${a.applicant?.name || 'User'} applied for "${a.job?.title}"`, time: a.createdAt }));
    recentTxns.slice(0, 4).forEach((t: any) => activityFeed.push({ type: 'transaction', icon: '💰', color: '#fbbf24', text: `Payment ${t.status}: $${t.amount} via ${t.gateway} — ${t.user?.name || 'User'}`, time: t.createdAt }));
    activityFeed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json({
      // User metrics
      totalUsers, todayUsers, monthlyUsers, liveVisitors,
      totalFreelancers, totalJobs, totalProjects, totalServices,
      totalReels, totalDiscussions, totalApplications, totalInterviews,
      totalMessages, totalResearch, totalTransactions,
      // Engagement
      totalLikes: reelLikes, totalComments: reelComments, totalFollows: follows,
      // Revenue
      todayRevenue: todayRevRaw._sum.amount || 0,
      weekRevenue: weekRevRaw._sum.amount || 0,
      monthRevenue: monthRevRaw._sum.amount || 0,
      yearRevenue: yearRevRaw._sum.amount || 0,
      totalRevenue: totalRevRaw._sum.amount || 0,
      // Escrow/Payments
      escrowHeld: escrowHeld._sum.amount || 0,
      pendingPayoutsAmt: escrowHeld._sum.amount || 0,
      completedPayoutsCount: completedPayouts,
      openDisputes, pendingWithdrawals,
      // Growth
      monthlyGrowth: `+${growthPercent}%`,
      // Server
      uptime, serverStatus: 'Healthy',
      // Activity
      activityFeed: activityFeed.slice(0, 15),
    });
  } catch (error) {
    console.error('[ADMIN STATS]', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── FINANCIAL DASHBOARD ─────────────────────────────────────────────────────
router.get('/financials', adminAuth, async (req: any, res: any) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [allTxns, escrows, withdrawals] = await Promise.all([
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' }, take: 50,
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.escrow.findMany({
        orderBy: { createdAt: 'desc' }, take: 30,
        include: {
          client: { select: { name: true } },
          freelancer: { select: { name: true } }
        }
      }),
      prisma.withdrawalRequest.findMany({
        orderBy: { createdAt: 'desc' }, take: 30,
        include: { user: { select: { name: true, email: true } } }
      }),
    ]);

    const sum = (arr: any[], filter?: (t: any) => boolean) =>
      (filter ? arr.filter(filter) : arr).reduce((s, t) => s + (t.amount || 0), 0);

    const totalRev = sum(allTxns, t => t.status === 'COMPLETED');
    const grossRev = sum(allTxns);
    const platformCommission = totalRev * 0.1; // 10% platform fee
    const freelancerEarnings = sum(escrows, e => e.status === 'RELEASED');

    // Monthly breakdown (last 12 months)
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now); d.setMonth(now.getMonth() - (11 - i)); d.setDate(1); d.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setMonth(end.getMonth() + 1);
      const monthTxns = allTxns.filter(t => {
        const tc = new Date(t.createdAt);
        return t.status === 'COMPLETED' && tc >= d && tc < end;
      });
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        revenue: monthTxns.reduce((s, t) => s + t.amount, 0),
        count: monthTxns.length,
      };
    });

    res.json({
      totalRevenue: totalRev,
      grossRevenue: grossRev,
      netRevenue: totalRev - platformCommission,
      platformCommission,
      freelancerEarnings,
      escrowHeld: sum(escrows, e => e.status === 'HELD'),
      pendingPayouts: sum(withdrawals, w => w.status === 'PENDING'),
      completedPayouts: sum(withdrawals, w => w.status === 'APPROVED'),
      refundAmount: sum(allTxns, t => t.type === 'REFUND'),
      transactionVolume: allTxns.length,
      recentTransactions: allTxns.slice(0, 20),
      recentWithdrawals: withdrawals.slice(0, 15),
      monthlyBreakdown,
    });
  } catch (error) {
    console.error('[ADMIN FINANCIALS]', error);
    res.status(500).json({ error: 'Failed to fetch financials' });
  }
});

// ─── USERS (paginated, real) ──────────────────────────────────────────────────
router.get('/users', adminAuth, async (req: any, res: any) => {
  try {
    const page = parseInt(String(req.query.page || '1'));
    const limit = parseInt(String(req.query.limit || '50'));
    const skip = (page - 1) * limit;
    const search = req.query.search as string || '';

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, role: true, verified: true,
          createdAt: true, avatar: true, bio: true,
          _count: { select: { projects: true, jobs: true, jobApplications: true, reels: true } }
        }
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[ADMIN USERS]', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ─── DELETE USER ──────────────────────────────────────────────────────────────
router.delete('/users/:id', adminAuth, async (req: any, res: any) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ─── PROJECTS (real DB) ───────────────────────────────────────────────────────
router.get('/projects', adminAuth, async (req: any, res: any) => {
  try {
    const projects = await prisma.project.findMany({
      include: { seller: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }, take: 100,
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ─── JOBS (real DB) ───────────────────────────────────────────────────────────
router.get('/jobs', adminAuth, async (req: any, res: any) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        employer: { select: { name: true, email: true } },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }, take: 100,
    });
    res.json(jobs);
  } catch {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ─── APPLICATIONS (real DB) ───────────────────────────────────────────────────
router.get('/applications', adminAuth, async (req: any, res: any) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      include: {
        applicant: { select: { name: true, email: true } },
        job: { select: { title: true, company: true } },
      },
      orderBy: { createdAt: 'desc' }, take: 100,
    });
    res.json(applications);
  } catch {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// ─── SERVICES (real DB) ───────────────────────────────────────────────────────
router.get('/services', adminAuth, async (req: any, res: any) => {
  try {
    const services = await prisma.digitalService.findMany({
      include: { seller: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }, take: 100,
    });
    res.json(services);
  } catch {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// ─── INTERVIEWS (real DB) ─────────────────────────────────────────────────────
router.get('/interviews', adminAuth, async (req: any, res: any) => {
  try {
    const interviews = await prisma.interviewResult.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }, take: 100,
    });
    res.json(interviews);
  } catch {
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

// ─── REELS (real DB) ──────────────────────────────────────────────────────────
router.get('/reels', adminAuth, async (req: any, res: any) => {
  try {
    const reels = await prisma.reel.findMany({
      include: { creator: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }, take: 100,
    });
    res.json(reels);
  } catch {
    res.status(500).json({ error: 'Failed to fetch reels' });
  }
});

// ─── CONTACT MESSAGES ─────────────────────────────────────────────────────────
router.get('/contacts', adminAuth, async (req: any, res: any) => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// ─── PLATFORM ANALYTICS ───────────────────────────────────────────────────────
router.get('/analytics', adminAuth, async (req: any, res: any) => {
  try {
    const now = new Date();

    // User growth: last 30 days by day
    const userGrowth = await Promise.all(
      Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now); d.setDate(now.getDate() - (29 - i)); d.setHours(0, 0, 0, 0);
        const end = new Date(d); end.setDate(end.getDate() + 1);
        return prisma.user.count({ where: { createdAt: { gte: d, lt: end } } })
          .then(count => ({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count }));
      })
    );

    // Job applications by day (last 14 days)
    const appGrowth = await Promise.all(
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date(now); d.setDate(now.getDate() - (13 - i)); d.setHours(0, 0, 0, 0);
        const end = new Date(d); end.setDate(end.getDate() + 1);
        return prisma.jobApplication.count({ where: { createdAt: { gte: d, lt: end } } })
          .then(count => ({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count }));
      })
    );

    // Top categories by project count
    const [topFreelancers, topProjects, discussionsByCategory] = await Promise.all([
      prisma.freelancerProfile.findMany({
        take: 10, orderBy: { createdAt: 'asc' },
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.project.findMany({
        take: 10, orderBy: { price: 'desc' },
        include: { seller: { select: { name: true } } }
      }),
      prisma.discussionPost.groupBy({
        by: ['category'], _count: { category: true }, orderBy: { _count: { category: 'desc' } }, take: 10
      }),
    ]);

    res.json({ userGrowth, appGrowth, topFreelancers, topProjects, discussionsByCategory });
  } catch (error) {
    console.error('[ADMIN ANALYTICS]', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ─── LIVE ACTIVITY FEED ───────────────────────────────────────────────────────
router.get('/activity', adminAuth, async (req: any, res: any) => {
  try {
    const [users, jobs, apps, txns, reels, interviews, discussions, follows, messages] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { name: true, email: true, createdAt: true } }),
      prisma.job.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { title: true, company: true, createdAt: true } }),
      prisma.jobApplication.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { applicant: { select: { name: true } }, job: { select: { title: true } } } }),
      prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { user: { select: { name: true } } } }),
      prisma.reel.findMany({ orderBy: { createdAt: 'desc' }, take: 3, include: { creator: { select: { name: true } } } }),
      prisma.interviewResult.findMany({ orderBy: { createdAt: 'desc' }, take: 3, include: { user: { select: { name: true } } } }),
      prisma.discussionPost.findMany({ orderBy: { createdAt: 'desc' }, take: 3, include: { author: { select: { name: true } } } }),
      prisma.follow.findMany({ orderBy: { createdAt: 'desc' }, take: 3, include: { follower: { select: { name: true } }, following: { select: { name: true } } } }),
      prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 3, include: { sender: { select: { name: true } } } }),
    ]);

    const feed: any[] = [];
    users.forEach(u => feed.push({ icon: '👤', color: '#a78bfa', text: `New user registered: ${u.name || u.email}`, time: u.createdAt }));
    jobs.forEach(j => feed.push({ icon: '💼', color: '#22d3ee', text: `Job posted: "${j.title}" — ${j.company}`, time: j.createdAt }));
    apps.forEach((a: any) => feed.push({ icon: '📋', color: '#34d399', text: `${a.applicant?.name} applied for "${a.job?.title}"`, time: a.createdAt }));
    txns.forEach((t: any) => feed.push({ icon: '💰', color: '#fbbf24', text: `Payment ${t.status}: $${t.amount} via ${t.gateway} by ${t.user?.name}`, time: t.createdAt }));
    reels.forEach((r: any) => feed.push({ icon: '🎬', color: '#ec4899', text: `InnoReel uploaded: "${r.title}" by ${r.creator?.name}`, time: r.createdAt }));
    interviews.forEach((iv: any) => feed.push({ icon: '🤖', color: '#8b5cf6', text: `AI Interview completed by ${iv.user?.name} — Score: ${iv.score}`, time: iv.createdAt }));
    discussions.forEach((d: any) => feed.push({ icon: '💬', color: '#06b6d4', text: `Discussion posted: "${d.title}" by ${d.author?.name}`, time: d.createdAt }));
    follows.forEach((f: any) => feed.push({ icon: '➕', color: '#10b981', text: `${f.follower?.name} followed ${f.following?.name}`, time: f.createdAt }));
    messages.forEach((m: any) => feed.push({ icon: '✉️', color: '#f59e0b', text: `Message sent by ${m.sender?.name}`, time: m.createdAt }));

    feed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    res.json(feed.slice(0, 40));
  } catch (error) {
    console.error('[ADMIN ACTIVITY]', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// ─── NOTIFICATIONS (public + admin) ──────────────────────────────────────────
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await prisma.globalNotification.findMany({
      where: { active: true }, orderBy: { createdAt: 'desc' }, take: 5
    });
    res.json(notifications);
  } catch { res.status(500).json({ error: 'Failed to fetch notifications' }); }
});

router.post('/notify', adminAuth, async (req: any, res: any) => {
  const { title, message, type } = req.body;
  try {
    const notification = await prisma.globalNotification.create({
      data: { title, message, type: type || 'announcement' }
    });
    const io = req.app.get('io');
    if (io) io.emit('new_notification', notification);
    res.json({ success: true, notification });
  } catch { res.status(500).json({ error: 'Failed to send notification' }); }
});

router.delete('/notifications/:id', adminAuth, async (req: any, res: any) => {
  try {
    await prisma.globalNotification.update({ where: { id: req.params.id }, data: { active: false } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to dismiss notification' }); }
});

export default router;
