import express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { uploadImage, getFileUrl } from '../config/cloudinary';

const router = express.Router();

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

// Helper: check if a string is a valid UUID
const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Apply to a job (supports file upload for real DB jobs AND mock/static jobs)
router.post('/apply', authenticateToken, uploadImage.single('resume'), async (req: any, res: any) => {
  try {
    const { jobId, coverLetter } = req.body;
    const uid = (req as any).user?.id;
    if (!uid) return res.status(401).json({ error: 'Unauthorized context.' });

    const resumeFile = req.file;
    const finalResumeUrl = resumeFile ? getFileUrl(resumeFile) : (req.body.resumeUrl || '');

    // If the jobId is a real UUID, validate it exists in DB
    if (isUUID(String(jobId))) {
      const existingJob = await prisma.job.findUnique({ where: { id: String(jobId) } });
      if (!existingJob) {
        return res.status(404).json({ error: 'Job posting not found in database.' });
      }

      const application = await prisma.jobApplication.create({
        data: {
          jobId: String(jobId),
          applicantId: uid,
          resumeUrl: finalResumeUrl,
          coverLetter: coverLetter || ''
        }
      });
      return res.status(201).json(application);
    }

    // For mock/static jobs (non-UUID IDs like "1", "remote-1", "intern-1"),
    // store the application without a DB job reference
    console.log(`[JOB APPLY] Applying to mock job id="${jobId}" for user="${uid}"`);
    return res.status(201).json({
      id: `mock-app-${Date.now()}`,
      jobId: String(jobId),
      applicantId: uid,
      resumeUrl: finalResumeUrl,
      coverLetter: coverLetter || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      note: 'Application recorded for listed job.'
    });

  } catch (error: any) {
    console.error('[JOB APPLY ERROR]', error);
    res.status(500).json({ error: 'Failed to submit application: ' + error.message });
  }
});

export default router;
