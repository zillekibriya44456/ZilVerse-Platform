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
        const courses = await prisma.academyCourse.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});
router.post('/create', async (req, res) => {
    try {
        const { title, instructor, level, duration, description, price, countryCode, language, category, students, rating, image } = req.body;
        const course = await prisma.academyCourse.create({
            data: {
                title,
                instructor,
                level: level || 'Beginner',
                duration: duration || '1 Hour',
                description,
                price: parseFloat(price || '0'),
                countryCode: countryCode || 'US',
                language: language || 'English',
                category: category || 'Development',
                students: parseInt(students || '0', 10),
                rating: parseFloat(rating || '5.0'),
                image: image || '/avatars/avatar_1.png'
            }
        });
        res.status(201).json(course);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create course' });
    }
});
exports.default = router;
//# sourceMappingURL=academy.js.map