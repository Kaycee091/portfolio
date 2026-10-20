import express from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadProjectImage, uploadAPK, deleteFile } from '../middleware/upload.js';

const router = express.Router();

function findProjectQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }
  return { _id: null };
}

// GET /api/projects — public (published only)
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ published: true }).sort({ displayOrder: 1, createdAt: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

// GET /api/projects/all — admin (all projects)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find().sort({ displayOrder: 1, createdAt: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

// GET /api/projects/:id — public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne(findProjectQuery(req.params.id));
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
});

// POST /api/projects — protected
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      tagline,
      description,
      category,
      live_url, liveUrl,
      github_url, githubUrl,
      apk_url, apkUrl,
      play_store_url, playStoreUrl,
      app_store_url, appStoreUrl,
      apk_file, apkFile,
      is_featured, featured,
      is_published, published,
      display_order, displayOrder,
      technologies,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required.' });
    }

    const techArray = Array.isArray(technologies)
      ? technologies.map(t => String(t).trim()).filter(Boolean)
      : typeof technologies === 'string'
      ? technologies.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const newProject = await Project.create({
      name: name.trim(),
      tagline: (tagline || '').trim(),
      description: (description || '').trim(),
      category: category || 'Mobile App Project',
      liveUrl: (liveUrl ?? live_url ?? '').trim(),
      githubUrl: (githubUrl ?? github_url ?? '').trim(),
      apkUrl: (apkUrl ?? apk_url ?? '').trim(),
      playStoreUrl: (playStoreUrl ?? play_store_url ?? '').trim(),
      appStoreUrl: (appStoreUrl ?? app_store_url ?? '').trim(),
      apkFile: apkFile ?? apk_file ?? null,
      featured: Boolean(featured ?? is_featured),
      published: published !== undefined ? Boolean(published) : is_published !== undefined ? Boolean(is_published) : true,
      displayOrder: Number(displayOrder ?? display_order ?? 0),
      technologies: techArray,
    });

    res.status(201).json({ success: true, project: newProject, message: 'Project created successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create project.' });
  }
});

// PUT /api/projects/:id — protected
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      tagline,
      description,
      category,
      live_url, liveUrl,
      github_url, githubUrl,
      apk_url, apkUrl,
      play_store_url, playStoreUrl,
      app_store_url, appStoreUrl,
      apk_file, apkFile,
      is_featured, featured,
      is_published, published,
      display_order, displayOrder,
      technologies,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required.' });
    }

    const project = await Project.findOne(findProjectQuery(id));
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    project.name = name.trim();
    if (tagline !== undefined) project.tagline = tagline.trim();
    if (description !== undefined) project.description = description.trim();
    if (category !== undefined) project.category = category;
    if (liveUrl !== undefined || live_url !== undefined) project.liveUrl = (liveUrl ?? live_url ?? '').trim();
    if (githubUrl !== undefined || github_url !== undefined) project.githubUrl = (githubUrl ?? github_url ?? '').trim();
    if (apkUrl !== undefined || apk_url !== undefined) project.apkUrl = (apkUrl ?? apk_url ?? '').trim();
    if (playStoreUrl !== undefined || play_store_url !== undefined) project.playStoreUrl = (playStoreUrl ?? play_store_url ?? '').trim();
    if (appStoreUrl !== undefined || app_store_url !== undefined) project.appStoreUrl = (appStoreUrl ?? app_store_url ?? '').trim();
    if (apkFile !== undefined || apk_file !== undefined) project.apkFile = apkFile ?? apk_file;
    if (featured !== undefined || is_featured !== undefined) project.featured = Boolean(featured ?? is_featured);
    if (published !== undefined || is_published !== undefined) project.published = Boolean(published ?? is_published);
    if (displayOrder !== undefined || display_order !== undefined) project.displayOrder = Number(displayOrder ?? display_order ?? 0);

    if (technologies !== undefined) {
      project.technologies = Array.isArray(technologies)
        ? technologies.map(t => String(t).trim()).filter(Boolean)
        : typeof technologies === 'string'
        ? technologies.split(',').map(t => t.trim()).filter(Boolean)
        : [];
    }

    await project.save();

    res.json({ success: true, project, message: 'Project updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update project.' });
  }
});

// DELETE /api/projects/:id — protected
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne(findProjectQuery(id));
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    if (project.image) deleteFile(project.image);
    if (project.apkFile) deleteFile(project.apkFile);
    if (Array.isArray(project.screenshots)) {
      project.screenshots.forEach(deleteFile);
    }

    await Project.deleteOne({ _id: project._id });
    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// POST /api/projects/:id/image — protected (main image upload)
router.post('/:id/image', authenticateToken, (req, res) => {
  uploadProjectImage.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    try {
      const { id } = req.params;
      const project = await Project.findOne(findProjectQuery(id));
      if (!project) return res.status(404).json({ error: 'Project not found.' });

      if (project.image) deleteFile(project.image);

      const imagePath = `/uploads/projects/${req.file.filename}`;
      project.image = imagePath;
      await project.save();

      res.json({ success: true, main_image: imagePath, project, message: 'Project image uploaded successfully.' });
    } catch (saveErr) {
      res.status(500).json({ error: 'Failed to save project image.' });
    }
  });
});

// POST /api/projects/:id/screenshots — protected
router.post('/:id/screenshots', authenticateToken, (req, res) => {
  uploadProjectImage.array('screenshots', 10)(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded.' });

    try {
      const { id } = req.params;
      const project = await Project.findOne(findProjectQuery(id));
      if (!project) return res.status(404).json({ error: 'Project not found.' });

      const newScreenshots = req.files.map(f => `/uploads/projects/${f.filename}`);
      project.screenshots.push(...newScreenshots);
      await project.save();

      res.json({
        success: true,
        images: project.screenshots.map((s, i) => ({ id: i + 1, file_path: s })),
        message: 'Screenshots uploaded successfully.',
      });
    } catch (saveErr) {
      res.status(500).json({ error: 'Failed to save screenshots.' });
    }
  });
});

// POST /api/projects/:id/apk — protected (Android APK upload)
router.post('/:id/apk', authenticateToken, (req, res) => {
  uploadAPK.single('apk')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No APK file uploaded.' });

    try {
      const { id } = req.params;
      const project = await Project.findOne(findProjectQuery(id));
      if (!project) return res.status(404).json({ error: 'Project not found.' });

      if (project.apkFile) deleteFile(project.apkFile);

      const apkPath = `/uploads/apps/${req.file.filename}`;
      project.apkFile = apkPath;
      await project.save();

      res.json({
        success: true,
        apk_file: apkPath,
        apkFile: apkPath,
        project,
        message: 'Android APK file uploaded successfully.',
      });
    } catch (saveErr) {
      res.status(500).json({ error: 'Failed to save APK file.' });
    }
  });
});

// DELETE /api/projects/:id/apk — protected (remove APK)
router.delete('/:id/apk', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne(findProjectQuery(id));
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    if (project.apkFile) {
      deleteFile(project.apkFile);
      project.apkFile = null;
      await project.save();
    }

    res.json({ success: true, project, message: 'APK removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove APK file.' });
  }
});

export default router;
