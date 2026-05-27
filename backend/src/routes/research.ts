import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all research papers
router.get('/', async (req, res) => {
  try {
    const papers = await prisma.researchPaper.findMany({
      orderBy: { upvotes: 'desc' }
    });
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch research papers' });
  }
});

// Create a new research paper entry
router.post('/create', async (req, res) => {
  try {
    const { title, authors, abstract, pdfUrl, category, userId } = req.body;
    let uid = userId;

    if (!uid) {
      const user = await prisma.user.findFirst();
      if (user) uid = user.id;
    }

    const paper = await prisma.researchPaper.create({
      data: {
        title,
        authors,
        abstract,
        pdfUrl: pdfUrl || '',
        category: category || 'Computer Science',
        userId: uid
      }
    });
    res.status(201).json(paper);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create research paper entry' });
  }
});

// Upvote a research paper
router.post('/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;
    const paper = await prisma.researchPaper.findUnique({ where: { id } });
    if (!paper) return res.status(404).json({ error: 'Research paper not found' });

    const updated = await prisma.researchPaper.update({
      where: { id },
      data: { upvotes: paper.upvotes + 1 }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upvote research paper' });
  }
});

export default router;
