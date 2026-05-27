"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
// @ts-ignore
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer for demo video uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'demo-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// GET all projects
router.get('/', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                seller: {
                    select: { name: true, email: true }
                }
            }
        });
        res.json(projects);
    }
    catch (error) {
        console.error('[PROJECT FETCH ERROR]', error);
        res.status(500).json({ message: 'Server error fetching projects' });
    }
});
// POST a new project (Authenticated client context)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { title, description, price, videoUrl } = req.body;
        const sellerId = req.user?.id;
        if (!sellerId) {
            return res.status(401).json({ error: 'Unauthorized user context.' });
        }
        if (!title || !description || isNaN(parseFloat(price))) {
            return res.status(400).json({ error: 'Missing required project attributes or invalid price.' });
        }
        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                sellerId,
                videoUrl: videoUrl || null
            }
        });
        res.status(201).json(newProject);
    }
    catch (error) {
        console.error('[PROJECT CREATE ERROR]', error);
        res.status(500).json({ message: 'Server error creating project' });
    }
});
// POST /api/projects/upload-video (Authenticated upload project demo video)
router.post('/upload-video', auth_1.authenticateToken, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided.' });
        }
        const videoUrl = `/uploads/${req.file.filename}`;
        res.status(200).json({ videoUrl });
    }
    catch (error) {
        console.error('[PROJECT VIDEO UPLOAD ERROR]', error);
        res.status(500).json({ error: 'Failed to upload demo video.' });
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map