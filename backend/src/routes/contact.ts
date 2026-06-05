import prisma from '../lib/prisma';
import express from 'express';


const router = express.Router();


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
