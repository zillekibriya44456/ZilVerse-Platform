"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get portfolio by userId
router.get('/:userId', async (req, res) => {
    try {
        const portfolio = await prisma.portfolio.findUnique({
            where: { userId: req.params.userId }
        });
        if (!portfolio)
            return res.status(404).json({ error: 'Portfolio not found' });
        res.json(portfolio);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
});
// Generate/Save portfolio
router.post('/generate', async (req, res) => {
    try {
        const { theme, bioText, skills, githubScore, userId } = req.body;
        let uid = userId;
        if (!uid) {
            const user = await prisma.user.findFirst();
            if (!user)
                return res.status(400).json({ error: 'No users exist. Please sign up first.' });
            uid = user.id;
        }
        const portfolio = await prisma.portfolio.upsert({
            where: { userId: uid },
            update: {
                theme,
                bioText,
                skills: skills || '',
                githubScore: githubScore || ''
            },
            create: {
                userId: uid,
                theme: theme || 'Default',
                bioText: bioText || 'AI Generated Bio',
                skills: skills || '',
                githubScore: githubScore || ''
            }
        });
        res.status(200).json(portfolio);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save portfolio' });
    }
});
exports.default = router;
//# sourceMappingURL=portfolio.js.map