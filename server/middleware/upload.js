import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Ensure upload directories exist
const dirs = ['profile', 'projects', 'cv', 'apps'];
for (const dir of dirs) {
  const dirPath = path.join(UPLOADS_DIR, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(UPLOADS_DIR, subfolder));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

function imageFileFilter(req, file, cb) {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.'));
  }
}

function pdfFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'));
  }
}

function apkFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.apk') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Android package (.apk) files are allowed.'));
  }
}

export const uploadProfilePicture = multer({
  storage: createStorage('profile'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadProjectImage = multer({
  storage: createStorage('projects'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const uploadCV = multer({
  storage: createStorage('cv'),
  fileFilter: pdfFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const uploadAPK = multer({
  storage: createStorage('apps'),
  fileFilter: apkFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export function deleteFile(filePath) {
  if (!filePath) return;
  const fullPath = path.join(UPLOADS_DIR, filePath.replace('/uploads/', ''));
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error('Error deleting file:', err.message);
    }
  }
}
