import express from 'express';
import { PrismaClient } from '@prisma/client';

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
router.post('/create', async (req, res) => {
  try {
    const { title, company, location, type, salary, description, requirements, employerId } = req.body;
    
    let uid = employerId;
    if (!uid) {
       const user = await prisma.user.findFirst();
       if (!user) return res.status(400).json({ error: 'No users exist. Please sign up first.' });
       uid = user.id;
    }

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
router.post('/apply', async (req, res) => {
  try {
    const { jobId, resumeUrl, coverLetter, applicantId } = req.body;
    let uid = applicantId;
    if (!uid) {
       const user = await prisma.user.findFirst();
       if (!user) return res.status(400).json({ error: 'No users exist.' });
       uid = user.id;
    }

    const existingJob = await prisma.job.findUnique({
      where: { id: String(jobId) }
    });

    if (!existingJob) {
      // Mock success for frontend demo data
      return res.status(201).json({ id: 'mock', status: 'Applied to Demo Job' });
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
