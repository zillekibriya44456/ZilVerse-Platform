import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        employer: {
          select: { name: true, avatar: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Post a new job
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { title, company, location, type, salary, description, requirements } = req.body;
    const uid = (req as any).user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized context.' });

    const job = await prisma.job.create({
      data: {
        title,
        company,
        location: location || 'Remote',
        type: type || 'Full-Time',
        salary: salary || 'Competitive',
        description,
        requirements,
        employerId: uid
      }
    });
    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create job posting' });
  }
});

// Apply to a job
router.post('/apply', authenticateToken, async (req, res) => {
  try {
    const { jobId, resumeUrl, coverLetter } = req.body;
    const uid = (req as any).user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized context.' });

    const existingJob = await prisma.job.findUnique({
      where: { id: String(jobId) }
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Job posting not found.' });
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: String(jobId),
        applicantId: uid,
        resumeUrl,
        coverLetter
      }
    });
    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

export default router;
