"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Helper to get active user ID
async function getUserId(req) {
    const userId = req.query?.userId || req.body?.userId;
    if (userId)
        return userId;
    const user = await prisma.user.findFirst();
    return user ? user.id : null;
}
// 1. Get Chat Contacts
router.get('/contacts', async (req, res) => {
    try {
        const userId = await getUserId(req);
        if (!userId)
            return res.status(400).json({ error: 'User context not found' });
        // Fetch all users (excluding current user) to start a chat with
        const users = await prisma.user.findMany({
            where: { NOT: { id: userId } },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true
            }
        });
        // Fetch last message for each contact to display preview in UI
        const contactsWithLastMessage = await Promise.all(users.map(async (user) => {
            const lastMsg = await prisma.message.findFirst({
                where: {
                    OR: [
                        { senderId: userId, receiverId: user.id },
                        { senderId: user.id, receiverId: userId }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            });
            return {
                ...user,
                lastMessage: lastMsg ? lastMsg.content : null,
                lastMessageAt: lastMsg ? lastMsg.createdAt : null,
                unread: lastMsg ? (!lastMsg.isRead && lastMsg.senderId === user.id) : false
            };
        }));
        // Sort contacts by latest message timestamp
        contactsWithLastMessage.sort((a, b) => {
            if (!a.lastMessageAt)
                return 1;
            if (!b.lastMessageAt)
                return -1;
            return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        });
        res.json(contactsWithLastMessage);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve chat contacts' });
    }
});
// 2. Get Messages History
router.get('/history/:partnerId', async (req, res) => {
    try {
        const userId = await getUserId(req);
        const { partnerId } = req.params;
        if (!userId || !partnerId)
            return res.status(400).json({ error: 'Missing parameters' });
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        // Mark messages as read when fetched
        await prisma.message.updateMany({
            where: { senderId: partnerId, receiverId: userId, isRead: false },
            data: { isRead: true }
        });
        res.json(messages);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve message history' });
    }
});
// 3. Send Message
router.post('/send', async (req, res) => {
    try {
        const userId = await getUserId(req);
        const { receiverId, content } = req.body;
        if (!userId || !receiverId || !content) {
            return res.status(400).json({ error: 'Missing recipient or content' });
        }
        const message = await prisma.message.create({
            data: {
                senderId: userId,
                receiverId,
                content
            }
        });
        // Emit live message event to rooms
        const io = req.app.get('io');
        if (io) {
            // Send to both sender and receiver rooms
            io.to(receiverId).emit('new_message', message);
            io.to(userId).emit('new_message', message);
            // Also emit a notification trigger to receiver
            const senderUser = await prisma.user.findUnique({ where: { id: userId } });
            io.to(receiverId).emit('new_notification', {
                id: message.id,
                title: `Message from ${senderUser?.name || 'User'}`,
                message: content.length > 40 ? content.slice(0, 37) + '...' : content,
                type: 'message'
            });
        }
        res.status(201).json(message);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to dispatch message' });
    }
});
exports.default = router;
//# sourceMappingURL=chat.js.map