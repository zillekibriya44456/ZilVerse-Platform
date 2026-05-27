"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get all fund grants
router.get('/', async (req, res) => {
    try {
        const grants = await prisma.fundGrant.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(grants);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch fund grants' });
    }
});
// Post a new grant
router.post('/create', async (req, res) => {
    try {
        const { title, organization, amount, description, deadline, creatorId } = req.body;
        let uid = creatorId;
        if (!uid) {
            const user = await prisma.user.findFirst();
            if (!user)
                return res.status(400).json({ error: 'No users exist. Please sign up first.' });
            uid = user.id;
        }
        const grant = await prisma.fundGrant.create({
            data: {
                title,
                organization,
                amount,
                description,
                deadline: deadline || 'Rolling',
                creatorId: uid
            }
        });
        res.status(201).json(grant);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create fund grant' });
    }
});
exports.default = router;
//# sourceMappingURL=funds.js.map