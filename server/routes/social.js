import express from 'express';
import mongoose from 'mongoose';
import { SocialLink } from '../models/SocialLink.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function findSocialQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) return { _id: id };
  return { _id: null };
}

// GET /api/social — public
router.get('/', async (req, res) => {
  try {
    const links = await SocialLink.find({ isActive: true, url: { $ne: '' } }).sort({ displayOrder: 1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch social links.' });
  }
});

// GET /api/social/all — admin
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const links = await SocialLink.find().sort({ displayOrder: 1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch social links.' });
  }
});

// PUT /api/social/:id — protected
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { url, is_active, isActive } = req.body;

    const link = await SocialLink.findOne(findSocialQuery(id));
    if (!link) return res.status(404).json({ error: 'Social link not found.' });

    if (url !== undefined) link.url = url.trim();
    if (isActive !== undefined || is_active !== undefined) link.isActive = Boolean(isActive ?? is_active);

    await link.save();

    res.json({ success: true, link, message: 'Social link updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update social link.' });
  }
});

// PUT /api/social/bulk/update — update all at once
router.put('/bulk/update', authenticateToken, async (req, res) => {
  try {
    const { links } = req.body;
    if (!Array.isArray(links)) return res.status(400).json({ error: 'Links must be an array.' });

    for (const item of links) {
      if (item.id && mongoose.Types.ObjectId.isValid(item.id)) {
        await SocialLink.findByIdAndUpdate(item.id, {
          url: (item.url || '').trim(),
          isActive: Boolean(item.is_active ?? item.isActive),
        });
      } else if (item.platform) {
        await SocialLink.findOneAndUpdate(
          { platform: item.platform },
          {
            url: (item.url || '').trim(),
            isActive: Boolean(item.is_active ?? item.isActive),
          }
        );
      }
    }

    const updated = await SocialLink.find().sort({ displayOrder: 1 });
    res.json({ success: true, links: updated, message: 'Social links updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update social links.' });
  }
});

export default router;
