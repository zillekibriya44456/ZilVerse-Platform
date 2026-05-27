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
        const events = await prisma.event.findMany({ orderBy: { date: 'asc' } });
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});
router.post('/create', async (req, res) => {
    try {
        const { title, type, date, location, description } = req.body;
        const event = await prisma.event.create({
            data: { title, type, date, location, description }
        });
        res.status(201).json(event);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
    }
});
exports.default = router;
//# sourceMappingURL=events.js.map