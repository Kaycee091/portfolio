import express from 'express';
import mongoose from 'mongoose';
import { Experience } from '../models/Experience.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function findExpQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) return { _id: id };
  return { _id: null };
}

// GET /api/experience — public
router.get('/', async (req, res) => {
  try {
    const list = await Experience.find().sort({ displayOrder: 1, createdAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch experience.' });
  }
});

// POST /api/experience — protected
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      organization,
      role,
      location,
      start_date, startDate,
      end_date, endDate,
      is_current, isCurrent,
      description,
      display_order, displayOrder,
    } = req.body;

    if (!organization) return res.status(400).json({ error: 'Organization name is required.' });

    const exp = await Experience.create({
      organization: organization.trim(),
      role: (role || '').trim(),
      location: (location || '').trim(),
      startDate: (startDate ?? start_date ?? '').trim(),
      endDate: (endDate ?? end_date ?? '').trim(),
      isCurrent: isCurrent !== undefined ? Boolean(isCurrent) : is_current !== undefined ? Boolean(is_current) : true,
      description: (description || '').trim(),
      displayOrder: Number(displayOrder ?? display_order ?? 0),
    });

    res.status(201).json({ success: true, experience: exp, message: 'Experience added successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to add experience.' });
  }
});

// PUT /api/experience/:id — protected
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      organization,
      role,
      location,
      start_date, startDate,
      end_date, endDate,
      is_current, isCurrent,
      description,
      display_order, displayOrder,
    } = req.body;

    if (!organization) return res.status(400).json({ error: 'Organization name is required.' });

    const exp = await Experience.findOne(findExpQuery(id));
    if (!exp) return res.status(404).json({ error: 'Experience not found.' });

    exp.organization = organization.trim();
    if (role !== undefined) exp.role = role.trim();
    if (location !== undefined) exp.location = location.trim();
    if (startDate !== undefined || start_date !== undefined) exp.startDate = (startDate ?? start_date).trim();
    if (endDate !== undefined || end_date !== undefined) exp.endDate = (endDate ?? end_date).trim();
    if (isCurrent !== undefined || is_current !== undefined) exp.isCurrent = Boolean(isCurrent ?? is_current);
    if (description !== undefined) exp.description = description.trim();
    if (displayOrder !== undefined || display_order !== undefined) exp.displayOrder = Number(displayOrder ?? display_order ?? 0);

    await exp.save();

    res.json({ success: true, experience: exp, message: 'Experience updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update experience.' });
  }
});

// DELETE /api/experience/:id — protected
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const exp = await Experience.findOne(findExpQuery(id));
    if (!exp) return res.status(404).json({ error: 'Experience not found.' });

    await Experience.deleteOne({ _id: exp._id });
    res.json({ success: true, message: 'Experience deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete experience.' });
  }
});

export default router;
