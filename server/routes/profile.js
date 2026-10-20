import express from 'express';
import { Profile } from '../models/Profile.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadProfilePicture, deleteFile } from '../middleware/upload.js';

const router = express.Router();

// GET /api/profile — public
router.get('/', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// PUT /api/profile — protected
router.put('/', authenticateToken, async (req, res) => {
  try {
    const {
      full_name, fullName,
      professional_title, professionalTitle,
      location,
      tagline,
      hero_intro, heroIntro,
      about_heading, aboutHeading,
      about_description, aboutDescription,
      about_extra, aboutExtra,
    } = req.body;

    let profile = await Profile.findOne();
    if (!profile) profile = new Profile();

    if (full_name !== undefined || fullName !== undefined) profile.fullName = (full_name ?? fullName).trim();
    if (professional_title !== undefined || professionalTitle !== undefined) profile.professionalTitle = (professional_title ?? professionalTitle).trim();
    if (location !== undefined) profile.location = location.trim();
    if (tagline !== undefined) profile.tagline = tagline.trim();
    if (hero_intro !== undefined || heroIntro !== undefined) profile.heroIntro = (hero_intro ?? heroIntro).trim();
    if (about_heading !== undefined || aboutHeading !== undefined) profile.aboutHeading = (about_heading ?? aboutHeading).trim();
    if (about_description !== undefined || aboutDescription !== undefined) profile.aboutDescription = (about_description ?? aboutDescription).trim();
    if (about_extra !== undefined || aboutExtra !== undefined) profile.aboutExtra = (about_extra ?? aboutExtra).trim();

    await profile.save();

    res.json({ success: true, profile, message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unable to save profile.' });
  }
});

// POST /api/profile/picture — protected
router.post('/picture', authenticateToken, (req, res) => {
  uploadProfilePicture.any()(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    const file = req.file || (req.files && req.files[0]);
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    try {
      let profile = await Profile.findOne();
      if (!profile) profile = new Profile();

      if (profile.profilePicture) {
        deleteFile(profile.profilePicture);
      }

      const picturePath = `/uploads/profile/${file.filename}`;
      profile.profilePicture = picturePath;
      await profile.save();

      res.json({ success: true, profile_picture: picturePath, profile, message: 'Profile picture uploaded successfully.' });
    } catch (saveErr) {
      res.status(500).json({ error: 'Failed to save profile picture to database.' });
    }
  });
});

// DELETE /api/profile/picture — protected
router.delete('/picture', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile || !profile.profilePicture) {
      return res.status(404).json({ error: 'No profile picture found.' });
    }

    deleteFile(profile.profilePicture);
    profile.profilePicture = null;
    await profile.save();

    res.json({ success: true, message: 'Profile picture removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove profile picture.' });
  }
});

export default router;
