"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const contactMsg = await prisma.contactMessage.create({
            data: { name, email, subject, message }
        });
        res.status(201).json(contactMsg);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});
exports.default = router;
//# sourceMappingURL=contact.js.map