import express from 'express';
import prisma from '../lib/prisma';
import { requireAuth as authenticateToken } from '../middleware/auth';
import { uploadImage, getFileUrl } from '../config/cloudinary';

const router = express.Router();

// Get all jobs with pagination + search + filters
router.get('/', async (req, res): Promise<any> => {
  try {
    const page     = parseInt(req.query.page     as string) || 1;
    const limit    = parseInt(req.query.limit    as string) || 20;
    const skip     = (page - 1) * limit;
    const { q, type, location } = req.query;

    const where: any = {};
    if (type)     where.type     = { contains: type     as string, mode: 'insensitive' };
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { title:       { contains: q as string, mode: 'insensitive' } },
        { company:     { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
        { location:    { contains: q as string, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        include: {
          employer: { select: { name: true, avatar: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.job.count({ where })
    ]);

    res.json({
      data: jobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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

    // Emit real-time WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.emit('new_job', job);
    }

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

      // Emit real-time WebSocket event for application
      const io = req.app.get('io');
      if (io) {
        // Notify the employer specifically
        io.to(existingJob.employerId).emit('new_application', application);
      }

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


// ── PATCH /api/jobs/application/:id/status — update application status ────────
router.patch('/application/:id/status', authenticateToken, async (req: any, res: any) => {
  try {
    const uid = String(req.user?.id);
    const { id } = req.params as Record<string, string>;
    const { status } = req.body; // PENDING | APPLIED | REVIEWING | INTERVIEW | OFFERED | ACCEPTED | REJECTED

    const VALID = ['PENDING','APPLIED','REVIEWING','INTERVIEW','OFFERED','ACCEPTED','REJECTED'];
    if (!VALID.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    // Applicant can update their own; employer can update applications to their jobs
    const app = await prisma.jobApplication.findUnique({
      where: { id },
      include: { job: { select: { employerId: true } } },
    });
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const isApplicant = app.applicantId === uid;
    const isEmployer  = app.job?.employerId === uid;
    if (!isApplicant && !isEmployer) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: { status },
    });

    // Real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(app.applicantId).emit('application_status_update', { applicationId: id, status });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});


// ── GET /api/jobs/applications — get user's own applications ──────────────
router.get('/applications', authenticateToken, async (req: any, res: any) => {
  try {
    const uid = String(req.user?.id);
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const apps = await prisma.jobApplication.findMany({
      where:   { applicantId: uid },
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(apps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

export default router;
