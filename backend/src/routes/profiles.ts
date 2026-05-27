import { Router, Response } from 'express';
// @ts-ignore
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
  filename: (_req: any, file: any, cb: any) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/profiles/freelancer (Secure freelancer profile creation)
router.post('/freelancer', authenticateToken, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 },
]), (req: any, res: Response): any => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user context.' });
    }

    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const resumeFile = files?.['resume']?.[0];
    const photoFile = files?.['profilePhoto']?.[0];
    
    const data = {
      ...req.body,
      userId,
      resumeUrl: resumeFile ? `/uploads/${resumeFile.filename}` : null,
      photoUrl: photoFile ? `/uploads/${photoFile.filename}` : null,
      savedAt: new Date().toISOString(),
    };
    
    console.log('Freelancer profile saved:', data);
    return res.status(201).json({ message: 'Profile saved', data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/profiles/apply (Secure job/internship application)
router.post('/apply', authenticateToken, upload.single('resume'), (req: any, res: Response): any => {
  try {
    const applicantId = (req as any).user?.id;
    if (!applicantId) {
      return res.status(401).json({ error: 'Unauthorized user context.' });
    }

    const resumeFile = req.file;
    const data = {
      ...req.body,
      applicantId,
      resumeUrl: resumeFile ? `/uploads/${resumeFile.filename}` : null,
      appliedAt: new Date().toISOString(),
    };
    
    console.log('Job/Internship application received:', data);
    return res.status(201).json({ message: 'Application received', data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
