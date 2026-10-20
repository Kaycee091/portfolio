import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

import { AdminUser } from '../server/models/AdminUser.js';
import { Profile } from '../server/models/Profile.js';
import { Project } from '../server/models/Project.js';
import { Skill } from '../server/models/Skill.js';
import { Experience } from '../server/models/Experience.js';
import { Service } from '../server/models/Service.js';
import { SocialLink } from '../server/models/SocialLink.js';
import { ContactInfo } from '../server/models/ContactInfo.js';
import { SiteSettings } from '../server/models/SiteSettings.js';
import { ContactMessage } from '../server/models/ContactMessage.js';
import { CV } from '../server/models/CV.js';

dotenv.config();

const backupData = JSON.parse(fs.readFileSync('backup_safety/dump_portfolio_db.json', 'utf8'));

async function migrateAndSync() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not set in .env');
  }

  console.log('🔄 Connecting to MongoDB Atlas for safe sync/migration...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected to MongoDB Atlas:', mongoose.connection.name);

  const report = {
    skillsAdded: 0,
    skillsExisting: 0,
    messagesAdded: 0,
    messagesExisting: 0,
    projectsVerified: 0,
    profileVerified: false,
    settingsVerified: false,
    servicesVerified: 0,
    experienceVerified: 0,
    socialVerified: 0,
    cvVerified: 0,
  };

  // 1. Profile Verification
  const currentProfile = await Profile.findOne();
  if (currentProfile) {
    console.log(`✅ Profile verified in Atlas: ${currentProfile.fullName} (${currentProfile.location})`);
    report.profileVerified = true;
  } else {
    // Seed from backup if missing
    const p = backupData.profile?.rows?.[0];
    if (p) {
      await Profile.create({
        fullName: p.full_name || 'ASOGWA KENECHUKWU',
        professionalTitle: p.professional_title,
        location: p.location,
        tagline: p.tagline,
        heroIntro: p.hero_intro,
        aboutHeading: p.about_heading,
        aboutDescription: p.about_description,
        aboutExtra: p.about_extra,
        profilePicture: p.profile_picture,
      });
      console.log('✅ Profile restored from backup');
      report.profileVerified = true;
    }
  }

  // 2. Skills Sync (Add any missing skills from SQLite without duplicating)
  const existingSkills = await Skill.find();
  const existingSkillNames = new Set(existingSkills.map(s => s.name.toLowerCase().trim()));
  report.skillsExisting = existingSkills.length;

  const sqliteSkills = backupData.skills?.rows || [];
  let nextOrder = existingSkills.reduce((max, s) => Math.max(max, s.displayOrder || 0), 0) + 1;

  for (const s of sqliteSkills) {
    if (!existingSkillNames.has(s.name.toLowerCase().trim())) {
      await Skill.create({
        name: s.name,
        category: s.category || 'Tools',
        proficiency: 85,
        displayOrder: nextOrder++,
        isActive: Boolean(s.is_active ?? true),
      });
      existingSkillNames.add(s.name.toLowerCase().trim());
      report.skillsAdded++;
      console.log(`➕ Added missing skill from backup: ${s.name} (${s.category})`);
    }
  }

  // 3. Projects Verification
  const projects = await Project.find();
  report.projectsVerified = projects.length;
  console.log(`✅ Projects in Atlas: ${projects.length}`);
  for (const proj of projects) {
    console.log(`   - ${proj.name}: Live: ${proj.liveUrl || 'none'} | Image: ${proj.image}`);
  }

  // 4. Contact Messages Sync (Preserve messages without duplicating by email + message text)
  const existingMessages = await ContactMessage.find();
  report.messagesExisting = existingMessages.length;
  const existingMsgKeys = new Set(existingMessages.map(m => `${m.email.toLowerCase()}|${m.message.trim()}`));

  const sqliteMessages = backupData.contact_messages?.rows || [];
  for (const m of sqliteMessages) {
    const key = `${m.email.toLowerCase()}|${m.message.trim()}`;
    if (!existingMsgKeys.has(key)) {
      await ContactMessage.create({
        name: m.name,
        email: m.email,
        message: m.message,
        isRead: Boolean(m.is_read),
        createdAt: new Date(m.created_at || Date.now()),
      });
      existingMsgKeys.add(key);
      report.messagesAdded++;
      console.log(`➕ Added message from backup: ${m.name} (${m.email})`);
    }
  }

  // 5. Verify other collections
  report.servicesVerified = await Service.countDocuments();
  report.experienceVerified = await Experience.countDocuments();
  report.socialVerified = await SocialLink.countDocuments();
  report.cvVerified = await CV.countDocuments();
  report.settingsVerified = Boolean(await SiteSettings.findOne());

  console.log('\n================ MIGRATION & SYNC SUMMARY ================');
  console.log(JSON.stringify(report, null, 2));
  console.log('==========================================================\n');

  await mongoose.disconnect();
}

migrateAndSync().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
