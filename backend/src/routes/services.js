"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get all services
router.get('/', async (req, res) => {
    try {
        const services = await prisma.digitalService.findMany({
            include: {
                seller: {
                    select: { name: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(services);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});
// Create a new digital service
router.post('/create', async (req, res) => {
    try {
        const { title, description, price, category, deliveryTime, sellerId } = req.body;
        let uid = sellerId;
        if (!uid) {
            const user = await prisma.user.findFirst();
            if (!user)
                return res.status(400).json({ error: 'No users exist. Please sign up first.' });
            uid = user.id;
        }
        const service = await prisma.digitalService.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                category: category || 'Software',
                deliveryTime: deliveryTime || '3 Days',
                sellerId: uid
            }
        });
        res.status(201).json(service);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create digital service' });
    }
});
exports.default = router;
//# sourceMappingURL=services.js.map