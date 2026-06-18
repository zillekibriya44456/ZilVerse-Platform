import prisma from '../lib/prisma';
// @ts-nocheck
import express from 'express';

import { uploadVideo, getFileUrl } from '../config/cloudinary';
import { requireAuth as authenticateToken } from '../middleware/auth';

const router = express.Router();

// REELS CRUD
// ───────────────────────────────────────────────

// Get reels feed (with AI recommendation scoring)
router.get('/', async (req, res) => {
  try {
    const { category, cursor, limit: rawLimit } = req.query;
    const limit = Math.min(parseInt(String(rawLimit)) || 20, 50);
    
    const isTrending = category === 'Trending';
    const whereClause: any = {};
    if (category && category !== 'For You' && !isTrending) {
      whereClause.category = String(category);
    }
    if (cursor) {
      whereClause.createdAt = { lt: new Date(String(cursor)) };
    }

    const reels = await prisma.reel.findMany({
      where: isTrending ? { createdAt: { gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } : whereClause,
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, verified: true }
        },
        _count: { select: { reelLikes: true, reelComments: true } }
      },
      orderBy: isTrending ? [{ likes: 'desc' }, { views: 'desc' }] : { createdAt: 'desc' },
      take: limit
    });

    // Engagement scoring for recommendation (simulated AI)
    const scored = reels.map(reel => {
      const engagement = (reel.likes * 2) + (reel.comments * 3) + (reel.shares * 5) + (reel.views * 0.1);
      const recency = Math.max(1, (Date.now() - reel.createdAt.getTime()) / (1000 * 60 * 60)); // hours
      const score = engagement / Math.pow(recency, 1.5); // Decay over time
      return { ...reel, engagementScore: Math.round(score * 100) / 100 };
    });

    if (category === 'For You') {
      scored.sort((a, b) => b.engagementScore - a.engagementScore);
    }

    res.json({
      reels: scored,
      nextCursor: reels.length === limit ? reels[reels.length - 1]?.createdAt.toISOString() : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reels' });
  }
});

// Get single reel
router.get('/:id', async (req, res) => {
  try {
    const reel = await prisma.reel.findUnique({
      where: { id: (req.params.id as string) },
      include: {
        creator: { select: { id: true, name: true, avatar: true, bio: true, verified: true } },
        _count: { select: { reelLikes: true, reelComments: true, donations: true } }
      }
    });
    if (!reel) return res.status(404).json({ error: 'Reel not found' });
    res.json(reel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reel' });
  }
});

// Upload new reel
router.post('/upload', authenticateToken, uploadVideo.single('video'), async (req: express.Request, res: any) => {
  try {
    const creatorId = (req as any).user?.id;
    if (!creatorId) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'No video file provided' });

    const { title, description, category, tags } = req.body;

    const newReel = await prisma.reel.create({
      data: {
        title: title || 'New Reel',
        description: description || '',
        videoUrl: getFileUrl(req.file),
        category: category || 'For You',
        tags: tags || 'tech,startup',
        creatorId
      }
    });

    res.status(201).json(newReel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload reel' });
  }
});

// Record view
router.post('/:id/view', async (req, res) => {
  try {
    await prisma.reel.update({
      where: { id: (req.params.id as string) },
      data: { views: { increment: 1 } }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record view' });
  }
});

// ───────────────────────────────────────────────
// LIKES
// ───────────────────────────────────────────────

router.post('/:id/like', authenticateToken, async (req: express.Request, res: any) => {
  try {
    const userId = (req as any).user?.id;
    const reelId = req.params.id as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const existing = await prisma.reelLike.findUnique({
      where: { reelId_userId: { reelId, userId } }
    });

    if (existing) {
      // Unlike
      await prisma.reelLike.delete({ where: { id: existing.id } });
      await prisma.reel.update({ where: { id: reelId }, data: { likes: { decrement: 1 } } });
      return res.json({ liked: false });
    } else {
      // Like
      await prisma.reelLike.create({ data: { reelId, userId } });
      await prisma.reel.update({ where: { id: reelId }, data: { likes: { increment: 1 } } });
      return res.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Check if user liked a reel
router.get('/:id/liked', authenticateToken, async (req: express.Request, res: any) => {
  try {
    const userId = (req as any).user?.id;
    const existing = await prisma.reelLike.findUnique({
      where: { reelId_userId: { reelId: (req.params.id as string), userId } }
    });
    res.json({ liked: !!existing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check like status' });
  }
});

// ───────────────────────────────────────────────
// SAVES
// ───────────────────────────────────────────────

router.post('/:id/save', authenticateToken, async (req: express.Request, res: any) => {
  try {
    const userId = (req as any).user?.id;
    const reelId = req.params.id as string;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const existing = await prisma.reelSave.findUnique({
      where: { reelId_userId: { reelId, userId } }
    });

    if (existing) {
      await prisma.reelSave.delete({ where: { id: existing.id } });
      await prisma.reel.update({ where: { id: reelId }, data: { saves: { decrement: 1 } } });
      return res.json({ saved: false });
    } else {
      await prisma.reelSave.create({ data: { reelId, userId } });
      await prisma.reel.update({ where: { id: reelId }, data: { saves: { increment: 1 } } });
      return res.json({ saved: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle save' });
  }
});

router.get('/:id/saved', authenticateToken, async (req: express.Request, res: any) => {
  try {
    const userId = (req as any).user?.id;
    const existing = await prisma.reelSave.findUnique({
      where: { reelId_userId: { reelId: (req.params.id as string), userId } }
    });
    res.json({ saved: !!existing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check save status' });
  }
});

// ───────────────────────────────────────────────
// COMMENTS
// ───────────────────────────────────────────────

// Get comments for a reel
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await prisma.reelComment.findMany({
      where: { reelId: (req.params.id as string), parentId: null },
      include: {
        user: { select: { id: true, name: true, avatar: true, verified: true } }
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: 50
    });

    // Fetch reply counts for each comment
    const withReplies = await Promise.all(comments.map(async (comment) => {
      const replyCount = await prisma.reelComment.count({
        where: { parentId: comment.id }
      });
      return { ...comment, replyCount };
    }));

    res.json(withReplies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Get replies to a comment
router.get('/comments/:commentId/replies', async (req, res) => {
  try {
    const replies = await prisma.reelComment.findMany({
      where: { parentId: req.params.commentId },
      include: {
        user: { select: { id: true, name: true, avatar: true, verified: true } }
      },
      orderBy: { createdAt: 'asc' },
      take: 30
    });
    res.json(replies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
});

// Post a comment
router.post('/:id/comments', authenticateToken, async (req: express.Request, res: any) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { content, parentId } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });

    const comment = await prisma.reelComment.create({
      data: {
        reelId: (req.params.id as string),
        userId,
        content: content.trim(),
        parentId: parentId || null
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, verified: true } }
      }
    });

    // Increment comment count on reel
    await prisma.reel.update({
      where: { id: (req.params.id as string) },
      data: { comments: { increment: 1 } }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// ───────────────────────────────────────────────
// SHARES
// ───────────────────────────────────────────────

router.post('/:id/share', async (req, res) => {
  try {
    await prisma.reel.update({
      where: { id: (req.params.id as string) },
      data: { shares: { increment: 1 } }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record share' });
  }
});

// ───────────────────────────────────────────────
// FOLLOW SYSTEM
// ───────────────────────────────────────────────

router.post('/follow/:targetId', authenticateToken, async (req: express.Request, res: any) => {
  try {
    const followerId = (req as any).user?.id;
    const followingId = (req.params.targetId as string);
    if (!followerId) return res.status(401).json({ error: 'Unauthorized' });
    if (followerId === followingId) return res.status(400).json({ error: 'Cannot follow yourself' });

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } }
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return res.json({ following: false });
    } else {
      await prisma.follow.create({ data: { followerId, followingId } });
      return res.json({ following: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

// Check follow status
router.get('/follow/:targetId/status', authenticateToken, async (req: express.Request, res: any) => {
  try {
    const followerId = (req as any).user?.id;
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId: (req.params.targetId as string) } }
    });
    res.json({ following: !!existing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

// Get creator profile with follower counts
router.get('/creator/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: {
        id: true, name: true, avatar: true, bio: true, verified: true, createdAt: true,
        _count: {
          select: {
            reels: true,
            followers: true,
            following: true,
            donationsReceived: true
          }
        }
      }
    });
    if (!user) return res.status(404).json({ error: 'Creator not found' });

    // Get total likes and views across all reels
    const stats = await prisma.reel.aggregate({
      where: { creatorId: req.params.userId },
      _sum: { likes: true, views: true, shares: true }
    });

    // Get total donations received
    const donationStats = await prisma.reelDonation.aggregate({
      where: { receiverId: req.params.userId },
      _sum: { amount: true },
      _count: true
    });

    res.json({
      ...user,
      totalLikes: stats._sum.likes || 0,
      totalViews: stats._sum.views || 0,
      totalShares: stats._sum.shares || 0,
      totalDonations: donationStats._sum.amount || 0,
      donationCount: donationStats._count || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch creator profile' });
  }
});

// Get creator's reels
router.get('/creator/:userId/reels', async (req, res) => {
  try {
    const reels = await prisma.reel.findMany({
      where: { creatorId: req.params.userId },
      orderBy: { createdAt: 'desc' },
      take: 30
    });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch creator reels' });
  }
});

// ───────────────────────────────────────────────
// STORIES (24-hour)
// ───────────────────────────────────────────────

// Get active stories from followed users
router.get('/stories/feed', authenticateToken, async (req: express.Request, res: any) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Get users this person follows
    const followedIds = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });
    const ids = [userId, ...followedIds.map(f => f.followingId)];

    const stories = await prisma.story.findMany({
      where: {
        userId: { in: ids },
        expiresAt: { gt: new Date() }
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, verified: true } },
        _count: { select: { views: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group stories by user
    const grouped: Record<string, any> = {};
    for (const story of stories) {
      if (!grouped[story.userId]) {
        grouped[story.userId] = {
          user: story.user,
          stories: [],
          latestAt: story.createdAt
        };
      }
      grouped[story.userId].stories.push(story);
    }

    res.json(Object.values(grouped));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// Get all active stories (public feed for non-auth)
router.get('/stories/all', async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      where: { expiresAt: { gt: new Date() } },
      include: {
        user: { select: { id: true, name: true, avatar: true, verified: true } },
        _count: { select: { views: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const grouped: Record<string, any> = {};
    for (const story of stories) {
      if (!grouped[story.userId]) {
        grouped[story.userId] = {
          user: story.user,
          stories: [],
          latestAt: story.createdAt
        };
      }
      grouped[story.userId].stories.push(story);
    }

    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// Upload story
router.post('/stories/upload', authenticateToken, uploadVideo.single('media'), async (req: express.Request, res: any) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'No media file provided' });

    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const story = await prisma.story.create({
      data: {
        mediaUrl: getFileUrl(req.file),
        mediaType,
        caption: req.body.caption || null,
        userId,
        expiresAt
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.status(201).json(story);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload story' });
  }
});

// View a story
router.post('/stories/:storyId/view', authenticateToken, async (req: express.Request, res: any) => {
  try {
    const viewerId = (req as any).user?.id;
    if (!viewerId) return res.status(401).json({ error: 'Unauthorized' });

    await prisma.storyView.upsert({
      where: { storyId_viewerId: { storyId: (req.params.storyId as string), viewerId } },
      create: { storyId: (req.params.storyId as string), viewerId, reaction: req.body.reaction || null },
      update: { reaction: req.body.reaction || undefined }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record story view' });
  }
});

// ───────────────────────────────────────────────
// DONATIONS
// ───────────────────────────────────────────────

router.post('/donate', authenticateToken, async (req: express.Request, res: any) => {
  try {
    const senderId = (req as any).user?.id;
    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    const { receiverId, reelId, amount, message, currency } = req.body;
    if (!receiverId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid donation data' });
    }

    const donation = await prisma.reelDonation.create({
      data: {
        senderId,
        receiverId,
        reelId: reelId || null,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        message: message || null
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process donation' });
  }
});

// Donation leaderboard for a creator
router.get('/donations/leaderboard/:creatorId', async (req, res) => {
  try {
    const donations = await prisma.reelDonation.findMany({
      where: { receiverId: req.params.creatorId },
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { amount: 'desc' },
      take: 20
    });

    // Aggregate by sender
    const leaderboard: Record<string, any> = {};
    for (const d of donations) {
      if (!leaderboard[d.senderId]) {
        leaderboard[d.senderId] = { user: d.sender, totalAmount: 0, count: 0 };
      }
      leaderboard[d.senderId].totalAmount += d.amount;
      leaderboard[d.senderId].count += 1;
    }

    const sorted = Object.values(leaderboard).sort((a: any, b: any) => b.totalAmount - a.totalAmount);
    res.json(sorted.slice(0, 10));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ───────────────────────────────────────────────
// TRENDING & EXPLORE
// ───────────────────────────────────────────────

router.get('/trending/reels', async (req, res) => {
  try {
    const reels = await prisma.reel.findMany({
      where: {
        createdAt: { gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // last 7 days
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true, verified: true } }
      },
      orderBy: [{ likes: 'desc' }, { views: 'desc' }],
      take: 20
    });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending reels' });
  }
});

router.get('/trending/creators', async (req, res) => {
  try {
    const creators = await prisma.user.findMany({
      where: { reels: { some: {} } },
      select: {
        id: true, name: true, avatar: true, bio: true, verified: true,
        _count: { select: { reels: true, followers: true } }
      },
      orderBy: { followers: { _count: 'desc' } },
      take: 10
    });
    res.json(creators);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending creators' });
  }
});

export default router;

// ───────────────────────────────────────────────
// REPORT
// ───────────────────────────────────────────────

router.post('/:id/report', authenticateToken, async (req: express.Request, res: any) => {
  try {
    const userId = (req as any).user?.id;
    const reelId = req.params.id as string;
    const { reason } = req.body;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const existing = await prisma.reelReport.findUnique({
      where: { reelId_userId: { reelId, userId } }
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already reported this reel.' });
    }

    await prisma.reelReport.create({
      data: {
        reelId,
        userId,
        reason: reason || 'Inappropriate content'
      }
    });

    res.status(201).json({ success: true, message: 'Report submitted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});
