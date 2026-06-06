import prisma from '../lib/prisma';
import express from 'express';

import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
// @ts-ignore
import Stripe from 'stripe';
// @ts-ignore
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();


// Initialize Stripe (uses secure env variable)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_stripe_secret_key', {
  apiVersion: '2023-10-16' as any,
});

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'dummy_webhook_secret';

// Initialize Razorpay (uses secure env variable)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_Sxuhmk2KLWNZx5',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '0XjyIUAtjCmUa29O0JowbV2J',
});


// Helper to get or create wallet for a user
async function getOrCreateWallet(userId: string) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId }
  });
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        availableBalance: 0.00,
        pendingBalance: 0.00,
        currency: 'USD'
      }
    });
  }
  return wallet;
}

// Socket update helper
function emitWalletUpdate(req: any, userId: string) {
  const io = req.app.get('io');
  if (io) {
    io.to(userId).emit('wallet_update');
    io.emit('admin_payment_update');
  }
}

// ==========================================
// CLIENT WALLET & ESCROW API ENDPOINTS (AUTHENTICATED)
// ==========================================

// 1. Get Wallet Balance
router.get('/wallet', authenticateToken, async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized user context.' });

    const wallet = await getOrCreateWallet(userId);
    res.json(wallet);
  } catch (error) {
    console.error('[WALLET ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// 2. Stripe Checkout Session Creation for Secure Deposits
router.post('/create-checkout-session', authenticateToken, async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized user context.' });

    const { amount, currency } = req.body;
    const depAmount = parseFloat(amount);

    if (isNaN(depAmount) || depAmount < 5.00) {
      return res.status(400).json({ error: 'Minimum deposit is $5.00' });
    }

    // Create a Checkout Session with metadata containing user ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: 'ZilVerse Wallet Deposit',
              description: 'Funds to be deposited into your escrow wallet.',
            },
            unit_amount: Math.round(depAmount * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        userId,
        amount: depAmount.toString(),
      },
      success_url: 'http://localhost:3000/dashboard?deposit=success',
      cancel_url: 'http://localhost:3000/dashboard?deposit=cancelled',
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('[STRIPE CHECKOUT ERROR]', error);
    res.status(500).json({ error: 'Failed to initiate Stripe session: ' + error.message });
  }
});

// 3. Create Withdrawal Request
router.post('/withdraw', authenticateToken, async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized user context.' });

    const { amount, currency, method, details } = req.body;
    const wAmount = parseFloat(amount);

    if (isNaN(wAmount) || wAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const wallet = await getOrCreateWallet(userId);
    if (wallet.availableBalance < wAmount) {
      return res.status(400).json({ error: 'Insufficient available funds' });
    }

    // Deduct from available balance first
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: { availableBalance: wallet.availableBalance - wAmount }
    });

    // Create Request
    const request = await prisma.withdrawalRequest.create({
      data: {
        userId,
        amount: wAmount,
        currency: currency || 'USD',
        method: method || 'BANK',
        details: typeof details === 'string' ? details : JSON.stringify(details || {}),
        status: 'PENDING'
      }
    });

    // Create pending transaction log
    await prisma.transaction.create({
      data: {
        userId,
        amount: wAmount,
        currency: currency || 'USD',
        type: 'WITHDRAWAL',
        status: 'PENDING',
        gateway: method || 'BANK',
        description: `Withdrawal request via ${method}`
      }
    });

    emitWalletUpdate(req, userId);
    res.json({ success: true, request, wallet: updatedWallet });
  } catch (error) {
    console.error('[WITHDRAW ERROR]', error);
    res.status(500).json({ error: 'Failed to request withdrawal' });
  }
});

// 4. Create Escrow (Client locks funds for a freelancer)
router.post('/escrow/create', authenticateToken, async (req: AuthenticatedRequest, res: any) => {
  try {
    const clientId = (req as any).user?.id;
    if (!clientId) return res.status(401).json({ error: 'Unauthorized user context.' });

    const { freelancerId, amount, currency, milestoneName, projectId, projectTitle } = req.body;
    const escAmount = parseFloat(amount);

    if (!freelancerId) return res.status(400).json({ error: 'Freelancer ID is required' });
    if (isNaN(escAmount) || escAmount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    if (clientId === freelancerId) {
      return res.status(400).json({ error: 'You cannot initiate an escrow transaction with yourself.' });
    }

    const freelancerUser = await prisma.user.findUnique({ where: { id: freelancerId as string } });
    if (!freelancerUser) return res.status(400).json({ error: 'Freelancer account not found.' });

    const wallet = await getOrCreateWallet(clientId);
    if (wallet.availableBalance < escAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance to initiate Escrow.' });
    }

    // Hold funds from client wallet
    const updatedWallet = await prisma.wallet.update({
      where: { userId: clientId },
      data: { availableBalance: wallet.availableBalance - escAmount }
    });

    // Create Escrow entry
    const escrow = await prisma.escrow.create({
      data: {
        clientId,
        freelancerId,
        amount: escAmount,
        currency: currency || 'USD',
        projectId: projectId || '',
        projectTitle: projectTitle || 'Project Escrow',
        milestoneName: milestoneName || 'Project Milestone',
        status: 'HELD'
      }
    });

    // Log transaction
    await prisma.transaction.create({
      data: {
        userId: clientId,
        amount: escAmount,
        currency: currency || 'USD',
        type: 'ESCROW_DEPOSIT',
        status: 'COMPLETED',
        gateway: 'ESCROW',
        description: `Escrow held for: ${projectTitle || 'Project Escrow'}`
      }
    });

    emitWalletUpdate(req, clientId);
    emitWalletUpdate(req, freelancerId);
    res.json({ success: true, escrow, wallet: updatedWallet });
  } catch (error) {
    console.error('[ESCROW CREATE ERROR]', error);
    res.status(500).json({ error: 'Failed to initiate escrow' });
  }
});

// 5. Release Escrow (Authorized only for the Client who funded it)
router.post('/escrow/release', authenticateToken, async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = (req as any).user?.id;
    const { escrowId } = req.body;
    if (!escrowId) return res.status(400).json({ error: 'Escrow ID is required' });

    const escrow = await prisma.escrow.findUnique({ where: { id: escrowId as string } });
    if (!escrow) return res.status(404).json({ error: 'Escrow transaction not found.' });

    // IDOR Protection: Only the client who funded the escrow can release it to the freelancer
    if (escrow.clientId !== userId) {
      return res.status(403).json({ error: 'Forbidden. Only the client can authorize escrow release.' });
    }

    if (escrow.status !== 'HELD' && escrow.status !== 'DISPUTED') {
      return res.status(400).json({ error: `Escrow cannot be released from status: ${escrow.status}` });
    }

    // Update status
    const updatedEscrow = await prisma.escrow.update({
      where: { id: escrowId as string },
      data: { status: 'RELEASED' }
    });

    // Add to freelancer's wallet balance
    const fWallet = await getOrCreateWallet(escrow.freelancerId);
    await prisma.wallet.update({
      where: { userId: escrow.freelancerId },
      data: { availableBalance: fWallet.availableBalance + escrow.amount }
    });

    // Log Release transaction
    await prisma.transaction.create({
      data: {
        userId: escrow.freelancerId,
        amount: escrow.amount,
        currency: escrow.currency,
        type: 'ESCROW_RELEASE',
        status: 'COMPLETED',
        gateway: 'ESCROW',
        description: `Escrow released for project: ${escrow.projectTitle || 'Milestone'}`
      }
    });

    emitWalletUpdate(req, escrow.clientId);
    emitWalletUpdate(req, escrow.freelancerId);
    res.json({ success: true, escrow: updatedEscrow });
  } catch (error) {
    console.error('[ESCROW RELEASE ERROR]', error);
    res.status(500).json({ error: 'Failed to release escrow' });
  }
});

// 6. Dispute Escrow (Either client or freelancer involved can dispute)
router.post('/escrow/dispute', authenticateToken, async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = (req as any).user?.id;
    const { escrowId, reason } = req.body;
    if (!escrowId || !reason) return res.status(400).json({ error: 'Escrow ID and Reason are required' });

    const escrow = await prisma.escrow.findUnique({ where: { id: escrowId as string } });
    if (!escrow) return res.status(404).json({ error: 'Escrow not found' });

    // IDOR Protection: Only the involved client or freelancer can raise a dispute
    if (escrow.clientId !== userId && escrow.freelancerId !== userId) {
      return res.status(403).json({ error: 'Access denied. You are not a party to this escrow.' });
    }

    if (escrow.status !== 'HELD') {
      return res.status(400).json({ error: 'Only HELD escrows can be disputed.' });
    }

    // Update status
    const updatedEscrow = await prisma.escrow.update({
      where: { id: escrowId as string },
      data: { status: 'DISPUTED' }
    });

    // Create Dispute entry
    const dispute = await prisma.dispute.create({
      data: {
        escrowId,
        reason,
        raisedById: userId,
        status: 'OPEN'
      }
    });

    emitWalletUpdate(req, escrow.clientId);
    emitWalletUpdate(req, escrow.freelancerId);
    res.json({ success: true, escrow: updatedEscrow, dispute });
  } catch (error) {
    console.error('[DISPUTE ERROR]', error);
    res.status(500).json({ error: 'Failed to log dispute' });
  }
});

// 7. Get Transaction Logs
router.get('/transactions', authenticateToken, async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = (req as any).user?.id;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// 8. Get Escrow Logs (As Client or Freelancer)
router.get('/escrows', authenticateToken, async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = (req as any).user?.id;
    const escrows = await prisma.escrow.findMany({
      where: {
        OR: [
          { clientId: userId },
          { freelancerId: userId }
        ]
      },
      include: {
        client: { select: { name: true, email: true } },
        freelancer: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(escrows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch escrows' });
  }
});

// 9. Get Withdrawal Requests
router.get('/withdrawals', authenticateToken, async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = (req as any).user?.id;
    const requests = await prisma.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

// 10. Get Invoices list
router.get('/invoices', authenticateToken, async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = (req as any).user?.id;
    const invoices = await prisma.invoice.findMany({
      where: {
        transaction: { userId }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// ==========================================
// STRIPE WEBHOOK LISTENER (PUBLIC SECURED ENDPOINT)
// ==========================================
router.post('/webhook', async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  let event: any;

  try {
    // rawBody is attached by Express middleware
    const payload = req.rawBody || req.body;
    event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`[WEBHOOK SIGNATURE VERIFICATION FAILED]`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const amount = parseFloat(session.metadata?.amount || '0');

    if (userId && amount > 0) {
      try {
        console.log(`[STRIPE WEBHOOK] Depositing $${amount} for User ID ${userId}`);

        // Update Wallet Balance
        const wallet = await getOrCreateWallet(userId);
        const updatedWallet = await prisma.wallet.update({
          where: { userId },
          data: { availableBalance: wallet.availableBalance + amount }
        });

        // Create transaction log
        const transaction = await prisma.transaction.create({
          data: {
            userId,
            amount,
            currency: 'USD',
            type: 'DEPOSIT',
            status: 'COMPLETED',
            gateway: 'STRIPE',
            description: 'Stripe Card Deposit'
          }
        });

        // Create Invoice
        const invoiceNum = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const userObj = await prisma.user.findUnique({ where: { id: userId as string } });
        await prisma.invoice.create({
          data: {
            transactionId: transaction.id,
            invoiceNumber: invoiceNum,
            senderName: 'Stripe Payments Inc.',
            receiverName: userObj?.name || 'ZilVerse Partner',
            amount,
            currency: 'USD'
          }
        });

        emitWalletUpdate(req, userId);
      } catch (err) {
        console.error('[STRIPE WEBHOOK DB COMMIT ERROR]', err);
        return res.status(500).json({ error: 'DB update failure during webhook processing.' });
      }
    }
  }

  res.json({ received: true });
});

// ==========================================
// ADMIN WORKFLOWS (AUTHENTICATED + ADMIN CHECK)
// ==========================================

// ADMIN 1: Get Payments Summary / Admin Panel Control
router.get('/admin/summary', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: any) => {
  try {
    const [transactions, escrows, withdrawals, disputes] = await Promise.all([
      prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.escrow.findMany({ include: { client: { select: { name: true } }, freelancer: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.withdrawalRequest.findMany({ include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.dispute.findMany({ include: { escrow: true, raisedBy: { select: { name: true } } }, orderBy: { createdAt: 'desc' } })
    ]);

    const volume = transactions.reduce((acc, t) => acc + (t.status === 'COMPLETED' ? t.amount : 0), 0);
    const activeEscrowVolume = escrows.reduce((acc, e) => acc + (e.status === 'HELD' ? e.amount : 0), 0);

    res.json({
      transactions,
      escrows,
      withdrawals,
      disputes,
      volume,
      activeEscrowVolume
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments summary' });
  }
});

// ADMIN 2: Approve Withdrawal Request
router.post('/admin/withdrawals/:id/approve', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: any) => {
  try {
    const { id: idParam } = req.params;
    const id = idParam as string;
    const reqObj = await prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!reqObj) return res.status(404).json({ error: 'Withdrawal request not found' });
    if (reqObj.status !== 'PENDING') return res.status(400).json({ error: 'Request is already processed' });

    // Update Request Status
    await prisma.withdrawalRequest.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    // Update pending transaction status to completed
    const tx = await prisma.transaction.findFirst({
      where: { userId: reqObj.userId, amount: reqObj.amount, type: 'WITHDRAWAL', status: 'PENDING' }
    });
    if (tx) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: 'COMPLETED' }
      });
    }

    emitWalletUpdate(req, reqObj.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve withdrawal' });
  }
});

// ADMIN 3: Reject Withdrawal Request
router.post('/admin/withdrawals/:id/reject', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: any) => {
  try {
    const { id: idParam } = req.params;
    const id = idParam as string;
    const reqObj = await prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!reqObj) return res.status(404).json({ error: 'Withdrawal request not found' });
    if (reqObj.status !== 'PENDING') return res.status(400).json({ error: 'Request is already processed' });

    // Update Request Status
    await prisma.withdrawalRequest.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    // Refund Available Balance in Wallet
    const wallet = await getOrCreateWallet(reqObj.userId);
    await prisma.wallet.update({
      where: { userId: reqObj.userId },
      data: { availableBalance: wallet.availableBalance + reqObj.amount }
    });

    // Update transaction to failed
    const tx = await prisma.transaction.findFirst({
      where: { userId: reqObj.userId, amount: reqObj.amount, type: 'WITHDRAWAL', status: 'PENDING' }
    });
    if (tx) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: 'FAILED', description: 'Withdrawal request rejected by Admin (refunded)' }
      });
    }

    emitWalletUpdate(req, reqObj.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject withdrawal' });
  }
});

// ADMIN 4: Resolve Escrow Dispute
router.post('/admin/disputes/:id/resolve', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: any) => {
  try {
    const { id: idParam } = req.params;
    const id = idParam as string;
    const { resolution } = req.body;
    if (!resolution || (resolution !== 'CLIENT' && resolution !== 'FREELANCER')) {
      return res.status(400).json({ error: 'Invalid resolution choice. Choose CLIENT or FREELANCER.' });
    }

    const dispute = await prisma.dispute.findUnique({ where: { id }, include: { escrow: true } }) as any;
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });
    if (dispute.status !== 'OPEN') return res.status(400).json({ error: 'Dispute is already resolved' });

    const escrow = dispute.escrow;

    if (resolution === 'CLIENT') {
      // Refund Client
      await prisma.escrow.update({
        where: { id: escrow.id as string },
        data: { status: 'REFUNDED' }
      });
      const clientWallet = await getOrCreateWallet(escrow.clientId);
      await prisma.wallet.update({
        where: { userId: escrow.clientId },
        data: { availableBalance: clientWallet.availableBalance + escrow.amount }
      });
      // Log Refund Transaction
      await prisma.transaction.create({
        data: {
          userId: escrow.clientId,
          amount: escrow.amount,
          currency: escrow.currency,
          type: 'REFUND',
          status: 'COMPLETED',
          gateway: 'STRIPE',
          description: `Dispute refund for project: ${escrow.projectTitle || 'Milestone'}`
        }
      });
    } else {
      // Release to Freelancer
      await prisma.escrow.update({
        where: { id: escrow.id as string },
        data: { status: 'RELEASED' }
      });
      const fWallet = await getOrCreateWallet(escrow.freelancerId);
      await prisma.wallet.update({
        where: { userId: escrow.freelancerId },
        data: { availableBalance: fWallet.availableBalance + escrow.amount }
      });
      // Log Release Transaction
      await prisma.transaction.create({
        data: {
          userId: escrow.freelancerId,
          amount: escrow.amount,
          currency: escrow.currency,
          type: 'ESCROW_RELEASE',
          status: 'COMPLETED',
          gateway: 'WISE',
          description: `Dispute settlement released for project: ${escrow.projectTitle || 'Milestone'}`
        }
      });
    }

    // Resolve Dispute
    await prisma.dispute.update({
      where: { id },
      data: {
        status: resolution === 'CLIENT' ? 'RESOLVED_CLIENT' : 'RESOLVED_FREELANCER',
        resolution: `Resolved by Super Admin: Funds awarded to ${resolution.toLowerCase()}`
      }
    });

    emitWalletUpdate(req, escrow.clientId);
    emitWalletUpdate(req, escrow.freelancerId);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
});

// ==========================================
// RAZORPAY STANDARD CHECKOUT API ENDPOINTS
// ==========================================

const createOrderHandler = async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized user context.' });

    const { amount, currency, receipt } = req.body;
    
    // Validate amount (paise)
    const paiseAmount = parseInt(amount, 10);
    if (isNaN(paiseAmount) || paiseAmount < 100) {
      return res.status(400).json({ error: 'Amount must be at least 100 paise.' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_Sxuhmk2KLWNZx5';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '0XjyIUAtjCmUa29O0JowbV2J';
    if (!keyId || !keySecret || keyId === 'dummy_key_id' || keySecret === 'dummy_key_secret') {
      return res.status(401).json({ error: 'Razorpay keys are not configured on the server.' });
    }

    const options = {
      amount: paiseAmount,
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    return res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error: any) {
    console.error('[RAZORPAY CREATE ORDER ERROR]', error);
    return res.status(500).json({ error: 'Failed to create Razorpay order: ' + error.message });
  }
};

const verifyPaymentHandler = async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized user context.' });

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, currency, type, description, sellerId, projectId } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required Razorpay fields.' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '0XjyIUAtjCmUa29O0JowbV2J';
    if (!keySecret || keySecret === 'dummy_key_secret') {
      return res.status(401).json({ error: 'Razorpay secret is not configured on the server.' });
    }

    // Generate expected signature
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature verification failed. Mismatch.' });
    }

    // Credit User's Wallet if amount and currency are provided
    let updatedWallet = null;
    let transaction = null;
    if (amount) {
      const parsedAmount = parseFloat(amount);
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        // Convert to USD base if currency is INR or other (EXCHANGE_RATES)
        const rates: Record<string, number> = {
          USD: 1.0,
          INR: 83.5,
          EUR: 0.92,
          GBP: 0.79,
          AED: 3.67,
          SGD: 1.35
        };
        const rate = rates[currency?.toUpperCase()] || 1.0;
        const usdAmount = parsedAmount / rate;

        let finalType = type || 'DEPOSIT';
        let finalDescription = description || `Razorpay Deposit (${currency} ${parsedAmount})`;

        if (finalType === 'PURCHASE') {
          // It's a purchase. Do not add to buyer's wallet available balance.
          // Instead, log the transaction as PURCHASE.
          transaction = await prisma.transaction.create({
            data: {
              userId,
              amount: usdAmount,
              currency: 'USD',
              type: 'PURCHASE',
              status: 'COMPLETED',
              gateway: 'RAZORPAY',
              description: finalDescription
            }
          });

          // Credit the seller if sellerId is provided
          if (sellerId) {
            const sellerWallet = await getOrCreateWallet(sellerId);
            const fee = usdAmount * 0.10; // 10% platform fee
            const sellerEarned = usdAmount - fee;
            
            await prisma.wallet.update({
              where: { userId: sellerId },
              data: { availableBalance: sellerWallet.availableBalance + sellerEarned }
            });

            await prisma.transaction.create({
              data: {
                userId: sellerId,
                amount: sellerEarned,
                currency: 'USD',
                type: 'SALE',
                status: 'COMPLETED',
                gateway: 'SYSTEM',
                description: `Sale Revenue: ${finalDescription}`
              }
            });
            emitWalletUpdate(req, sellerId);
          }
        } else {
          // Standard deposit to own wallet
          const wallet = await getOrCreateWallet(userId);
          updatedWallet = await prisma.wallet.update({
            where: { userId },
            data: { availableBalance: wallet.availableBalance + usdAmount }
          });

          transaction = await prisma.transaction.create({
            data: {
              userId,
              amount: usdAmount,
              currency: 'USD',
              type: finalType,
              status: 'COMPLETED',
              gateway: 'RAZORPAY',
              description: finalDescription
            }
          });
        }

        // Create Invoice
        const invoiceNum = 'INV-RZP-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const userObj = await prisma.user.findUnique({ where: { id: userId } });
        await prisma.invoice.create({
          data: {
            transactionId: transaction.id,
            invoiceNumber: invoiceNum,
            senderName: 'Razorpay Payments Inc.',
            receiverName: userObj?.name || 'ZilVerse Partner',
            amount: usdAmount,
            currency: 'USD'
          }
        });

        emitWalletUpdate(req, userId);
      }
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully.',
      wallet: updatedWallet,
      transaction
    });
  } catch (error: any) {
    console.error('[RAZORPAY VERIFY PAYMENT ERROR]', error);
    return res.status(500).json({ error: 'Failed to verify payment: ' + error.message });
  }
};

router.post('/create-order', authenticateToken, createOrderHandler as any);
router.post('/razorpay/create-order', authenticateToken, createOrderHandler as any);
router.post('/verify-payment', authenticateToken, verifyPaymentHandler as any);
router.post('/razorpay/verify-payment', authenticateToken, verifyPaymentHandler as any);

export default router;

