/**
 * Restore Kenechukwu's real portfolio data to the running server.
 * Run: node restore_data.js
 */

const BASE = 'http://localhost:3000';

// ─── Step 1: Login ───────────────────────────────────────────────────────────
async function login() {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'asogwakenechukwu284@gmail.com', password: '09160284157' }),
  });
  const d = await r.json();
  if (!d.token) throw new Error('Login failed: ' + JSON.stringify(d));
  console.log('✅ Logged in as', d.user.email);
  return d.token;
}

function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function api(token, method, path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  try { return JSON.parse(text); } catch { return text; }
}

// ─── Main restore ────────────────────────────────────────────────────────────
async function restore() {
  const token = await login();

  // 1. Profile
  console.log('\n📝 Restoring profile...');
  await api(token, 'PUT', '/api/profile', {
    fullName: 'ASOGWA KENECHUKWU',
    professionalTitle: 'Mobile & Software Developer',
    location: 'Enugu, Nigeria',
    tagline: 'Building real-world digital solutions.',
    heroIntro: "Hi, I'm Kenechukwu 👋. I'm a Software Engineer",
    aboutHeading: 'About Me',
    aboutDescription: 'Passionate Mobile & Software Developer with hands-on experience building clean, responsive, and performance-driven digital solutions. Experienced in developing cross-platform applications and integrating scalable backend systems.',
    aboutExtra: 'Currently focusing on creating modern mobile and web solutions with clean architecture, smooth user interactions, and robust data persistence.',
  });
  console.log('✅ Profile restored');

  // 2. Site Settings
  console.log('\n⚙️  Restoring site settings...');
  await api(token, 'PUT', '/api/settings', {
    portfolioTitle: 'Kenechukwu Asogwa | Mobile & Software Developer',
    metaDescription: 'Professional portfolio of Kenechukwu Asogwa, Mobile & Software Developer based in Nigeria. Building digital products that solve real problems.',
    browserTitle: 'KC Portfolio',
    accentColor: '#15144d',
    themePreference: 'dark',
    footerText: '© 2024 Kenechukwu Asogwa. All rights reserved.',
  });
  console.log('✅ Site settings restored');

  // 3. Contact Info
  console.log('\n📞 Restoring contact info...');
  await api(token, 'PUT', '/api/contact/info', {
    email: 'asogwakenechukwu284@gmail.com',
    whatsapp: '+2349160284157',
    phone: '+2349160284157',
    location: 'Nigeria',
  });
  console.log('✅ Contact info restored');

  // 4. Social Links
  console.log('\n🔗 Restoring social links...');
  const socialLinks = [
    { platform: 'GitHub', url: 'https://github.com/Kaycee091', icon: 'github', isActive: true, displayOrder: 1 },
    { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/asogwakenechukwu/', icon: 'linkedin', isActive: true, displayOrder: 2 },
    { platform: 'WhatsApp', url: 'https://wa.me/2349160284157', icon: 'message-circle', isActive: true, displayOrder: 4 },
    { platform: 'Twitter', url: '', icon: 'twitter', isActive: false, displayOrder: 3 },
  ];

  // Delete existing and recreate
  const existingSocial = await api(token, 'GET', '/api/social', null);
  if (Array.isArray(existingSocial)) {
    for (const s of existingSocial) {
      const id = s._id || s.id;
      if (id) await api(token, 'DELETE', `/api/social/${id}`, null);
    }
  }
  for (const link of socialLinks) {
    const result = await api(token, 'POST', '/api/social', link);
    console.log(`  ✅ ${link.platform}`);
  }

  // 5. Skills
  console.log('\n🎯 Restoring skills...');
  const existingSkills = await api(token, 'GET', '/api/skills', null);
  const skillsArr = Array.isArray(existingSkills) ? existingSkills : (existingSkills.skills || []);
  for (const s of skillsArr) {
    const id = s._id || s.id;
    if (id) await api(token, 'DELETE', `/api/skills/${id}`, null);
  }

  const skills = [
    { name: 'Flutter', category: 'Mobile', displayOrder: 1, isActive: true },
    { name: 'Dart', category: 'Mobile', displayOrder: 2, isActive: true },
    { name: 'Django', category: 'Backend', displayOrder: 3, isActive: true },
    { name: 'Node.js', category: 'Backend', displayOrder: 4, isActive: true },
    { name: 'Express', category: 'Backend', displayOrder: 5, isActive: true },
    { name: 'React', category: 'Frontend', displayOrder: 6, isActive: true },
    { name: 'JavaScript', category: 'Frontend', displayOrder: 7, isActive: true },
    { name: 'Supabase', category: 'Database', displayOrder: 8, isActive: true },
    { name: 'MongoDB', category: 'Database', displayOrder: 9, isActive: true },
    { name: 'Git & GitHub', category: 'Tools', displayOrder: 10, isActive: true },
    { name: 'Python', category: 'Backend', displayOrder: 11, isActive: true },
    { name: 'PostgreSQL', category: 'Database', displayOrder: 12, isActive: true },
    { name: 'HTML', category: 'Frontend', displayOrder: 13, isActive: true },
    { name: 'CSS', category: 'Frontend', displayOrder: 14, isActive: true },
    { name: 'SQLite', category: 'Database', displayOrder: 15, isActive: true },
    { name: 'Redis', category: 'Database', displayOrder: 16, isActive: true },
  ];
  for (const skill of skills) {
    await api(token, 'POST', '/api/skills', skill);
    process.stdout.write('  ✅ ' + skill.name + '\n');
  }

  // 6. Projects
  console.log('\n🚀 Restoring projects...');
  const existingProjects = await api(token, 'GET', '/api/projects', null);
  const projectsArr = Array.isArray(existingProjects) ? existingProjects : (existingProjects.projects || []);
  for (const p of projectsArr) {
    const id = p._id || p.id;
    if (id) await api(token, 'DELETE', `/api/projects/${id}`, null);
  }

  const projects = [
    {
      name: 'ElliMate',
      tagline: 'Live together. Communicate better.',
      description: 'A comprehensive roommate-finding and off-campus accommodation platform. Enables university students to discover verified off-campus apartments, match with compatible roommates based on lifestyle habits, and manage shared house expenses.',
      technologies: ['Flutter', 'Dart', 'Django', 'Supabase', 'PostgreSQL'],
      liveUrl: 'https://ellimate.onrender.com',
      githubUrl: 'https://github.com/kenechukwuasogwa/ellimate',
      mainImage: '/uploads/projects/33febb65-9234-4208-9681-4ef92f4dac6a.png',
      featured: true,
      published: true,
      displayOrder: 1,
      category: 'Mobile',
    },
    {
      name: 'Connecta',
      tagline: 'Stay connected. Anywhere.',
      description: 'A social connectivity and real-time messaging application. Features multi-room chat, direct user messaging, presence detection, and automated notifications.',
      technologies: ['React', 'Node.js', 'Express', 'Socket.IO', 'Redis', 'MongoDB'],
      liveUrl: 'https://connecta-frontend-wlpe.onrender.com',
      githubUrl: 'https://github.com/Kaycee091/kc-chat',
      mainImage: '/uploads/projects/447f6800-e77c-4351-a1ac-7bb16f9e330c.png',
      featured: true,
      published: true,
      displayOrder: 2,
      category: 'Web',
    },
    {
      name: 'KC App',
      tagline: 'Music App',
      description: 'A music app utility designed for simplicity and productivity.',
      technologies: ['Flutter', 'Dart', 'SQLite', 'SharedPreferences'],
      liveUrl: 'https://kaycee-app.vercel.app',
      githubUrl: 'https://github.com/Kaycee091/kaycee-app',
      mainImage: '/uploads/projects/35bf6b81-1c5f-42fa-99f6-776c74c68c39.png',
      featured: true,
      published: true,
      displayOrder: 3,
      category: 'Mobile',
    },
  ];
  for (const proj of projects) {
    await api(token, 'POST', '/api/projects', proj);
    console.log(`  ✅ ${proj.name}`);
  }

  // 7. Services
  console.log('\n🛠  Restoring services...');
  const existingServices = await api(token, 'GET', '/api/services', null);
  const servicesArr = Array.isArray(existingServices) ? existingServices : (existingServices.services || []);
  for (const s of servicesArr) {
    const id = s._id || s.id;
    if (id) await api(token, 'DELETE', `/api/services/${id}`, null);
  }
  const services = [
    { title: 'Mobile App Development', description: 'Building cross-platform mobile applications using Flutter and Dart for both iOS and Android.', icon: 'smartphone', isActive: true, displayOrder: 1 },
    { title: 'Web Application Development', description: 'Designing and developing modern, responsive web applications with clean UI and smooth user experiences.', icon: 'monitor', isActive: true, displayOrder: 2 },
    { title: 'Backend Development', description: 'Building robust REST APIs and server-side applications using Node.js, Express, and modern backend frameworks.', icon: 'server', isActive: true, displayOrder: 3 },
    { title: 'Database Integration', description: 'Designing and integrating reliable database solutions using MongoDB, PostgreSQL, and Supabase.', icon: 'database', isActive: true, displayOrder: 4 },
    { title: 'Frontend Development', description: 'Designing and developing modern, responsive web applications with clean and intuitive interfaces.', icon: 'layout', isActive: true, displayOrder: 5 },
  ];
  for (const svc of services) {
    await api(token, 'POST', '/api/services', svc);
    console.log(`  ✅ ${svc.title}`);
  }

  // 8. Experience
  console.log('\n💼 Restoring experience...');
  const existingExp = await api(token, 'GET', '/api/experience', null);
  const expArr = Array.isArray(existingExp) ? existingExp : (existingExp.experience || []);
  for (const e of expArr) {
    const id = e._id || e.id;
    if (id) await api(token, 'DELETE', `/api/experience/${id}`, null);
  }
  await api(token, 'POST', '/api/experience', {
    organization: 'Nanocodes Programming Limited',
    role: 'Mobile Development Trainee',
    location: 'Nsukka, Enugu State, Nigeria',
    startDate: '',
    endDate: '',
    isCurrent: true,
    description: 'Mobile app development training and practical software development experience.',
    displayOrder: 1,
  });
  console.log('  ✅ Nanocodes Programming Limited');

  console.log('\n✅ =========================================');
  console.log('✅  All your data has been fully restored!');
  console.log('✅ =========================================');
  console.log(`\n🌐 View your portfolio: ${BASE}`);
  console.log(`🔐 Admin dashboard:    ${BASE}/admin\n`);
}

restore().catch(err => {
  console.error('❌ Restore failed:', err.message);
  process.exit(1);
});
