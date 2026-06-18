import express, { Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID  || 'rzp_live_Sxuhmk2KLWNZx5',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '0XjyIUAtjCmUa29O0JowbV2J',
});

const PLANS = [
  {
    id:          'FREE',
    name:        'Free',
    price:       0,
    currency:    'USD',
    period:      'forever',
    color:       '#71717a',
    features: [
      'Browse all opportunities',
      'Apply to 5 jobs/month',
      'Basic profile',
      'Community access',
      '1 active service listing',
    ],
    cta: 'Current Plan',
  },
  {
    id:          'PRO',
    name:        'Pro',
    price:       9.99,
    priceINR:    829,
    currency:    'USD',
    period:      '/month',
    color:       '#8B5CF6',
    features: [
      'Everything in Free',
      'Unlimited job applications',
      'AI Opportunity Agent',
      'Priority profile visibility',
      '10 active service listings',
      'Analytics dashboard',
      'Remove ads',
      '5GB file storage',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id:          'ELITE',
    name:        'Elite',
    price:       29.99,
    priceINR:    2499,
    currency:    'USD',
    period:      '/month',
    color:       '#F59E0B',
    features: [
      'Everything in Pro',
      'Featured profile badge',
      'Boost listings (top of search)',
      'Unlimited service listings',
      'Pitch to investors (Grants module)',
      'Group chat creation',
      'Priority support',
      '50GB file storage',
      'Custom profile URL',
      'Verified badge',
    ],
    cta: 'Upgrade to Elite',
  },
];

// GET /api/membership/plans
router.get('/plans', async (_req, res) => {
  res.json(PLANS);
});

// GET /api/membership/status
router.get('/status', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { membershipTier: true, membershipExpiry: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isActive = !user.membershipExpiry || user.membershipExpiry > new Date();
    return res.json({
      tier:    isActive ? user.membershipTier : 'FREE',
      expiry:  user.membershipExpiry,
      isActive,
    });
  } catch { return res.status(500).json({ message: 'Failed to fetch membership' }); }
});

// POST /api/membership/subscribe — create Razorpay order
router.post('/subscribe', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const { tier } = req.body;
    const plan = PLANS.find(p => p.id === tier);
    if (!plan || plan.price === 0) return res.status(400).json({ message: 'Invalid plan' });

    const amountPaise = Math.round((plan.priceINR || plan.price * 83) * 100);

    const order = await razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt:  `membership_${req.user.id}_${Date.now()}`,
      notes:    { tier, userId: req.user.id },
    });

    // Save pending transaction
    await prisma.membershipTransaction.create({
      data: {
        userId:          req.user.id,
        tier,
        amount:          plan.priceINR || plan.price * 83,
        currency:        'INR',
        razorpayOrderId: order.id,
        status:          'PENDING',
        expiresAt:       new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return res.json({
      orderId:    order.id,
      amount:     amountPaise,
      currency:   'INR',
      keyId:      process.env.RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.error('[Membership] Subscribe error:', e);
    return res.status(500).json({ message: 'Failed to create order' });
  }
});

// POST /api/membership/verify — verify payment + activate
router.post('/verify', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = req.body;

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Update transaction + user tier
    await Promise.all([
      prisma.membershipTransaction.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data:  { status: 'PAID', razorpayPayId: razorpay_payment_id, expiresAt },
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data:  { membershipTier: tier, membershipExpiry: expiresAt },
      }),
    ]);

    return res.json({ success: true, tier, expiresAt });
  } catch (e) {
    console.error('[Membership] Verify error:', e);
    return res.status(500).json({ message: 'Failed to verify payment' });
  }
});

// POST /api/membership/cancel
router.post('/cancel', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data:  { membershipTier: 'FREE', membershipExpiry: null },
    });
    return res.json({ success: true, message: 'Membership cancelled' });
  } catch { return res.status(500).json({ message: 'Failed to cancel' }); }
});

export default router;
