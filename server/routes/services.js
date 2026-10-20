import express from 'express';
import mongoose from 'mongoose';
import { Service } from '../models/Service.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function findServiceQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) return { _id: id };
  return { _id: null };
}

// GET /api/services — public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

// GET /api/services/all — admin
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const services = await Service.find().sort({ displayOrder: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

// POST /api/services — protected
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, icon, display_order, displayOrder, is_active, isActive } = req.body;
    if (!title) return res.status(400).json({ error: 'Service title is required.' });

    const service = await Service.create({
      title: title.trim(),
      description: (description || '').trim(),
      icon: icon || 'code',
      displayOrder: Number(displayOrder ?? display_order ?? 0),
      isActive: isActive !== undefined ? Boolean(isActive) : is_active !== undefined ? Boolean(is_active) : true,
    });

    res.status(201).json({ success: true, service, message: 'Service added successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to add service.' });
  }
});

// PUT /api/services/:id — protected
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, display_order, displayOrder, is_active, isActive } = req.body;
    if (!title) return res.status(400).json({ error: 'Service title is required.' });

    const service = await Service.findOne(findServiceQuery(id));
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    service.title = title.trim();
    if (description !== undefined) service.description = description.trim();
    if (icon !== undefined) service.icon = icon;
    if (displayOrder !== undefined || display_order !== undefined) service.displayOrder = Number(displayOrder ?? display_order ?? 0);
    if (isActive !== undefined || is_active !== undefined) service.isActive = Boolean(isActive ?? is_active);

    await service.save();

    res.json({ success: true, service, message: 'Service updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update service.' });
  }
});

// DELETE /api/services/:id — protected
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findOne(findServiceQuery(id));
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    await Service.deleteOne({ _id: service._id });
    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete service.' });
  }
});

export default router;
