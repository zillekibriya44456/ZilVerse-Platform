import { Router, Request, Response } from 'express';
// @ts-ignore
import bcrypt from 'bcrypt';
// @ts-ignore
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing.");
}

router.post('/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<any> => {
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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/social', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name, provider } = req.body;
    
    // Find user
    let user = await prisma.user.findUnique({ where: { email } });
    
    // If not found, create a new one with a random password
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);
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
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

import passport from 'passport';

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }), (req: any, res: Response) => {
  const token = jwt.sign({ id: req.user.id, role: req.user.role }, JWT_SECRET, { expiresIn: '1d' });
  const userStr = encodeURIComponent(JSON.stringify({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }));
  res.redirect(`http://localhost:3000/login?token=${token}&user=${userStr}`);
});

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }), (req: any, res: Response) => {
  const token = jwt.sign({ id: req.user.id, role: req.user.role }, JWT_SECRET, { expiresIn: '1d' });
  const userStr = encodeURIComponent(JSON.stringify({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }));
  res.redirect(`http://localhost:3000/login?token=${token}&user=${userStr}`);
});

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }), (req: any, res: Response) => {
  const token = jwt.sign({ id: req.user.id, role: req.user.role }, JWT_SECRET, { expiresIn: '1d' });
  const userStr = encodeURIComponent(JSON.stringify({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }));
  res.redirect(`http://localhost:3000/login?token=${token}&user=${userStr}`);
});

// LinkedIn OAuth
router.get('/linkedin', passport.authenticate('linkedin', { scope: ['openid', 'profile', 'email'], session: false }));
router.get('/linkedin/callback', passport.authenticate('linkedin', { session: false, failureRedirect: 'http://localhost:3000/login?error=oauth_failed' }), (req: any, res: Response) => {
  const token = jwt.sign({ id: req.user.id, role: req.user.role }, JWT_SECRET, { expiresIn: '1d' });
  const userStr = encodeURIComponent(JSON.stringify({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }));
  res.redirect(`http://localhost:3000/login?token=${token}&user=${userStr}`);
});

// Generic fallbacks for others
router.get('/:provider', (req: Request, res: Response) => {
  res.redirect('http://localhost:3000/login?error=provider_not_configured_yet');
});

export default router;
