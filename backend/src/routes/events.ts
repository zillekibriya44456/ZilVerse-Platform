import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({ orderBy: { date: 'asc' } });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { title, type, date, location, description } = req.body;
    const event = await prisma.event.create({
      data: { title, type, date, location, description }
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;
