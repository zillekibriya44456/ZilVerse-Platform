import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * GET /api/dashboard/stats
 * Returns real-time stats for the authenticated user's dashboard.
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const uid = (req as any).user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    // Run all queries in parallel
    const [
      wallet,
      jobApplications,
      projects,
      services,
      reels,
      exchangeListings,
      discussionPosts,
      messages,
      jobsPosted,
    ] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: uid } }),
      prisma.jobApplication.count({ where: { applicantId: uid } }),
      prisma.project.count({ where: { sellerId: uid } }),
      prisma.digitalService.count({ where: { sellerId: uid } }),
      prisma.reel.count({ where: { creatorId: uid } }),
      prisma.exchangeListing.count({ where: { sellerId: uid } }),
      prisma.discussionPost.count({ where: { authorId: uid } }),
      prisma.message.count({
        where: {
          OR: [{ senderId: uid }, { receiverId: uid }]
        }
      }),
      prisma.job.count({ where: { employerId: uid } }),
    ]);

    // Recent activity: last 10 events across the platform
    const [
      recentApplications,
      recentPosts,
      recentProposals,
    ] = await Promise.all([
      prisma.jobApplication.findMany({
        where: { applicantId: uid },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { job: { select: { title: true, company: true } } }
      }),
      prisma.discussionPost.findMany({
        where: { authorId: uid },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, upvotes: true, createdAt: true }
      }),
      prisma.exchangeProposal.findMany({
        where: { proposerId: uid },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { listing: { select: { title: true } } }
      }),
    ]);

    return res.json({
      wallet: {
        balance: wallet?.availableBalance || 0,
        pending: wallet?.pendingBalance || 0,
      },
      counts: {
        jobApplications,
        projects,
        services,
        reels,
        exchangeListings,
        discussionPosts,
        messages,
        jobsPosted,
        activeProjects: projects + services,
      },
      recentActivity: [
        ...recentApplications.map((a: any) => ({
          type: 'application',
          icon: '💼',
          title: `Applied to "${a.job?.title || 'Job'}" at ${a.job?.company || 'Company'}`,
          status: a.status,
          date: a.createdAt
        })),
        ...recentPosts.map((p: any) => ({
          type: 'discussion',
          icon: '💬',
          title: `Posted: "${p.title}"`,
          status: `${p.upvotes} upvotes`,
          date: p.createdAt
        })),
        ...recentProposals.map((p: any) => ({
          type: 'exchange',
          icon: '🔄',
          title: `Trade proposed for "${p.listing?.title || 'Listing'}"`,
          status: p.status,
          date: p.createdAt
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
