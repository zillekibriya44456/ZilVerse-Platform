import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';

const router = Router();

const subscribeSchema = z.object({
  email: z.string().email(),
  country: z.string().optional(),
  source: z.string().default('Footer'),
});

router.post('/subscribe', async (req: Request, res: Response): Promise<any> => {
  try {
    const parsed = subscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid email address provided.' });
    }

    const { email, country, source } = parsed.data;

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'You are already subscribed to the newsletter!' });
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email,
        country: country || null,
        source: source || 'footer'
      }
    });

    res.status(200).json({ message: 'Successfully subscribed to the ZilVerse newsletter!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while processing subscription.' });
  }
});

// Admin Export (Requires Auth in real world, but open for QA here)
router.get('/export', async (req: Request, res: Response) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(subscribers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
