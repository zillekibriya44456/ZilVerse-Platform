import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth as authenticateToken } from '../middleware/auth';

const router = express.Router();

let cache: any[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 30_000;

// GET /api/events?type=&q=&limit=
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { type, q, limit } = req.query;
    const take = parseInt(limit as string) || 50;
    const isFiltered = !!(type || q);
    const now = Date.now();

    if (!isFiltered && cache && now - lastFetch < CACHE_TTL) {
      return res.json(cache);
    }

    const where: any = {};
    if (type) where.type = { contains: type as string, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { title:       { contains: q as string, mode: 'insensitive' } },
        { location:    { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take
    });

    if (!isFiltered) {
      cache = events;
      lastFetch = now;
    }

    return res.json(events);
  } catch (error) {
    console.error('Events fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/types — list unique event types
router.get('/types', async (_req: Request, res: Response): Promise<any> => {
  try {
    const types = await prisma.event.findMany({
      select: { type: true },
      distinct: ['type'],
      orderBy: { type: 'asc' }
    });
    return res.json(types.map(t => t.type));
  } catch {
    return res.status(500).json({ error: 'Failed to fetch types' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const event = await prisma.event.findUnique({ where: { id: String(req.params.id) } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    return res.json(event);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/events/create
router.post('/create', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, type, date, location, description, category, isFree } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });

    const event = await prisma.event.create({
      data: {
        title:       title.trim(),
        type:        type        || 'Virtual',
        date,
        location:    location    || 'Online',
        description: description || '',
        category:    category    || 'Full Stack',
        isFree:      isFree !== undefined ? Boolean(isFree) : true,
      }
    });

    cache = null; // invalidate cache
    return res.status(201).json(event);
  } catch (error) {
    console.error('Event create error:', error);
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

// ── POST /api/events/:id/ticket — create Razorpay order or free register ─────
router.post('/:id/ticket', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const uid = String((req as any).user.id);
    const { id: eventId } = req.params as Record<string, string>;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Check for duplicate ticket
    const existing = await prisma.eventTicket.findFirst({ where: { eventId, userId: uid } });
    if (existing) return res.status(409).json({ error: 'You already have a ticket', ticket: existing });

    if (event.isFree) {
      // Free registration — create ticket directly
      const ticket = await prisma.eventTicket.create({
        data: { userId: uid, eventId, ticketCode: `TKT-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`, status: 'CONFIRMED', amount: 0 },
      });
      return res.status(201).json({ ticket, isFree: true });
    }

    // Paid event — create Razorpay order
    const Razorpay = require('razorpay');
    const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const amount = Math.round((event.price || 500) * 100); // paisa
    const order = await rzp.orders.create({ amount, currency: 'INR', receipt: `evt_${eventId}_${uid}` });

    return res.json({ order, event: { id: event.id, title: event.title, price: event.price } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Ticket purchase failed' });
  }
});

// ── POST /api/events/ticket/verify — verify Razorpay payment + issue ticket ──
router.post('/ticket/verify', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const uid = String((req as any).user.id);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId } = req.body;
    const crypto = require('crypto');

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest('hex');
    if (digest !== razorpay_signature) return res.status(400).json({ error: 'Invalid payment signature' });

    const ticket = await prisma.eventTicket.create({
      data: {
        userId:    uid, eventId,
        ticketCode: `TKT-${razorpay_payment_id.slice(-8).toUpperCase()}`,
        status:    'CONFIRMED',
        razorpayPayId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        amount:    0,
      },
    });
    return res.status(201).json({ ticket });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

// ── GET /api/events/my-tickets — get current user's event tickets ─────────────
router.get('/my-tickets', authenticateToken, async (req: Request, res: Response): Promise<any> => {
  try {
    const uid = String((req as any).user.id);
    const tickets = await prisma.eventTicket.findMany({
      where:   { userId: uid },
      orderBy: { createdAt: 'desc' },
      include: { event: { select: { id: true, title: true, date: true, location: true, type: true, isFree: true } } },
    });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

export default router;
