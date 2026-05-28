import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { uploadImage, getFileUrl } from '../config/cloudinary';

const router = Router();

// POST /api/profiles/freelancer (Secure freelancer profile creation)
router.post('/freelancer', authenticateToken, uploadImage.fields([
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
      resumeUrl: resumeFile ? getFileUrl(resumeFile) : null,
      photoUrl: photoFile ? getFileUrl(photoFile) : null,
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
router.post('/apply', authenticateToken, uploadImage.single('resume'), (req: any, res: Response): any => {
  try {
    const applicantId = (req as any).user?.id;
    if (!applicantId) {
      return res.status(401).json({ error: 'Unauthorized user context.' });
    }

    const resumeFile = req.file;
    const data = {
      ...req.body,
      applicantId,
      resumeUrl: resumeFile ? getFileUrl(resumeFile) : null,
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
