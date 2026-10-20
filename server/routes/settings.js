import express from 'express';
import { SiteSettings } from '../models/SiteSettings.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/settings — public
router.get('/', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

// PUT /api/settings — protected
router.put('/', authenticateToken, async (req, res) => {
  try {
    const {
      portfolio_title, portfolioTitle,
      meta_description, metaDescription,
      accent_color, accentColor,
      footer_text, footerText,
      analytics_id, analyticsId,
    } = req.body;

    let settings = await SiteSettings.findOne();
    if (!settings) settings = new SiteSettings();

    if (portfolioTitle !== undefined || portfolio_title !== undefined) {
      settings.portfolioTitle = (portfolioTitle ?? portfolio_title).trim();
    }
    if (metaDescription !== undefined || meta_description !== undefined) {
      settings.metaDescription = (metaDescription ?? meta_description).trim();
    }
    if (accentColor !== undefined || accent_color !== undefined) {
      settings.accentColor = (accentColor ?? accent_color).trim();
    }
    if (footerText !== undefined || footer_text !== undefined) {
      settings.footerText = (footerText ?? footer_text).trim();
    }
    if (analyticsId !== undefined || analytics_id !== undefined) {
      settings.analyticsId = (analyticsId ?? analytics_id).trim();
    }

    await settings.save();
    res.json({ success: true, settings, message: 'Settings saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to save settings.' });
  }
});

export default router;
