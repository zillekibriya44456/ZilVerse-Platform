import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// ── Helper: create notification + emit socket ────────────────────────────────
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  options: { relatedId?: string; link?: string; io?: any } = {}
) {
  const notification = await prisma.notification.create({
    data: {
      userId, title, message, type,
      ...(options.relatedId !== undefined ? { relatedId: options.relatedId } : {}),
      ...(options.link      !== undefined ? { link:      options.link      } : {}),
    },
  });

  // Real-time push via Socket.IO if io is available
  if (options.io) {
    options.io.to(userId).emit('new_notification', {
      id:        notification.id,
      title,
      message,
      type,
      link:      options.link,
      createdAt: notification.createdAt,
    });
  }

  return notification;
}

// ── GET /api/notifications — paginated ──────────────────────────────────────
router.get('/', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    const page   = parseInt(String(req.query.page ?? "")) || 1;
    const limit  = 20;

    const [notifications, total, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where:   { userId },
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    res.json({ data: notifications, total, page, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/notifications/unread-count ─────────────────────────────────────
router.get('/unread-count', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    const count  = await prisma.notification.count({ where: { userId, isRead: false } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/notifications/read/:id ────────────────────────────────────────
router.post('/read/:id', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    const { id } = req.params as Record<string, string>;
    const notification = await prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) return res.status(404).json({ message: 'Not found' });
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/notifications/read-all ────────────────────────────────────────
router.post('/read-all', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE /api/notifications/:id ────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    const { id } = req.params as Record<string, string>;
    const n = await prisma.notification.findFirst({ where: { id, userId } });
    if (!n) return res.status(404).json({ message: 'Not found' });
    await prisma.notification.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE /api/notifications/clear-all ──────────────────────────────────────
router.delete('/clear-all', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    await prisma.notification.deleteMany({ where: { userId } });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
