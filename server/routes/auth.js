import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminUser } from '../models/AdminUser.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, name: user.name },
      process.env.JWT_SECRET || 'fallback-secret-key-2024',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// GET /api/auth/me — verify token and return user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await AdminUser.findById(req.user.id).select('name email');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: { id: user._id.toString(), name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify session.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const user = await AdminUser.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const valid = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });

    user.passwordHash = bcrypt.hashSync(newPassword, 12);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

export default router;
