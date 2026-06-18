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
    const mimeOk = allowed.test((file.mimetype.split('/')[1]) ?? '');
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
    const userId = String((req as any).user.id);

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
    const userId    = String((req as any).user.id);
    const { partnerId } = req.params as Record<string, string>;
    const page      = parseInt(String(req.query.page ?? "")) || 1;
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
    const senderId   = String((req as any).user.id);
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
    const senderId   = String((req as any).user.id);
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
    const userId    = String((req as any).user.id);
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
    const userId = String((req as any).user.id);
    const { id } = req.params as Record<string, string>;
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
    const userId    = String((req as any).user.id);
    const { partnerId } = req.params as Record<string, string>;
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


// ══════════════════════════════════════════════════════════════
// GROUP CHAT (ChatRoom) ENDPOINTS
// ══════════════════════════════════════════════════════════════

// Voice upload dir
const voiceDir = path.join(process.cwd(), 'uploads', 'voice');
if (!fs.existsSync(voiceDir)) fs.mkdirSync(voiceDir, { recursive: true });
const voiceUpload = multer({
  storage: multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => cb(null, voiceDir),
    filename:    (_req: any, file: any, cb: any) => cb(null, `voice-${Date.now()}${path.extname(file.originalname)}`),
  }),
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('audio/')) cb(null, true);
    else cb(new Error('Only audio files allowed'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ── POST /api/chat/rooms — create group chat room ──────────────────────────────
router.post('/rooms', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const uid  = String((req as any).user.id);
    const { name, description, memberIds = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'Room name is required' });

    const allMembers = Array.from(new Set([uid, ...memberIds]));

    const room = await prisma.chatRoom.create({
      data: {
        name, description: description || '',
        creatorId: uid, createdBy: uid,
        members: {
          create: allMembers.map((id: string) => ({ userId: id, role: id === uid ? 'ADMIN' : 'MEMBER' })),
        },
      },
      include: { members: { include: { user: { select: { id: true, name: true, avatar: true } } } } },
    });

    // Notify all members via Socket.IO
    const io = (req as any).app.get('io');
    if (io) {
      allMembers.forEach((id: string) => io.to(id).emit('room_created', { room }));
    }

    return res.status(201).json(room);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create room' });
  }
});

// ── GET /api/chat/rooms — list user's group rooms ──────────────────────────────
router.get('/rooms', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const uid = String((req as any).user.id);
    const rooms = await prisma.chatRoom.findMany({
      where:   { members: { some: { userId: uid, leftAt: null } } },
      include: {
        members: { where: { leftAt: null }, include: { user: { select: { id: true, name: true, avatar: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return res.json(rooms);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// ── GET /api/chat/rooms/:id/messages — paginated room messages ─────────────────
router.get('/rooms/:id/messages', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const uid    = String((req as any).user.id);
    const { id } = req.params as Record<string, string>;
    const page   = parseInt(String(req.query.page ?? '1')) || 1;
    const limit  = 50;

    // Verify membership
    const member = await prisma.chatRoomMember.findFirst({ where: { roomId: id, userId: uid, leftAt: null } });
    if (!member) return res.status(403).json({ error: 'Not a member of this room' });

    const messages = await prisma.chatRoomMessage.findMany({
      where:   { roomId: id },
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
    return res.json(messages.reverse());
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ── POST /api/chat/rooms/:id/messages — send message to group room ─────────────
router.post('/rooms/:id/messages', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const uid    = String((req as any).user.id);
    const { id } = req.params as Record<string, string>;
    const { content, type = 'TEXT' } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const member = await prisma.chatRoomMember.findFirst({ where: { roomId: id, userId: uid, leftAt: null } });
    if (!member) return res.status(403).json({ error: 'Not a member of this room' });

    const message = await prisma.chatRoomMessage.create({
      data:    { roomId: id, senderId: uid, content, type },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });

    // Update room's updatedAt
    await prisma.chatRoom.update({ where: { id }, data: { updatedAt: new Date() } });

    // Broadcast to room via Socket.IO
    const io = (req as any).app.get('io');
    if (io) io.to(`room:${id}`).emit('group_message', message);

    return res.status(201).json(message);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// ── POST /api/chat/rooms/:id/invite — invite members to room ──────────────────
router.post('/rooms/:id/invite', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const uid    = String((req as any).user.id);
    const { id } = req.params as Record<string, string>;
    const { userIds } = req.body;

    // Check admin
    const admin = await prisma.chatRoomMember.findFirst({ where: { roomId: id, userId: uid, role: 'ADMIN' } });
    if (!admin) return res.status(403).json({ error: 'Only admins can invite members' });

    const added = await Promise.all(
      (userIds as string[]).map(async (userId: string) => {
        const existing = await prisma.chatRoomMember.findFirst({ where: { roomId: id, userId } });
        if (existing) {
          if (existing.leftAt) return prisma.chatRoomMember.update({ where: { id: existing.id }, data: { leftAt: null } });
          return existing;
        }
        return prisma.chatRoomMember.create({ data: { roomId: id, userId, role: 'MEMBER' } });
      })
    );

    const io = (req as any).app.get('io');
    if (io) userIds.forEach((uid2: string) => io.to(uid2).emit('room_invited', { roomId: id }));

    return res.json({ added });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to invite members' });
  }
});

// ── DELETE /api/chat/rooms/:id/leave — leave a group room ─────────────────────
router.delete('/rooms/:id/leave', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const uid    = String((req as any).user.id);
    const { id } = req.params as Record<string, string>;
    await prisma.chatRoomMember.updateMany({
      where: { roomId: id, userId: uid },
      data:  { leftAt: new Date() },
    });
    return res.json({ message: 'Left room' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to leave room' });
  }
});

// ══════════════════════════════════════════════════════════════
// VOICE NOTES
// ══════════════════════════════════════════════════════════════

// ── POST /api/chat/voice — upload voice note (DM or group) ────────────────────
router.post('/voice', requireAuth, voiceUpload.single('audio'), async (req: Request, res: Response): Promise<any> => {
  try {
    const uid  = String((req as any).user.id);
    const file = (req as any).file;
    if (!file) return res.status(400).json({ error: 'No audio file uploaded' });

    const { receiverId, roomId } = req.body;
    const audioUrl = `/uploads/voice/${file.filename}`;
    const duration = req.body.duration || 0;

    if (roomId) {
      // Group voice note
      const member = await prisma.chatRoomMember.findFirst({ where: { roomId: roomId, userId: uid, leftAt: null } });
      if (!member) return res.status(403).json({ error: 'Not a member' });

      const message = await prisma.chatRoomMessage.create({
        data:    { roomId: roomId, senderId: uid, content: audioUrl, type: 'VOICE', duration: parseFloat(duration) },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
      });
      const io = (req as any).app.get('io');
      if (io) io.to(`room:${roomId}`).emit('group_message', message);
      return res.status(201).json({ message, audioUrl });
    }

    if (receiverId) {
      // DM voice note
      const msg = await prisma.message.create({
        data: { senderId: uid, receiverId, content: audioUrl, type: 'VOICE', duration: parseFloat(duration) },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
      });
      const io = (req as any).app.get('io');
      if (io) io.to(receiverId).emit('new_message', msg);
      return res.status(201).json({ message: msg, audioUrl });
    }

    return res.status(400).json({ error: 'Provide receiverId or roomId' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Voice upload failed' });
  }
});

export default router;
