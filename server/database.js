import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { AdminUser } from './models/AdminUser.js';
import { Profile } from './models/Profile.js';
import { Project } from './models/Project.js';
import { Skill } from './models/Skill.js';
import { Experience } from './models/Experience.js';
import { Service } from './models/Service.js';
import { SocialLink } from './models/SocialLink.js';
import { ContactInfo } from './models/ContactInfo.js';
import { SiteSettings } from './models/SiteSettings.js';
import { CV } from './models/CV.js';

dotenv.config();

let mongoServer = null;
let dbStatus = {
  connected: false,
  mode: 'disconnected',
  error: null,
};

export function getDatabaseStatus() {
  return { ...dbStatus };
}

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim()) {
    try {
      console.log('🔄 Connecting to MongoDB Atlas...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      dbStatus = { connected: true, mode: 'atlas', error: null };
      console.log('✅ Connected to MongoDB Atlas successfully!');
      await seedDefaultData();
      return mongoose.connection;
    } catch (err) {
      dbStatus = { connected: false, mode: 'atlas_failed', error: err.message };
      console.error('\n❌ ===============================================');
      console.error('❌ MONGODB ATLAS CONNECTION FAILED!');
      console.error(`❌ Error: ${err.message}`);
      console.warn('⚠️  Falling back to in-memory MongoDB for local development so the site and admin run.');
      console.error('❌ ===============================================\n');
    }
  }

  // ── Local fallback (only when MONGODB_URI is explicitly omitted) ───────────
  console.warn('⚠️  MONGODB_URI not configured. Running in-memory mode: data will be lost on server restart!');
  console.warn('📋 To persist data, set MONGODB_URI in your .env file.\n');

  try {
    mongoServer = await MongoMemoryServer.create();
    const localUri = mongoServer.getUri();
    await mongoose.connect(localUri);
    dbStatus = { connected: true, mode: 'local_inmemory', error: null };
    console.log('✅ In-memory MongoDB started (development only).');
    await seedDefaultData();
    return mongoose.connection;
  } catch (err) {
    dbStatus = { connected: false, mode: 'failed', error: err.message };
    console.error('❌ Failed to start local MongoDB:', err.message);
    throw err;
  }
}

export async function seedDefaultData() {
  try {
    const existingProfile = await Profile.findOne();
    const existingProjects = await Project.countDocuments();
    if (existingProfile || existingProjects > 0) {
      console.log('ℹ️  Existing database records found. Skipping default data seeding.');
      return;
    }

    // 1. Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'asogwakenechukwu284@gmail.com').toLowerCase().trim();
    const adminExists = await AdminUser.findOne({ email: adminEmail });
    if (!adminExists) {
      const password = process.env.ADMIN_PASSWORD || '09160284157';
      const salt = bcrypt.genSaltSync(12);
      const passwordHash = bcrypt.hashSync(password, salt);
      await AdminUser.create({
        name: process.env.ADMIN_NAME || 'Kenechukwu Asogwa',
        email: adminEmail,
        passwordHash,
      });
      console.log('✅ Default admin user seeded');
    }

    // 2. Profile
    const profileExists = await Profile.findOne();
    if (!profileExists) {
      await Profile.create({
        fullName: 'ASOGWA KENECHUKWU',
        professionalTitle: 'Mobile & Software Developer',
        location: 'Enugu, Nigeria',
        tagline: 'Building real-world digital solutions.',
        heroIntro: "Hi, I'm Kenechukwu 👋. I'm a Software Engineer",
        aboutHeading: 'About Me',
        aboutDescription:
          'Passionate Mobile & Software Developer with hands-on experience building clean, responsive, and performance-driven digital solutions. Experienced in developing cross-platform applications and integrating scalable backend systems.',
        aboutExtra:
          'Currently focusing on creating modern mobile and web solutions with clean architecture, smooth user interactions, and robust data persistence.',
        profilePicture: '/uploads/profile/0266b953-d43c-4d16-931f-1399263b3151.jpeg',
      });
      console.log('✅ Profile seeded');
    }

    // 3. Site Settings
    const settingsExists = await SiteSettings.findOne();
    if (!settingsExists) {
      await SiteSettings.create({
        portfolioTitle: 'Kenechukwu Asogwa | Mobile & Software Developer',
        metaDescription:
          'Professional portfolio of Kenechukwu Asogwa, Mobile & Software Developer based in Nigeria. Building digital products that solve real problems.',
        browserTitle: 'KC Portfolio',
        accentColor: '#15144d',
        themePreference: 'dark',
        footerText: '© 2024 Kenechukwu Asogwa. All rights reserved.',
      });
      console.log('✅ Site settings seeded');
    }

    // 4. Contact Info
    const contactExists = await ContactInfo.findOne();
    if (!contactExists) {
      await ContactInfo.create({
        email: 'asogwakenechukwu284@gmail.com',
        whatsapp: '+2349160284157',
        location: 'Nigeria',
        phone: '+2349160284157',
      });
      console.log('✅ Contact info seeded');
    }

    // 5. Social Links
    const socialCount = await SocialLink.countDocuments();
    if (socialCount === 0) {
      await SocialLink.insertMany([
        { platform: 'GitHub',   url: 'https://github.com/Kaycee091',                  icon: 'github',         isActive: true,  displayOrder: 1 },
        { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/asogwakenechukwu/', icon: 'linkedin',       isActive: true,  displayOrder: 2 },
        { platform: 'WhatsApp', url: 'https://wa.me/2349160284157',                   icon: 'message-circle', isActive: true,  displayOrder: 3 },
        { platform: 'Twitter',  url: '',                                              icon: 'twitter',        isActive: false, displayOrder: 4 },
        { platform: 'Email',    url: 'mailto:asogwakenechukwu284@gmail.com',          icon: 'mail',           isActive: true,  displayOrder: 5 },
      ]);
      console.log('✅ Social links seeded');
    }

    // 6. Skills
    const skillsCount = await Skill.countDocuments();
    if (skillsCount === 0) {
      await Skill.insertMany([
        { name: 'Flutter',               category: 'Mobile',   isActive: true, displayOrder: 1  },
        { name: 'Dart',                  category: 'Mobile',   isActive: true, displayOrder: 2  },
        { name: 'Django',                category: 'Backend',  isActive: true, displayOrder: 3  },
        { name: 'Django REST Framework', category: 'Backend',  isActive: true, displayOrder: 4  },
        { name: 'Node.js',               category: 'Backend',  isActive: true, displayOrder: 5  },
        { name: 'Express',               category: 'Backend',  isActive: true, displayOrder: 6  },
        { name: 'Python',                category: 'Backend',  isActive: true, displayOrder: 7  },
        { name: 'React',                 category: 'Frontend', isActive: true, displayOrder: 8  },
        { name: 'JavaScript',            category: 'Frontend', isActive: true, displayOrder: 9  },
        { name: 'HTML',                  category: 'Frontend', isActive: true, displayOrder: 10 },
        { name: 'CSS',                   category: 'Frontend', isActive: true, displayOrder: 11 },
        { name: 'PostgreSQL',            category: 'Database', isActive: true, displayOrder: 12 },
        { name: 'SQLite',                category: 'Database', isActive: true, displayOrder: 13 },
        { name: 'Supabase',              category: 'Database', isActive: true, displayOrder: 14 },
        { name: 'MongoDB',               category: 'Database', isActive: true, displayOrder: 15 },
        { name: 'Redis',                 category: 'Database', isActive: true, displayOrder: 16 },
        { name: 'Git & GitHub',          category: 'Tools',    isActive: true, displayOrder: 17 },
        { name: 'VS Code',               category: 'Tools',    isActive: true, displayOrder: 18 },
      ]);
      console.log('✅ Skills seeded');
    }

    // 7. Projects
    const projectsCount = await Project.countDocuments();
    if (projectsCount === 0) {
      await Project.insertMany([
        {
          name: 'ElliMate',
          tagline: 'Live together. Communicate better.',
          description:
            'A comprehensive roommate-finding and off-campus accommodation platform. Enables university students to discover verified off-campus apartments, match with compatible roommates based on lifestyle habits, and manage shared house expenses.',
          technologies: ['Flutter', 'Dart', 'Django', 'Supabase', 'PostgreSQL'],
          liveUrl: 'https://ellimate.onrender.com',
          githubUrl: 'https://github.com/kenechukwuasogwa/ellimate',
          image: '/uploads/projects/33febb65-9234-4208-9681-4ef92f4dac6a.png',
          category: 'Mobile',
          featured: true,
          published: true,
          displayOrder: 1,
        },
        {
          name: 'Connecta',
          tagline: 'Stay connected. Anywhere.',
          description:
            'A social connectivity and real-time messaging application. Features multi-room chat, direct user messaging, presence detection, and automated notifications.',
          technologies: ['React', 'Node.js', 'Express', 'Socket.IO', 'Redis', 'MongoDB'],
          liveUrl: 'https://connecta-frontend-wlpe.onrender.com',
          githubUrl: 'https://github.com/Kaycee091/kc-chat',
          image: '/uploads/projects/447f6800-e77c-4351-a1ac-7bb16f9e330c.png',
          category: 'Web',
          featured: true,
          published: true,
          displayOrder: 2,
        },
        {
          name: 'KC App',
          tagline: 'Music App',
          description:
            'A music app utility designed for simplicity and productivity.',
          technologies: ['Flutter', 'Dart', 'SQLite', 'SharedPreferences'],
          liveUrl: 'https://kaycee-app.vercel.app',
          githubUrl: 'https://github.com/Kaycee091/kaycee-app',
          image: '/uploads/projects/35bf6b81-1c5f-42fa-99f6-776c74c68c39.png',
          category: 'Mobile',
          featured: true,
          published: true,
          displayOrder: 3,
        },
      ]);
      console.log('✅ Projects seeded');
    }

    // 8. Experience
    const expCount = await Experience.countDocuments();
    if (expCount === 0) {
      await Experience.create({
        organization: 'Nanocodes Programming Limited',
        role: 'Mobile Development Trainee',
        location: 'Nsukka, Enugu State, Nigeria',
        description: 'Mobile app development training and practical software development experience.',
        isCurrent: true,
        displayOrder: 1,
      });
      console.log('✅ Experience seeded');
    }

    // 9. Services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany([
        {
          title: 'Mobile App Development',
          description: 'Building cross-platform mobile applications using Flutter and Dart for both iOS and Android.',
          icon: 'smartphone',
          isActive: true,
          displayOrder: 1,
        },
        {
          title: 'Web Application Development',
          description: 'Designing and developing modern, responsive web applications with clean UI and smooth user experiences.',
          icon: 'monitor',
          isActive: true,
          displayOrder: 2,
        },
        {
          title: 'Backend Development',
          description: 'Building robust REST APIs and server-side applications using Node.js, Express, and modern backend frameworks.',
          icon: 'server',
          isActive: true,
          displayOrder: 3,
        },
        {
          title: 'Database Integration',
          description: 'Designing and integrating reliable database solutions using MongoDB, PostgreSQL, Supabase, and Redis.',
          icon: 'database',
          isActive: true,
          displayOrder: 4,
        },
        {
          title: 'Frontend Development',
          description: 'Designing and developing modern, responsive web applications with clean and intuitive interfaces.',
          icon: 'layout',
          isActive: true,
          displayOrder: 5,
        },
      ]);
      console.log('✅ Services seeded');
    }

    // 10. CV
    const cvCount = await CV.countDocuments();
    if (cvCount === 0) {
      await CV.create({
        filePath: '/uploads/cv/01c7c622-132a-4b0e-b4ed-ef84f49ffc3d.pdf',
        originalName: 'Kenechukwu_Asogwa_CV.pdf',
        fileSize: 20939,
        isActive: true,
      });
      console.log('✅ CV seeded');
    }
  } catch (err) {
    console.error('Error during data seeding:', err.message);
  }
}
