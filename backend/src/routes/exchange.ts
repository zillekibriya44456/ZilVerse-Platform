import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

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

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { assetType, title, description, price } = req.body;
    const uid = (req as any).user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized context.' });

    const listing = await prisma.exchangeListing.create({
      data: { assetType, title, description, price: parseFloat(price || '0'), sellerId: uid }
    });
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Propose a trade
router.post('/propose', authenticateToken, async (req, res) => {
  try {
    const { listingId, message } = req.body;
    const uid = (req as any).user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized context.' });

    const existingListing = await prisma.exchangeListing.findUnique({
      where: { id: String(listingId) }
    });

    if (!existingListing) {
      return res.status(404).json({ error: 'Exchange listing not found.' });
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
