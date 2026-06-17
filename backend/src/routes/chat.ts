import prisma from '../lib/prisma';
import express, { Request, Response } from 'express';
// @ts-ignore
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth';
import { createNotification } from './notifications';

const router = express.Router();

// ── File upload config ────────────────────────────────────────────────────────
const uploadDir = path.join(process.cwd(), 'uploads', 'chat');
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|zip|mp3|mp4|webm|ogg/;
    const extOk  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype.split('/')[1]);
    if (extOk || mimeOk) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});

function getFileType(mime: string, ext: string): string {
  if (/jpeg|jpg|png|gif|webp/.test(mime)) return 'image';
  if (/pdf/.test(mime))                   return 'pdf';
  if (/doc|docx/.test(ext))               return 'doc';
  if (/mp3|wav|ogg|webm/.test(mime))      return 'audio';
  if (/zip/.test(mime))                   return 'zip';
  return 'file';
}

// ── GET /api/chat/contacts ────────────────────────────────────────────────────
router.get('/contacts', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get blocked user IDs to exclude
    const blocks = await prisma.block.findMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
      select: { blockerId: true, blockedId: true },
    });
    const blockedIds = blocks.map(b => b.blockerId === userId ? b.blockedId : b.blockerId);

    const users = await prisma.user.findMany({
      where: { NOT: [{ id: userId }, { id: { in: blockedIds } }] },
      select: { id: true, name: true, email: true, avatar: true, role: true },
    });

    const contactsWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMsg = await prisma.message.findFirst({
          where: {
            isDeleted: false,
            OR: [
              { senderId: userId, receiverId: user.id },
              { senderId: user.id, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });
        const unread = await prisma.message.count({
          where: { senderId: user.id, receiverId: userId, isRead: false, isDeleted: false },
        });
        return {
          ...user,
          lastMessage:   lastMsg ? (lastMsg.messageType === 'file' ? `📎 ${lastMsg.fileName}` : lastMsg.content) : null,
          lastMessageAt: lastMsg?.createdAt || null,
          unreadCount:   unread,
        };
      })
    );

    contactsWithLastMessage.sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    res.json(contactsWithLastMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve contacts' });
  }
});

// ── GET /api/chat/history/:partnerId ─────────────────────────────────────────
router.get('/history/:partnerId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId    = (req as any).user.id;
    const { partnerId } = req.params;
    const page      = parseInt(req.query.page as string) || 1;
    const limit     = 50;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      skip:    (page - 1) * limit,
      take:    limit,
    });

    // Mark as read
    await prisma.message.updateMany({
      where: { senderId: partnerId, receiverId: userId, isRead: false },
      data:  { isRead: true },
    });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

// ── POST /api/chat/send (text message) ────────────────────────────────────────
router.post('/send', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const senderId   = (req as any).user.id;
    const { receiverId, content } = req.body;
    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ error: 'receiverId and content required' });
    }

    // Block check
    const blocked = await prisma.block.findFirst({
      where: { OR: [{ blockerId: senderId, blockedId: receiverId }, { blockerId: receiverId, blockedId: senderId }] },
    });
    if (blocked) return res.status(403).json({ error: 'Cannot message this user' });

    const message = await prisma.message.create({
      data: { senderId, receiverId, content, messageType: 'text' },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('new_message', message);
      io.to(senderId).emit('new_message', message);

      const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { name: true } });
      await createNotification(
        receiverId,
        `New message from ${sender?.name || 'Someone'}`,
        content.length > 60 ? content.slice(0, 57) + '...' : content,
        'message',
        { relatedId: senderId, link: `/messages?userId=${senderId}`, io }
      );
    }

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ── POST /api/chat/upload (file message) ──────────────────────────────────────
router.post('/upload', requireAuth, upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  try {
    const senderId   = (req as any).user.id;
    const { receiverId } = req.body;
    const file = (req as any).file;

    if (!file || !receiverId) return res.status(400).json({ error: 'File and receiverId required' });

    const blocked = await prisma.block.findFirst({
      where: { OR: [{ blockerId: senderId, blockedId: receiverId }, { blockerId: receiverId, blockedId: senderId }] },
    });
    if (blocked) return res.status(403).json({ error: 'Cannot message this user' });

    const fileUrl  = `/uploads/chat/${file.filename}`;
    const fileType = getFileType(file.mimetype, path.extname(file.originalname).slice(1));

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content:     file.originalname,
        messageType: 'file',
        fileUrl,
        fileType,
        fileName: file.originalname,
      },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('new_message', message);
      io.to(senderId).emit('new_message', message);

      const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { name: true } });
      await createNotification(
        receiverId,
        `${sender?.name || 'Someone'} sent a file`,
        `📎 ${file.originalname}`,
        'message',
        { relatedId: senderId, link: `/messages?userId=${senderId}`, io }
      );
    }

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// ── POST /api/chat/react ──────────────────────────────────────────────────────
router.post('/react', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId    = (req as any).user.id;
    const { messageId, emoji } = req.body;
    if (!messageId || !emoji) return res.status(400).json({ error: 'messageId and emoji required' });

    const msg = await prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    let reactions: Record<string, string[]> = {};
    try { reactions = JSON.parse(msg.reactions || '{}'); } catch {}

    if (!reactions[emoji]) reactions[emoji] = [];
    const idx = reactions[emoji].indexOf(userId);
    if (idx >= 0) reactions[emoji].splice(idx, 1); // toggle off
    else          reactions[emoji].push(userId);    // toggle on

    if (reactions[emoji].length === 0) delete reactions[emoji];

    const updated = await prisma.message.update({
      where: { id: messageId },
      data:  { reactions: JSON.stringify(reactions) },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(msg.senderId).emit('message_reaction', { messageId, reactions });
      io.to(msg.receiverId).emit('message_reaction', { messageId, reactions });
    }

    res.json({ reactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to react' });
  }
});

// ── DELETE /api/chat/message/:id (soft delete) ────────────────────────────────
router.delete('/message/:id', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const msg = await prisma.message.findFirst({ where: { id, senderId: userId } });
    if (!msg) return res.status(404).json({ error: 'Message not found or unauthorized' });
    await prisma.message.update({ where: { id }, data: { isDeleted: true, content: 'This message was deleted' } });

    const io = req.app.get('io');
    if (io) {
      io.to(msg.receiverId).emit('message_deleted', { messageId: id });
      io.to(msg.senderId).emit('message_deleted', { messageId: id });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// ── POST /api/chat/mark-read/:partnerId ──────────────────────────────────────
router.post('/mark-read/:partnerId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId    = (req as any).user.id;
    const { partnerId } = req.params;
    await prisma.message.updateMany({
      where: { senderId: partnerId, receiverId: userId, isRead: false },
      data:  { isRead: true },
    });
    const io = req.app.get('io');
    if (io) io.to(partnerId).emit('messages_read', { by: userId });
    res.json({ message: 'Marked read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark read' });
  }
});

export default router;
