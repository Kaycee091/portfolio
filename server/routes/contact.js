import express from 'express';
import mongoose from 'mongoose';
import { ContactInfo } from '../models/ContactInfo.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function findMsgQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) return { _id: id };
  return { _id: null };
}

// GET /api/contact — public
router.get('/', async (req, res) => {
  try {
    let contact = await ContactInfo.findOne();
    if (!contact) contact = await ContactInfo.create({});
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact info.' });
  }
});

// PUT /api/contact — protected
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { email, whatsapp, location, phone } = req.body;
    let contact = await ContactInfo.findOne();
    if (!contact) contact = new ContactInfo();

    if (email !== undefined) contact.email = email.trim();
    if (whatsapp !== undefined) contact.whatsapp = whatsapp.trim();
    if (location !== undefined) contact.location = location.trim();
    if (phone !== undefined) contact.phone = phone.trim();

    await contact.save();
    res.json({ success: true, contact, message: 'Contact information updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update contact info.' });
  }
});

// POST /api/contact/message or /api/contact/messages — public (contact form submission)
router.post(['/message', '/messages'], async (req, res) => {
  try {
    const { name, sender_name, email, sender_email, message, content } = req.body;
    const finalName = (name ?? sender_name ?? '').trim();
    const finalEmail = (email ?? sender_email ?? '').trim();
    const finalMessage = (message ?? content ?? '').trim();

    if (!finalName) return res.status(400).json({ error: 'Name is required.' });
    if (!finalEmail) return res.status(400).json({ error: 'Email is required.' });
    if (!finalMessage) return res.status(400).json({ error: 'Message is required.' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(finalEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (finalMessage.length < 5) {
      return res.status(400).json({ error: 'Message is too short.' });
    }

    await ContactMessage.create({
      name: finalName,
      email: finalEmail,
      message: finalMessage,
    });

    res.json({
      success: true,
      message: 'Your message has been received. Thank you for reaching out!',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit contact message.' });
  }
});

// GET /api/contact/messages — admin only
router.get('/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact messages.' });
  }
});

// PUT /api/contact/messages/:id/read — admin only
router.put('/messages/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await ContactMessage.updateOne(findMsgQuery(id), { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark message as read.' });
  }
});

// DELETE /api/contact/messages/:id — admin only
router.delete('/messages/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await ContactMessage.deleteOne(findMsgQuery(id));
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

export default router;
