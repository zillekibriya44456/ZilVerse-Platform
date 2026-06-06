import prisma from '../lib/prisma';
import express from 'express';


import { authenticateToken } from '../middleware/auth';

const router = express.Router();


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
router.post('/create', authenticateToken, async (req: any, res: any) => {
  try {
    const { title, authors, abstract, pdfUrl, category } = req.body;
    
    const uid = req.user?.id;
    if (!uid) {
       return res.status(401).json({ error: 'Unauthorized user context.' });
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
router.post('/:id/upvote', authenticateToken, async (req, res) => {
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
