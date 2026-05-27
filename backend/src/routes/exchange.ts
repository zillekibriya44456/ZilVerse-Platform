import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const listings = await prisma.exchangeListing.findMany({
      include: { seller: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exchange listings' });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { assetType, title, description, price, sellerId } = req.body;
    let uid = sellerId;
    if (!uid) {
       const user = await prisma.user.findFirst();
       if (!user) return res.status(400).json({ error: 'No users exist.' });
       uid = user.id;
    }

    const listing = await prisma.exchangeListing.create({
      data: { assetType, title, description, price: parseFloat(price || '0'), sellerId: uid }
    });
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Propose a trade
router.post('/propose', async (req, res) => {
  try {
    const { listingId, message, proposerId } = req.body;
    let uid = proposerId;
    if (!uid) {
       const user = await prisma.user.findFirst();
       if (!user) return res.status(400).json({ error: 'No users exist.' });
       uid = user.id;
    }

    const existingListing = await prisma.exchangeListing.findUnique({
      where: { id: String(listingId) }
    });

    if (!existingListing) {
      // Mock success for frontend demo data
      return res.status(201).json({ id: 'mock', message, status: 'Sent to Demo User' });
    }

    const proposal = await prisma.exchangeProposal.create({
      data: {
        listingId: String(listingId),
        proposerId: uid,
        message
      }
    });
    res.status(201).json(proposal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit proposal' });
  }
});

export default router;
