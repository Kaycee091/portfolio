import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import skillsRoutes from './routes/skills.js';
import projectsRoutes from './routes/projects.js';
import experienceRoutes from './routes/experience.js';
import servicesRoutes from './routes/services.js';
import socialRoutes from './routes/social.js';
import contactRoutes from './routes/contact.js';
import cvRoutes from './routes/cv.js';
import settingsRoutes from './routes/settings.js';

// Database
import { connectDatabase, getDatabaseStatus } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production' && process.env.BASE_URL ? process.env.BASE_URL : '*',
  credentials: true,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many login attempts. Please try again later.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files ─────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// ─── Database Health Check Endpoint ───────────────────────────────────────────
app.get('/api/database-status', (req, res) => {
  const status = getDatabaseStatus();
  res.json({
    status: status.connected ? 'ok' : 'error',
    connected: status.connected,
    mode: status.mode,
    uriConfigured: Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim()),
    error: status.error,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/settings', settingsRoutes);

// ─── Catch-all for SPA routing ────────────────────────────────────────────────
app.get(/^\/admin(?:\/.*)?$/, (req, res) => {
  res.sendFile(path.join(publicDir, 'admin', 'index.html'));
});

app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: err.message || 'An internal server error occurred.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`\n🚀 Portfolio server running on http://localhost:${PORT}`);
      console.log(`📁 Public Portfolio: http://localhost:${PORT}`);
      console.log(`🔐 Admin Dashboard: http://localhost:${PORT}/admin`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📦 Database Mode: ${getDatabaseStatus().mode}\n`);
    });
  } catch (err) {
    console.error('\n❌ CRITICAL: Failed to initialize database on startup:', err.message);
    process.exit(1);
  }
}

startServer();

export default app;
