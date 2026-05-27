"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// @ts-ignore
const bcrypt_1 = __importDefault(require("bcrypt"));
// @ts-ignore
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is missing.");
}
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'BUYER',
            },
        });
        res.status(201).json({ message: 'User created successfully', userId: user.id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Check password
        if (!user.password) {
            return res.status(400).json({ message: 'Invalid credentials. This account uses social login.' });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/social', async (req, res) => {
    try {
        const { email, name, provider } = req.body;
        // Find user
        let user = await prisma.user.findUnique({ where: { email } });
        // If not found, create a new one with a random password
        if (!user) {
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(Math.random().toString(36).slice(-8), salt);
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || `${provider} User`,
                    password: hashedPassword,
                    role: 'BUYER',
                },
            });
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
const passport_1 = __importDefault(require("passport"));
// Google OAuth
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }), (req, res) => {
    const token = jsonwebtoken_1.default.sign({ id: req.user.id, role: req.user.role }, JWT_SECRET, { expiresIn: '1d' });
    const userStr = encodeURIComponent(JSON.stringify({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }));
    res.redirect(`http://localhost:3000/login?token=${token}&user=${userStr}`);
});
// GitHub OAuth
router.get('/github', passport_1.default.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport_1.default.authenticate('github', { session: false, failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }), (req, res) => {
    const token = jsonwebtoken_1.default.sign({ id: req.user.id, role: req.user.role }, JWT_SECRET, { expiresIn: '1d' });
    const userStr = encodeURIComponent(JSON.stringify({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }));
    res.redirect(`http://localhost:3000/login?token=${token}&user=${userStr}`);
});
// Facebook OAuth
router.get('/facebook', passport_1.default.authenticate('facebook', { scope: ['email'], session: false }));
router.get('/facebook/callback', passport_1.default.authenticate('facebook', { session: false, failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }), (req, res) => {
    const token = jsonwebtoken_1.default.sign({ id: req.user.id, role: req.user.role }, JWT_SECRET, { expiresIn: '1d' });
    const userStr = encodeURIComponent(JSON.stringify({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }));
    res.redirect(`http://localhost:3000/login?token=${token}&user=${userStr}`);
});
// LinkedIn OAuth
router.get('/linkedin', passport_1.default.authenticate('linkedin', { scope: ['openid', 'profile', 'email'], session: false }));
router.get('/linkedin/callback', passport_1.default.authenticate('linkedin', { session: false, failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }), (req, res) => {
    const token = jsonwebtoken_1.default.sign({ id: req.user.id, role: req.user.role }, JWT_SECRET, { expiresIn: '1d' });
    const userStr = encodeURIComponent(JSON.stringify({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }));
    res.redirect(`http://localhost:3000/login?token=${token}&user=${userStr}`);
});
// Generic fallbacks for others
router.get('/:provider', (req, res) => {
    res.redirect('http://localhost:3000/login?error=provider_not_configured_yet');
});
exports.default = router;
//# sourceMappingURL=auth.js.map