/**
 * Full portfolio restoration - uses Node.js built-ins only (no form-data package needed).
 * Handles multipart file uploads manually.
 * Run: node restore_full.js
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOST = 'localhost';
const PORT = 3000;
const BASE = `http://${HOST}:${PORT}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function jsonReq(method, urlPath, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({ host: HOST, port: PORT, path: urlPath, method, headers }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function multipartReq(urlPath, fieldName, filePath, mimeType, token) {
  return new Promise((resolve, reject) => {
    const boundary = '----NodeRestoreBoundary' + Date.now();
    const fileData = fs.readFileSync(filePath);
    const filename = path.basename(filePath);

    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, fileData, footer]);

    const headers = {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({ host: HOST, port: PORT, path: urlPath, method: 'POST', headers }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Login ───────────────────────────────────────────────────────────────────

async function login() {
  const res = await jsonReq('POST', '/api/auth/login', {
    email: 'asogwakenechukwu284@gmail.com',
    password: '09160284157',
  });
  if (!res.token) throw new Error('Login failed: ' + JSON.stringify(res));
  console.log('✅ Logged in as', res.user.email);
  return res.token;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function restore() {
  const token = await login();

  // ── 1. Profile ──────────────────────────────────────────────────────────────
  console.log('\n📝 Restoring profile...');
  await jsonReq('PUT', '/api/profile', {
    fullName: 'ASOGWA KENECHUKWU',
    professionalTitle: 'Mobile & Software Developer',
    location: 'Enugu, Nigeria',
    tagline: 'Building real-world digital solutions.',
    heroIntro: "Hi, I'm Kenechukwu 👋. I'm a Software Engineer",
    aboutHeading: 'About Me',
    aboutDescription: 'Passionate Mobile & Software Developer with hands-on experience building clean, responsive, and performance-driven digital solutions. Experienced in developing cross-platform applications and integrating scalable backend systems.',
    aboutExtra: 'Currently focusing on creating modern mobile and web solutions with clean architecture, smooth user interactions, and robust data persistence.',
  }, token);
  console.log('  ✅ Profile text');

  // Upload profile picture
  const picPath = path.join(__dirname, 'uploads', 'profile', '0266b953-d43c-4d16-931f-1399263b3151.jpeg');
  if (fs.existsSync(picPath)) {
    const r = await multipartReq('/api/profile/picture', 'picture', picPath, 'image/jpeg', token);
    console.log('  ✅ Profile picture:', r.profile_picture || r?.profile?.profilePicture || 'uploaded');
  } else {
    console.log('  ⚠️  Profile picture file missing');
  }

  // ── 2. Site Settings ────────────────────────────────────────────────────────
  console.log('\n⚙️  Restoring site settings...');
  await jsonReq('PUT', '/api/settings', {
    portfolioTitle: 'Kenechukwu Asogwa | Mobile & Software Developer',
    metaDescription: 'Professional portfolio of Kenechukwu Asogwa, Mobile & Software Developer based in Nigeria. Building digital products that solve real problems.',
    browserTitle: 'KC Portfolio',
    accentColor: '#15144d',
    themePreference: 'dark',
    footerText: '© 2024 Kenechukwu Asogwa. All rights reserved.',
  }, token);
  console.log('  ✅ Site settings');

  // ── 3. Contact Info ─────────────────────────────────────────────────────────
  console.log('\n📞 Restoring contact info...');
  await jsonReq('PUT', '/api/contact', {
    email: 'asogwakenechukwu284@gmail.com',
    whatsapp: '+2349160284157',
    phone: '+2349160284157',
    location: 'Nigeria',
  }, token);
  console.log('  ✅ Contact info (email, phone, WhatsApp)');

  // ── 4. Social Links ─────────────────────────────────────────────────────────
  console.log('\n🔗 Restoring social links...');
  await jsonReq('PUT', '/api/social/bulk/update', {
    links: [
      { platform: 'GitHub',   url: 'https://github.com/Kaycee091',                      isActive: true  },
      { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/asogwakenechukwu/',     isActive: true  },
      { platform: 'WhatsApp', url: 'https://wa.me/2349160284157',                       isActive: true  },
      { platform: 'Twitter',  url: '',                                                  isActive: false },
      { platform: 'Email',    url: 'mailto:asogwakenechukwu284@gmail.com',              isActive: true  },
    ],
  }, token);
  console.log('  ✅ GitHub, LinkedIn, WhatsApp, Email');

  // ── 5. Skills ───────────────────────────────────────────────────────────────
  console.log('\n🎯 Restoring skills...');
  const existingSkills = await jsonReq('GET', '/api/skills', null, token);
  const skillsArr = Array.isArray(existingSkills) ? existingSkills : (existingSkills.skills || []);
  for (const s of skillsArr) {
    const id = s._id || s.id;
    if (id) await jsonReq('DELETE', `/api/skills/${id}`, null, token);
  }
  const skills = [
    { name: 'Flutter',               category: 'Mobile',   displayOrder: 1  },
    { name: 'Dart',                  category: 'Mobile',   displayOrder: 2  },
    { name: 'Django',                category: 'Backend',  displayOrder: 3  },
    { name: 'Django REST Framework', category: 'Backend',  displayOrder: 4  },
    { name: 'Node.js',               category: 'Backend',  displayOrder: 5  },
    { name: 'Express',               category: 'Backend',  displayOrder: 6  },
    { name: 'Python',                category: 'Backend',  displayOrder: 7  },
    { name: 'React',                 category: 'Frontend', displayOrder: 8  },
    { name: 'JavaScript',            category: 'Frontend', displayOrder: 9  },
    { name: 'HTML',                  category: 'Frontend', displayOrder: 10 },
    { name: 'CSS',                   category: 'Frontend', displayOrder: 11 },
    { name: 'PostgreSQL',            category: 'Database', displayOrder: 12 },
    { name: 'SQLite',                category: 'Database', displayOrder: 13 },
    { name: 'Supabase',              category: 'Database', displayOrder: 14 },
    { name: 'MongoDB',               category: 'Database', displayOrder: 15 },
    { name: 'Redis',                 category: 'Database', displayOrder: 16 },
    { name: 'Git & GitHub',          category: 'Tools',    displayOrder: 17 },
    { name: 'VS Code',               category: 'Tools',    displayOrder: 18 },
  ];
  for (const sk of skills) {
    await jsonReq('POST', '/api/skills', { ...sk, isActive: true }, token);
    process.stdout.write(`  ✅ ${sk.name}\n`);
  }

  // ── 6. Projects ─────────────────────────────────────────────────────────────
  console.log('\n🚀 Restoring projects...');
  const existingProjects = await jsonReq('GET', '/api/projects/all', null, token);
  const projectsArr = Array.isArray(existingProjects) ? existingProjects : (existingProjects.projects || []);
  for (const p of projectsArr) {
    const id = p._id || p.id;
    if (id) await jsonReq('DELETE', `/api/projects/${id}`, null, token);
  }

  const projectDefs = [
    {
      data: {
        name: 'ElliMate',
        tagline: 'Live together. Communicate better.',
        description: 'A comprehensive roommate-finding and off-campus accommodation platform. Enables university students to discover verified off-campus apartments, match with compatible roommates based on lifestyle habits, and manage shared house expenses.',
        technologies: ['Flutter', 'Dart', 'Django', 'Supabase', 'PostgreSQL'],
        liveUrl: 'https://ellimate.onrender.com',
        githubUrl: 'https://github.com/kenechukwuasogwa/ellimate',
        featured: true, published: true, displayOrder: 1, category: 'Mobile',
      },
      img: path.join(__dirname, 'uploads', 'projects', '33febb65-9234-4208-9681-4ef92f4dac6a.png'),
    },
    {
      data: {
        name: 'Connecta',
        tagline: 'Stay connected. Anywhere.',
        description: 'A social connectivity and real-time messaging application. Features multi-room chat, direct user messaging, presence detection, and automated notifications.',
        technologies: ['React', 'Node.js', 'Express', 'Socket.IO', 'Redis', 'MongoDB'],
        liveUrl: 'https://connecta-frontend-wlpe.onrender.com',
        githubUrl: 'https://github.com/Kaycee091/kc-chat',
        featured: true, published: true, displayOrder: 2, category: 'Web',
      },
      img: path.join(__dirname, 'uploads', 'projects', '447f6800-e77c-4351-a1ac-7bb16f9e330c.png'),
    },
    {
      data: {
        name: 'KC App',
        tagline: 'Music App',
        description: 'A music app utility designed for simplicity and productivity.',
        technologies: ['Flutter', 'Dart', 'SQLite', 'SharedPreferences'],
        liveUrl: 'https://kaycee-app.vercel.app',
        githubUrl: 'https://github.com/Kaycee091/kaycee-app',
        featured: true, published: true, displayOrder: 3, category: 'Mobile',
      },
      img: path.join(__dirname, 'uploads', 'projects', '35bf6b81-1c5f-42fa-99f6-776c74c68c39.png'),
    },
  ];

  for (const proj of projectDefs) {
    const created = await jsonReq('POST', '/api/projects', proj.data, token);
    const id = created?.project?._id || created?.project?.id || created?._id;
    console.log(`  ✅ ${proj.data.name} (id: ${id})`);

    if (id && proj.img && fs.existsSync(proj.img)) {
      const ext = path.extname(proj.img).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
      const imgRes = await multipartReq(`/api/projects/${id}/image`, 'image', proj.img, mime, token);
      console.log(`     📸 Image: ${imgRes?.main_image || imgRes?.project?.image || 'uploaded'}`);
    } else if (!fs.existsSync(proj.img)) {
      console.log(`     ⚠️  Image missing: ${proj.img}`);
    }
  }

  // ── 7. Services ─────────────────────────────────────────────────────────────
  console.log('\n🛠  Restoring services...');
  const existingSvcs = await jsonReq('GET', '/api/services', null, token);
  const svcsArr = Array.isArray(existingSvcs) ? existingSvcs : (existingSvcs.services || []);
  for (const s of svcsArr) {
    const id = s._id || s.id;
    if (id) await jsonReq('DELETE', `/api/services/${id}`, null, token);
  }
  const services = [
    { title: 'Mobile App Development',    description: 'Building cross-platform mobile applications using Flutter and Dart for both iOS and Android.',                              icon: 'smartphone', isActive: true, displayOrder: 1 },
    { title: 'Web Application Development',description: 'Designing and developing modern, responsive web applications with clean UI and smooth user experiences.',                  icon: 'monitor',    isActive: true, displayOrder: 2 },
    { title: 'Backend Development',        description: 'Building robust REST APIs and server-side applications using Node.js, Express, and modern backend frameworks.',            icon: 'server',     isActive: true, displayOrder: 3 },
    { title: 'Database Integration',       description: 'Designing and integrating reliable database solutions using MongoDB, PostgreSQL, Supabase, and Redis.',                   icon: 'database',   isActive: true, displayOrder: 4 },
    { title: 'Frontend Development',       description: 'Designing and developing modern, responsive web applications with clean and intuitive interfaces.',                       icon: 'layout',     isActive: true, displayOrder: 5 },
  ];
  for (const svc of services) {
    await jsonReq('POST', '/api/services', svc, token);
    console.log(`  ✅ ${svc.title}`);
  }

  // ── 8. Experience ───────────────────────────────────────────────────────────
  console.log('\n💼 Restoring experience...');
  const existingExp = await jsonReq('GET', '/api/experience', null, token);
  const expArr = Array.isArray(existingExp) ? existingExp : (existingExp.experience || []);
  for (const e of expArr) {
    const id = e._id || e.id;
    if (id) await jsonReq('DELETE', `/api/experience/${id}`, null, token);
  }
  await jsonReq('POST', '/api/experience', {
    organization: 'Nanocodes Programming Limited',
    role: 'Mobile Development Trainee',
    location: 'Nsukka, Enugu State, Nigeria',
    startDate: '', endDate: '',
    isCurrent: true,
    description: 'Mobile app development training and practical software development experience.',
    displayOrder: 1,
  }, token);
  console.log('  ✅ Nanocodes Programming Limited');

  // ── 9. CV ───────────────────────────────────────────────────────────────────
  console.log('\n📄 Restoring CV...');
  const cvFile = path.join(__dirname, 'uploads', 'cv', '01c7c622-132a-4b0e-b4ed-ef84f49ffc3d.pdf');
  if (fs.existsSync(cvFile)) {
    await jsonReq('DELETE', '/api/cv', null, token);

    // Rename file temporarily so multer saves it with nice name, then restore
    const tmpPath = path.join(__dirname, 'uploads', 'cv', 'Kenechukwu_Asogwa_CV.pdf');
    fs.copyFileSync(cvFile, tmpPath);
    const cvRes = await multipartReq('/api/cv', 'cv', tmpPath, 'application/pdf', token);
    fs.unlinkSync(tmpPath); // clean up temp copy
    console.log('  ✅ CV:', cvRes?.original_name || cvRes?.cv?.originalName || 'Kenechukwu_Asogwa_CV.pdf');
  } else {
    console.log('  ⚠️  CV file missing');
  }

  // ── 10. Verification ────────────────────────────────────────────────────────
  console.log('\n🔍 Verification summary...');
  const [prof, sk2, pr2, sv2, so2, ct2, cv2, ex2] = await Promise.all([
    jsonReq('GET', '/api/profile',    null, null),
    jsonReq('GET', '/api/skills',     null, null),
    jsonReq('GET', '/api/projects',   null, null),
    jsonReq('GET', '/api/services',   null, null),
    jsonReq('GET', '/api/social',     null, null),
    jsonReq('GET', '/api/contact',    null, null),
    jsonReq('GET', '/api/cv',         null, null),
    jsonReq('GET', '/api/experience', null, null),
  ]);

  const pp = prof.profilePicture || prof.profile_picture;
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║         COMPLETE RESTORATION REPORT         ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║ Name:         ${(prof.fullName || prof.full_name || '').padEnd(30)} ║`);
  console.log(`║ Title:        ${(prof.professionalTitle || prof.professional_title || '').padEnd(30)} ║`);
  console.log(`║ Location:     ${(prof.location || '').padEnd(30)} ║`);
  console.log(`║ Profile Pic:  ${(pp ? '✅ ' + pp : '❌ missing').padEnd(30)} ║`);
  const skCount = (Array.isArray(sk2) ? sk2 : (sk2.skills||[])).length;
  console.log(`║ Skills:       ${String(skCount + ' restored').padEnd(30)} ║`);
  const prArr = Array.isArray(pr2) ? pr2 : (pr2.projects||[]);
  console.log(`║ Projects:     ${String(prArr.length + ' restored').padEnd(30)} ║`);
  prArr.forEach(p => {
    const img = p.image ? '✅' : '❌';
    console.log(`║   ${img} ${(p.name + ' | ' + (p.liveUrl||p.live_url||'no url')).substring(0,41).padEnd(41)} ║`);
  });
  const svCount = (Array.isArray(sv2) ? sv2 : (sv2.services||[])).length;
  console.log(`║ Services:     ${String(svCount + ' restored').padEnd(30)} ║`);
  const soArr = Array.isArray(so2) ? so2 : (so2.links||[]);
  console.log(`║ Social Links: ${String(soArr.length + ' active').padEnd(30)} ║`);
  soArr.forEach(s => console.log(`║   ✅ ${(s.platform + ': ' + s.url).substring(0,42).padEnd(42)} ║`));
  console.log(`║ Email:        ${(ct2.email||'').padEnd(30)} ║`);
  console.log(`║ Phone:        ${(ct2.phone||'').padEnd(30)} ║`);
  console.log(`║ WhatsApp:     ${(ct2.whatsapp||'').padEnd(30)} ║`);
  console.log(`║ CV:           ${(cv2.cv ? '✅ ' + (cv2.cv.original_name||'present') : '❌ missing').padEnd(30)} ║`);
  const exArr = Array.isArray(ex2) ? ex2 : (ex2.experience||[]);
  console.log(`║ Experience:   ${String(exArr.length + ' entry').padEnd(30)} ║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('\n🌐  http://localhost:3000');
  console.log('🔐  http://localhost:3000/admin\n');
}

restore().catch(e => { console.error('❌', e.message); process.exit(1); });
