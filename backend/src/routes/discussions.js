"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get('/', async (req, res) => {
    try {
        const posts = await prisma.discussionPost.findMany({
            include: {
                author: { select: { name: true, avatar: true } },
                replies: {
                    include: { author: { select: { name: true, avatar: true } } },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(posts);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch discussions' });
    }
});
router.post('/create', async (req, res) => {
    try {
        const { title, content, category, authorId } = req.body;
        let uid = authorId;
        if (!uid) {
            const user = await prisma.user.findFirst();
            if (!user)
                return res.status(400).json({ error: 'No users exist.' });
            uid = user.id;
        }
        const post = await prisma.discussionPost.create({
            data: { title, content, category, authorId: uid }
        });
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create discussion post' });
    }
});
// Reply to a discussion post
router.post('/reply', async (req, res) => {
    try {
        const { postId, content, authorId } = req.body;
        let uid = authorId;
        if (!uid) {
            const user = await prisma.user.findFirst();
            if (!user)
                return res.status(400).json({ error: 'No users exist.' });
            uid = user.id;
        }
        const existingPost = await prisma.discussionPost.findUnique({
            where: { id: String(postId) }
        });
        if (!existingPost) {
            // Mock success for frontend demo data
            return res.status(201).json({ id: 'mock-reply', content, status: 'Mock Reply Added' });
        }
        const reply = await prisma.discussionReply.create({
            data: {
                postId: String(postId),
                content,
                authorId: uid
            }
        });
        res.status(201).json(reply);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit reply' });
    }
});
exports.default = router;
//# sourceMappingURL=discussions.js.map