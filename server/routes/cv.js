import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { CV } from '../models/CV.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadCV, deleteFile } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// GET /api/cv — public (returns metadata only)
router.get('/', async (req, res) => {
  try {
    const cv = await CV.findOne({ isActive: true }).sort({ uploadedAt: -1 });
    if (!cv) return res.json({ cv: null });
    res.json({ cv: { id: cv._id.toString(), original_name: cv.originalName, uploaded_at: cv.uploadedAt } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch CV status.' });
  }
});

// GET /api/cv/download — public (download the file)
router.get('/download', async (req, res) => {
  try {
    const cv = await CV.findOne({ isActive: true }).sort({ uploadedAt: -1 });
    if (!cv) return res.status(404).json({ error: 'No CV available.' });

    const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
    const filePath = path.join(UPLOADS_DIR, cv.filePath.replace('/uploads/', ''));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'CV file not found on disk.' });
    }

    res.download(filePath, cv.originalName || 'Kenechukwu_Asogwa_CV.pdf');
  } catch (err) {
    res.status(500).json({ error: 'Failed to download CV.' });
  }
});

// POST /api/cv — protected (upload CV)
router.post('/', authenticateToken, (req, res) => {
  uploadCV.single('cv')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    try {
      // Remove old CV
      const oldCvs = await CV.find();
      for (const old of oldCvs) {
        deleteFile(old.filePath);
      }
      await CV.deleteMany({});

      const cvPath = `/uploads/cv/${req.file.filename}`;
      const newCv = await CV.create({
        filePath: cvPath,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        isActive: true,
      });

      res.json({ success: true, message: 'CV uploaded successfully.', cv: newCv, original_name: req.file.originalname });
    } catch (saveErr) {
      res.status(500).json({ error: 'Failed to save CV to database.' });
    }
  });
});

// DELETE /api/cv — protected
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const cvs = await CV.find();
    if (!cvs.length) return res.status(404).json({ error: 'No CV found.' });

    for (const cv of cvs) {
      deleteFile(cv.filePath);
    }
    await CV.deleteMany({});

    res.json({ success: true, message: 'CV deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete CV.' });
  }
});

export default router;
