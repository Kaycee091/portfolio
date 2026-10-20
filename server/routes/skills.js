import express from 'express';
import mongoose from 'mongoose';
import { Skill } from '../models/Skill.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function findSkillQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) return { _id: id };
  return { _id: null };
}

// GET /api/skills — public
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find({ isActive: true }).sort({ category: 1, displayOrder: 1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch skills.' });
  }
});

// GET /api/skills/all — admin (includes inactive)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, displayOrder: 1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch skills.' });
  }
});

// POST /api/skills — protected
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, category, icon, display_order, displayOrder, is_active, isActive, proficiency } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required.' });
    }

    const skill = await Skill.create({
      name: name.trim(),
      category: category.trim(),
      proficiency: proficiency !== undefined ? Number(proficiency) : 90,
      icon: icon || null,
      displayOrder: Number(displayOrder ?? display_order ?? 0),
      isActive: isActive !== undefined ? Boolean(isActive) : is_active !== undefined ? Boolean(is_active) : true,
    });

    res.status(201).json({ success: true, skill, message: 'Skill added successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to add skill.' });
  }
});

// PUT /api/skills/:id — protected
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, icon, display_order, displayOrder, is_active, isActive, proficiency } = req.body;

    const skill = await Skill.findOne(findSkillQuery(id));
    if (!skill) return res.status(404).json({ error: 'Skill not found.' });

    if (name) skill.name = name.trim();
    if (category) skill.category = category.trim();
    if (proficiency !== undefined) skill.proficiency = Number(proficiency);
    if (icon !== undefined) skill.icon = icon || null;
    if (displayOrder !== undefined || display_order !== undefined) skill.displayOrder = Number(displayOrder ?? display_order ?? 0);
    if (isActive !== undefined || is_active !== undefined) skill.isActive = Boolean(isActive ?? is_active);

    await skill.save();

    res.json({ success: true, skill, message: 'Skill updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update skill.' });
  }
});

// DELETE /api/skills/:id — protected
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findOne(findSkillQuery(id));
    if (!skill) return res.status(404).json({ error: 'Skill not found.' });

    await Skill.deleteOne({ _id: skill._id });
    res.json({ success: true, message: 'Skill deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete skill.' });
  }
});

export default router;
