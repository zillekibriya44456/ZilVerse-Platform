"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET all Creator Spotlights
router.get('/', async (req, res) => {
    try {
        const spotlights = await prisma.creatorSpotlight.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(spotlights);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching spotlights' });
    }
});
// POST a new Creator Spotlight (Authenticated)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized user context.' });
        }
        const { name, role, pitch, videoUrl, image, project } = req.body;
        if (!name || !role || !pitch || !videoUrl || !project) {
            return res.status(400).json({ error: 'Missing required spotlight fields.' });
        }
        const newSpotlight = await prisma.creatorSpotlight.create({
            data: {
                name,
                role,
                pitch,
                videoUrl,
                image: image || '/creators/creator_1.png',
                project,
                userId
            }
        });
        res.status(201).json(newSpotlight);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating spotlight' });
    }
});
exports.default = router;
//# sourceMappingURL=spotlights.js.map