import prisma from '../lib/prisma';
import express from 'express';


import { authenticateToken } from '../middleware/auth';

const router = express.Router();


// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await prisma.digitalService.findMany({
      include: {
        seller: {
          select: { name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Create a new digital service
router.post('/create', authenticateToken, async (req: any, res: any) => {
  try {
    const { title, description, price, category, deliveryTime } = req.body;
    
    const uid = req.user?.id;
    if (!uid) {
       return res.status(401).json({ error: 'Unauthorized user context.' });
    }

    const service = await prisma.digitalService.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category: category || 'Software',
        deliveryTime: deliveryTime || '3 Days',
        sellerId: uid
      }
    });
    res.status(201).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create digital service' });
  }
});
// Request a quote for a service
router.post('/quote', async (req, res) => {
  try {
    const { serviceTitle, name, email, phone, company, budget, message, status } = req.body;
    if (!serviceTitle || !name || !email || !message) {
      return res.status(400).json({ error: 'serviceTitle, name, email, and message are required.' });
    }

    const quote = await prisma.serviceQuote.create({
      data: {
        serviceTitle,
        name,
        email,
        phone: phone || null,
        company: company || null,
        budget: budget || null,
        message,
        status: status || 'PENDING'
      }
    });
    res.status(201).json(quote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit quote request' });
  }
});

// Get all quote requests (admin)
router.get('/quotes', async (req, res) => {
  try {
    const quotes = await prisma.serviceQuote.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

export default router;
