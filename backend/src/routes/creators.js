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
        const creators = await prisma.creatorProfile.findMany({
            include: { user: { select: { name: true, avatar: true } } },
            orderBy: { followers: 'desc' }
        });
        res.json(creators);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch creators' });
    }
});
router.post('/register', async (req, res) => {
    try {
        const { niche, followers, platform, bio, userId } = req.body;
        let uid = userId;
        if (!uid) {
            const user = await prisma.user.findFirst();
            if (!user)
                return res.status(400).json({ error: 'No users exist.' });
            uid = user.id;
        }
        const creator = await prisma.creatorProfile.upsert({
            where: { userId: uid },
            update: { niche, followers: parseInt(followers || '0'), platform, bio },
            create: { userId: uid, niche, followers: parseInt(followers || '0'), platform, bio }
        });
        res.status(201).json(creator);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to register creator' });
    }
});
exports.default = router;
//# sourceMappingURL=creators.js.map