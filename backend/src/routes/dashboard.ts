import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth as authenticateToken } from '../middleware/auth';

const router = Router();

// ── GET /api/dashboard/stats — common stats (all roles) ───────────────────────
router.get('/stats', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const uid = String((req as any).user?.id);
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const [wallet, jobApplications, projects, services, reels, messages, jobsPosted] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: uid } }),
      prisma.jobApplication.count({ where: { applicantId: uid } }),
      prisma.project.count({ where: { sellerId: uid } }),
      prisma.digitalService.count({ where: { sellerId: uid } }),
      prisma.reel.count({ where: { creatorId: uid } }),
      prisma.message.count({ where: { OR: [{ senderId: uid }, { receiverId: uid }] } }),
      prisma.job.count({ where: { employerId: uid } }),
    ]);

    return res.json({
      wallet: { balance: wallet?.availableBalance || 0, pending: wallet?.pendingBalance || 0 },
      counts: { jobApplications, projects, services, reels, messages, jobsPosted, activeProjects: projects + services },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ── GET /api/dashboard/role/:role — role-specific stats ───────────────────────
router.get('/role/:role', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const uid  = String((req as any).user?.id);
    const role = (req.params as Record<string, string>)['role']?.toUpperCase();
    if (!uid)  return res.status(401).json({ error: 'Unauthorized' });
    if (!role) return res.status(400).json({ error: 'Role required' });

    // ── Common data across all roles ──────────────────────────────────────
    const [wallet, unreadMessages, userCertifications] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: uid } }),
      prisma.message.count({ where: { receiverId: uid, isRead: false } }),
      prisma.userCertification.count({ where: { userId: uid } }),
    ]);

    const common = {
      wallet:         { balance: wallet?.availableBalance || 0, pending: wallet?.pendingBalance || 0 },
      unreadMessages,
      certifications: userCertifications,
    };

    switch (role) {

      /* ── FREELANCER ──────────────────────────────────────────────────── */
      case 'FREELANCER': {
        const [projects, completedProjects, services, pendingQuotes, recentMessages] = await Promise.all([
          prisma.project.count({ where: { sellerId: uid } }),
          prisma.project.count({ where: { sellerId: uid, status: 'COMPLETED' } }),
          prisma.digitalService.count({ where: { sellerId: uid } }),
          prisma.serviceQuote.count({ where: { freelancerId: uid, status: 'PENDING' } }),
          prisma.message.findMany({
            where: { receiverId: uid },
            take: 5, orderBy: { createdAt: 'desc' },
            include: { sender: { select: { id: true, name: true, avatar: true } } },
          }),
        ]);
        return res.json({
          ...common, role: 'FREELANCER',
          stats: {
            activeProjects:    projects - completedProjects,
            completedProjects,
            services,
            pendingOrders:     pendingQuotes,
            avgRating:         4.8,
            totalReviews:      0,
            earnings:          wallet?.availableBalance || 0,
          },
          recentMessages: recentMessages.map((m: any) => ({
            from: m.sender?.name || 'Anonymous', avatar: m.sender?.avatar,
            preview: m.content?.slice(0, 60), time: m.createdAt,
          })),
        });
      }

      /* ── STUDENT ─────────────────────────────────────────────────────── */
      case 'STUDENT': {
        const [totalApplied, acceptedApps, recentApps] = await Promise.all([
          prisma.jobApplication.count({ where: { applicantId: uid } }),
          prisma.jobApplication.count({ where: { applicantId: uid, status: 'ACCEPTED' } }),
          prisma.jobApplication.findMany({
            where: { applicantId: uid }, take: 5, orderBy: { createdAt: 'desc' },
            include: { job: { select: { title: true, company: true, type: true, location: true } } },
          }),
        ]);
        return res.json({
          ...common, role: 'STUDENT',
          stats: {
            totalApplications:    totalApplied,
            acceptedApplications: acceptedApps,
            certifications:       userCertifications,
            resumeScore:          Math.min(100, 40 + userCertifications * 8),
          },
          recentApplications: recentApps.map((a: any) => ({
            id: a.id, title: a.job?.title, company: a.job?.company,
            type: a.job?.type, status: a.status, date: a.createdAt,
          })),
        });
      }

      /* ── DEVELOPER ───────────────────────────────────────────────────── */
      case 'DEVELOPER': {
        const [projects, services, innovations, events] = await Promise.all([
          prisma.project.count({ where: { sellerId: uid } }),
          prisma.digitalService.count({ where: { sellerId: uid } }),
          prisma.innovationIdea.count({ where: { creatorId: uid } }),
          prisma.event.findMany({ take: 4, orderBy: { createdAt: 'desc' } }),
        ]);
        return res.json({
          ...common, role: 'DEVELOPER',
          stats: { projects, services, innovations, certifications: userCertifications },
          upcomingEvents: events,
        });
      }

      /* ── DESIGNER ────────────────────────────────────────────────────── */
      case 'DESIGNER': {
        const [projects, services] = await Promise.all([
          prisma.project.count({ where: { sellerId: uid } }),
          prisma.digitalService.count({ where: { sellerId: uid } }),
        ]);
        return res.json({
          ...common, role: 'DESIGNER',
          stats: { projects, services, earnings: wallet?.availableBalance || 0, portfolioViews: projects * 12 },
        });
      }

      /* ── STARTUP ─────────────────────────────────────────────────────── */
      case 'STARTUP': {
        const [grants, openRoles, innovations] = await Promise.all([
          prisma.fundGrant.count({ where: { creatorId: uid } }),
          prisma.job.count({ where: { employerId: uid } }),
          prisma.innovationIdea.count({ where: { creatorId: uid } }),
        ]);
        return res.json({
          ...common, role: 'STARTUP',
          stats: { grantsCreated: grants, openRoles, innovations, fundingProgress: 0 },
        });
      }

      /* ── RESEARCHER ──────────────────────────────────────────────────── */
      case 'RESEARCHER': {
        const [grants, innovations, publications] = await Promise.all([
          prisma.fundGrant.count({ where: { creatorId: uid } }),
          prisma.innovationIdea.count({ where: { creatorId: uid } }),
          prisma.discussionPost.count({ where: { authorId: uid } }),
        ]);
        return res.json({
          ...common, role: 'RESEARCHER',
          stats: { grants, publications, innovations, collaborations: 0 },
        });
      }

      /* ── MENTOR ──────────────────────────────────────────────────────── */
      case 'MENTOR': {
        const [replies, recentPosts] = await Promise.all([
          prisma.discussionReply.count({ where: { authorId: uid } }),
          prisma.discussionPost.findMany({
            where: { authorId: uid }, take: 5, orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, upvotes: true, createdAt: true },
          }),
        ]);
        return res.json({
          ...common, role: 'MENTOR',
          stats: { sessionsConducted: replies, postsShared: recentPosts.length, avgRating: 4.8, earnings: wallet?.availableBalance || 0 },
          recentPosts,
        });
      }

      /* ── EMPLOYER ────────────────────────────────────────────────────── */
      case 'EMPLOYER': {
        const [jobsPosted, totalApplications, acceptedHires, recentJobs] = await Promise.all([
          prisma.job.count({ where: { employerId: uid } }),
          prisma.jobApplication.count({ where: { job: { employerId: uid } } }),
          prisma.jobApplication.count({ where: { job: { employerId: uid }, status: 'ACCEPTED' } }),
          prisma.job.findMany({
            where: { employerId: uid }, take: 5, orderBy: { createdAt: 'desc' },
            include: { _count: { select: { applications: true } } },
          }),
        ]);
        return res.json({
          ...common, role: 'EMPLOYER',
          stats: { jobsPosted, totalApplications, acceptedHires, pipeline: totalApplications - acceptedHires },
          recentJobs: recentJobs.map((j: any) => ({
            id: j.id, title: j.title, company: j.company,
            applications: j._count.applications, status: j.isActive ? 'Active' : 'Closed', date: j.createdAt,
          })),
        });
      }

      /* ── CREATOR ─────────────────────────────────────────────────────── */
      case 'CREATOR': {
        const [reelCount, reelAgg, latestReels] = await Promise.all([
          prisma.reel.count({ where: { creatorId: uid } }),
          prisma.reel.aggregate({ where: { creatorId: uid }, _sum: { likes: true, views: true } }),
          prisma.reel.findMany({
            where: { creatorId: uid }, take: 4, orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, likes: true, views: true, createdAt: true, thumbnailUrl: true },
          }),
        ]);
        return res.json({
          ...common, role: 'CREATOR',
          stats: {
            reels:      reelCount,
            totalViews: reelAgg._sum?.views || 0,
            totalLikes: reelAgg._sum?.likes || 0,
            earnings:   wallet?.availableBalance || 0,
          },
          latestReels: latestReels.map((r: any) => ({
            id: r.id, title: r.title, likes: r.likes, views: r.views, thumbnail: r.thumbnailUrl, date: r.createdAt,
          })),
        });
      }

      default:
        return res.status(400).json({ error: `Unknown role: ${role}` });
    }

  } catch (error) {
    console.error('Role dashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch role dashboard stats' });
  }
});

// ── GET /api/dashboard/admin — admin platform overview ────────────────────────
router.get('/admin', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const [users, jobs, projects, pendingReports, reels] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.project.count(),
      prisma.userReport.count({ where: { status: 'PENDING' } }),
      prisma.reel.count(),
    ]);
    return res.json({ users, jobs, projects, pendingReports, reels });
  } catch {
    return res.status(500).json({ error: 'Admin stats failed' });
  }
});

export default router;
