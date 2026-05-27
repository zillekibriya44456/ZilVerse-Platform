"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// @ts-ignore
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
        cb(null, unique + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
// POST /api/profiles/freelancer (Secure freelancer profile creation)
router.post('/freelancer', auth_1.authenticateToken, upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 },
]), (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized user context.' });
        }
        const files = req.files;
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
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/profiles/apply (Secure job/internship application)
router.post('/apply', auth_1.authenticateToken, upload.single('resume'), (req, res) => {
    try {
        const applicantId = req.user?.id;
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
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=profiles.js.map