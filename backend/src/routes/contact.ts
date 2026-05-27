import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const contactMsg = await prisma.contactMessage.create({
      data: { name, email, subject, message }
    });
    res.status(201).json(contactMsg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
