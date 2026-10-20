/* ═══════════════════════════════════════════════════════════════════════════
   KENECHUKWU ASOGWA — PUBLIC PORTFOLIO JAVASCRIPT
   ═══════════════════════════════════════════════════════════════════════════ */

const API = '';

// ─── Utility Functions ────────────────────────────────────────────────────────
async function apiFetch(endpoint) {
  try {
    const res = await fetch(API + endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    return null;
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 4000);
}

function getServiceIcon(icon) {
  const icons = {
    smartphone: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    monitor: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    server: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
    database: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    code: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>`,
    globe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    settings: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  };
  return icons[icon] || icons.code;
}

function getSocialIcon(platform) {
  const p = platform.toLowerCase();
  if (p === 'github') return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`;
  if (p === 'linkedin') return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
  if (p === 'twitter' || p === 'x') return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
  if (p === 'whatsapp') return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
  if (p === 'email') return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
}

function getSocialLink(platform, url) {
  const p = platform.toLowerCase();
  if (!url || url.trim() === '') return '#';
  if (p === 'email') return `mailto:${url}`;
  if (p === 'whatsapp') return `https://wa.me/${url.replace(/\D/g, '')}`;
  return url;
}

// ─── Apply Site Settings ──────────────────────────────────────────────────────
async function applySettings() {
  const settings = await apiFetch('/api/settings');
  if (!settings) return;

  // Update document title
  if (settings.portfolio_title) document.title = settings.portfolio_title;

  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && settings.meta_description) metaDesc.content = settings.meta_description;

  // Apply accent color
  if (settings.accent_color) {
    document.documentElement.style.setProperty('--accent', settings.accent_color);
    // Generate lighter/darker variants
    document.documentElement.style.setProperty('--accent-light', settings.accent_color);
    document.documentElement.style.setProperty('--accent-dark', settings.accent_color);
  }

  // Footer text
  if (settings.footer_text) {
    const footerText = document.getElementById('footer-text');
    if (footerText) footerText.textContent = settings.footer_text;
  }
}

// ─── Load Profile ─────────────────────────────────────────────────────────────
async function loadProfile() {
  const profile = await apiFetch('/api/profile');
  if (!profile) return;

  // Hero
  const heroName = document.getElementById('hero-name');
  const heroTitle = document.getElementById('hero-title');
  const heroTagline = document.getElementById('hero-tagline');
  const heroIntro = document.getElementById('hero-intro');
  const heroLocation = document.getElementById('hero-location');
  const heroImg = document.getElementById('hero-profile-img');
  const heroPlaceholder = document.getElementById('hero-avatar-placeholder');

  if (heroName && profile.full_name) heroName.textContent = profile.full_name;
  if (heroTitle && profile.professional_title) heroTitle.textContent = profile.professional_title;
  if (heroTagline && profile.tagline) heroTagline.textContent = profile.tagline;
  if (heroIntro && profile.hero_intro) heroIntro.textContent = profile.hero_intro;
  if (heroLocation && profile.location) heroLocation.textContent = profile.location;

  if (profile.profile_picture && heroImg) {
    heroImg.src = profile.profile_picture;
    heroImg.alt = profile.full_name || 'Profile picture';
    heroImg.style.display = 'block';
    if (heroPlaceholder) heroPlaceholder.style.display = 'none';
  }

  // About section
  const aboutDesc = document.getElementById('about-description');
  const aboutExtra = document.getElementById('about-extra');
  const aboutLocation = document.getElementById('about-location');
  const aboutTitle = document.getElementById('about-title');
  const aboutHeading = document.getElementById('about-heading');

  if (aboutDesc && profile.about_description) aboutDesc.textContent = profile.about_description;
  if (aboutExtra && profile.about_extra && profile.about_extra.trim()) {
    aboutExtra.textContent = profile.about_extra;
    aboutExtra.style.display = 'block';
  }
  if (aboutLocation && profile.location) aboutLocation.textContent = profile.location;
  if (aboutTitle && profile.professional_title) aboutTitle.textContent = profile.professional_title;
  if (aboutHeading && profile.about_heading) aboutHeading.textContent = profile.about_heading;
  if (profile.tagline) {
    const footerTagline = document.getElementById('footer-tagline');
    if (footerTagline) footerTagline.textContent = profile.tagline;
  }
}

// ─── Load CV Status ───────────────────────────────────────────────────────────
async function loadCVStatus() {
  const data = await apiFetch('/api/cv');
  const btn = document.getElementById('btn-download-cv');
  if (data && data.cv && btn) {
    btn.style.display = 'inline-flex';
  }
}

// ─── Load Social Links ────────────────────────────────────────────────────────
async function loadSocialLinks() {
  const links = await apiFetch('/api/social');
  if (!links || !links.length) return;

  const heroSocials = document.getElementById('hero-socials');
  const footerSocials = document.getElementById('footer-socials');

  const socialHTML = links.map(link => {
    const href = getSocialLink(link.platform, link.url);
    const isExternal = !href.startsWith('mailto:') && href !== '#';
    return `<a href="${href}" class="social-icon" aria-label="${link.platform}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}>${getSocialIcon(link.platform)}</a>`;
  }).join('');

  if (heroSocials) heroSocials.innerHTML = socialHTML;
  if (footerSocials) footerSocials.innerHTML = socialHTML;
}

// ─── Load Contact Info ────────────────────────────────────────────────────────
async function loadContactInfo() {
  const contact = await apiFetch('/api/contact');
  if (!contact) return;

  const emailCard = document.getElementById('contact-email-card');
  const emailLink = document.getElementById('contact-email-link');
  const whatsappCard = document.getElementById('contact-whatsapp-card');
  const whatsappLink = document.getElementById('contact-whatsapp-link');
  const locationEl = document.getElementById('contact-location');

  if (contact.email && emailCard && emailLink) {
    emailLink.href = `mailto:${contact.email}`;
    emailLink.textContent = contact.email;
    emailCard.style.display = 'flex';
  }

  if (contact.whatsapp && whatsappCard && whatsappLink) {
    const waNum = contact.whatsapp.replace(/\D/g, '');
    whatsappLink.href = `https://wa.me/${waNum}`;
    whatsappLink.textContent = contact.whatsapp;
    whatsappCard.style.display = 'flex';
  }

  if (locationEl && contact.location) locationEl.textContent = contact.location;
}

// ─── Load Skills ──────────────────────────────────────────────────────────────
async function loadSkills() {
  const skills = await apiFetch('/api/skills');
  const container = document.getElementById('skills-container');
  if (!container) return;

  if (!skills || !skills.length) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted)">No skills added yet.</p>';
    return;
  }

  // Update skill count in stats
  const statSkills = document.getElementById('stat-skills');
  if (statSkills) statSkills.textContent = `${skills.length}+`;

  // Group by category
  const categories = {};
  for (const skill of skills) {
    if (!categories[skill.category]) categories[skill.category] = [];
    categories[skill.category].push(skill);
  }

  container.innerHTML = Object.entries(categories).map(([cat, catSkills]) => `
    <div class="skills-category fade-in">
      <h3 class="skills-category-title">${escapeHtml(cat)}</h3>
      <div class="skills-list">
        ${catSkills.map(s => `<span class="skill-tag">${escapeHtml(s.name)}</span>`).join('')}
      </div>
    </div>
  `).join('');

  observeFadeIns();
}

// ─── Render Single Project Card ───────────────────────────────────────────────
function renderProjectCard(p) {
  const hasLive = p.live_url && p.live_url.trim() !== '';
  const hasGithub = p.github_url && p.github_url.trim() !== '';

  const apkDownload = (p.apk_file && p.apk_file.trim() !== '') ? p.apk_file : (p.apk_url && p.apk_url.trim() !== '') ? p.apk_url : null;
  const isDirectApk = Boolean(p.apk_file && p.apk_file.trim() !== '');
  const hasPlayStore = p.play_store_url && p.play_store_url.trim() !== '';
  const hasAppStore = p.app_store_url && p.app_store_url.trim() !== '';

  const imageHtml = p.main_image
    ? `<img class="project-image" src="${p.main_image}" alt="${escapeHtml(p.name)}" loading="lazy" />`
    : `<div class="project-image-placeholder">
         <svg class="project-placeholder-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
       </div>`;

  const techsHtml = p.technologies && p.technologies.length
    ? `<div class="project-techs">${p.technologies.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}</div>`
    : '';

  const actionsHtml = `
    <div class="project-actions">
      ${hasLive ? `<a href="${escapeHtml(p.live_url)}" class="btn-project btn-live" target="_blank" rel="noopener noreferrer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        View Live Project
      </a>` : ''}
      ${hasGithub ? `<a href="${escapeHtml(p.github_url)}" class="btn-project btn-github" target="_blank" rel="noopener noreferrer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        GitHub
      </a>` : ''}
      ${apkDownload ? `<a href="${escapeHtml(apkDownload)}" class="btn-project btn-download-apk" ${isDirectApk ? 'download' : 'target="_blank" rel="noopener noreferrer"'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5898 8.4087 13.843 8.082 12 8.082s-3.5898.3267-5.1378.868L4.8399 5.4467a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/></svg>
        Download for Android
      </a>` : ''}
      ${hasPlayStore ? `<a href="${escapeHtml(p.play_store_url)}" class="btn-project btn-playstore" target="_blank" rel="noopener noreferrer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a2.29 2.29 0 01-.61-1.616V3.43c0-.629.224-1.21.609-1.616zm11.233 11.235l2.25 2.25-11.41 6.58 9.16-8.83zm2.25-2.098l2.946 1.698a1.274 1.274 0 010 2.204l-2.946 1.698-2.036-2.036 2.036-2.036zM5.682 3.37l11.41 6.58-2.25 2.25-9.16-8.83z"/></svg>
        Google Play
      </a>` : ''}
      ${hasAppStore ? `<a href="${escapeHtml(p.app_store_url)}" class="btn-project btn-appstore" target="_blank" rel="noopener noreferrer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.67-.82 1.13-1.96.99-3.1-.98.04-2.17.65-2.88 1.48-.63.73-1.18 1.89-1.03 3 .02 0 .04 0 .06 0 1.05 0 2.19-.56 2.86-1.38z"/></svg>
        App Store
      </a>` : ''}
    </div>
  `;

  return `
    <article class="project-card fade-in" aria-label="${escapeHtml(p.name)} project">
      ${imageHtml}
      <div class="project-body">
        <div class="project-meta">
          <span class="project-category">${escapeHtml(p.category || 'Project')}</span>
          ${p.is_featured ? '<span class="project-featured-badge">⭐ Featured</span>' : ''}
        </div>
        <h3 class="project-name">${escapeHtml(p.name)}</h3>
        ${p.tagline ? `<p class="project-tagline">${escapeHtml(p.tagline)}</p>` : ''}
        <p class="project-description">${escapeHtml(p.description || '')}</p>
        ${techsHtml}
        ${actionsHtml}
      </div>
    </article>
  `;
}

// ─── Load Projects ────────────────────────────────────────────────────────────
async function loadProjects() {
  const projects = await apiFetch('/api/projects');
  const webContainer = document.getElementById('web-projects-container');
  const mobileContainer = document.getElementById('mobile-projects-container');
  const legacyContainer = document.getElementById('projects-container');

  if (!projects || !projects.length) {
    if (webContainer) webContainer.innerHTML = '<p class="projects-empty-state">No web projects yet.</p>';
    if (mobileContainer) mobileContainer.innerHTML = '<p class="projects-empty-state">No mobile app projects yet.</p>';
    if (legacyContainer) legacyContainer.innerHTML = '<p class="projects-empty-state">No projects yet.</p>';
    return;
  }

  // Update project count in stats
  const statProjects = document.getElementById('stat-projects');
  if (statProjects) statProjects.textContent = `${projects.length}+`;

  // Separate projects into Web Projects and Mobile App Projects
  const webProjects = [];
  const mobileProjects = [];

  for (const p of projects) {
    const cat = (p.category || '').toLowerCase();
    if (cat.includes('web') || cat === 'frontend' || cat === 'backend') {
      webProjects.push(p);
    } else {
      mobileProjects.push(p);
    }
  }

  if (webContainer) {
    webContainer.innerHTML = webProjects.length
      ? webProjects.map(renderProjectCard).join('')
      : '<p class="projects-empty-state">No web projects published yet.</p>';
  }

  if (mobileContainer) {
    mobileContainer.innerHTML = mobileProjects.length
      ? mobileProjects.map(renderProjectCard).join('')
      : '<p class="projects-empty-state">No mobile app projects published yet.</p>';
  }

  if (legacyContainer && !webContainer && !mobileContainer) {
    legacyContainer.innerHTML = projects.map(renderProjectCard).join('');
  }

  observeFadeIns();
}

// ─── Load Experience ──────────────────────────────────────────────────────────
async function loadExperience() {
  const experience = await apiFetch('/api/experience');
  const container = document.getElementById('experience-container');
  if (!container) return;

  if (!experience || !experience.length) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted)">No experience entries yet.</p>';
    return;
  }

  container.innerHTML = experience.map(exp => {
    let dateStr = '';
    if (exp.start_date) {
      dateStr = exp.start_date;
      if (exp.is_current) {
        dateStr += ' – Present';
      } else if (exp.end_date) {
        dateStr += ` – ${exp.end_date}`;
      }
    }

    return `
      <div class="timeline-item fade-in">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <div class="timeline-header">
            <h3 class="timeline-org">${escapeHtml(exp.organization)}</h3>
            ${dateStr ? `<span class="timeline-date">${escapeHtml(dateStr)}</span>` : ''}
          </div>
          ${exp.role ? `<p class="timeline-role">${escapeHtml(exp.role)}</p>` : ''}
          ${exp.location ? `<p class="timeline-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${escapeHtml(exp.location)}
          </p>` : ''}
          ${exp.description ? `<p class="timeline-description">${escapeHtml(exp.description)}</p>` : ''}
        </div>
      </div>
    `;
  }).join('');

  observeFadeIns();
}

// ─── Load Services ────────────────────────────────────────────────────────────
async function loadServices() {
  const services = await apiFetch('/api/services');
  const container = document.getElementById('services-container');
  if (!container) return;

  if (!services || !services.length) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted)">No services added yet.</p>';
    return;
  }

  container.innerHTML = services.map(s => `
    <div class="service-card fade-in">
      <div class="service-icon">${getServiceIcon(s.icon)}</div>
      <h3 class="service-title">${escapeHtml(s.title)}</h3>
      <p class="service-description">${escapeHtml(s.description || '')}</p>
    </div>
  `).join('');

  observeFadeIns();
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    ['name-error', 'email-error', 'message-error'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    ['contact-name', 'contact-email-input', 'contact-message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('error');
    });

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email-input').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const submitBtn = document.getElementById('contact-submit');
    const statusEl = document.getElementById('form-status');

    let hasError = false;

    if (!name) {
      document.getElementById('name-error').textContent = 'Name is required.';
      document.getElementById('contact-name').classList.add('error');
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      document.getElementById('email-error').textContent = 'Email is required.';
      document.getElementById('contact-email-input').classList.add('error');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      document.getElementById('email-error').textContent = 'Please enter a valid email.';
      document.getElementById('contact-email-input').classList.add('error');
      hasError = true;
    }

    if (!message || message.length < 10) {
      document.getElementById('message-error').textContent = 'Message must be at least 10 characters.';
      document.getElementById('contact-message').classList.add('error');
      hasError = true;
    }

    if (hasError) return;

    // Submit
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    try {
      const res = await fetch('/api/contact/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        statusEl.textContent = '✅ ' + data.message;
        statusEl.className = 'form-status success';
        form.reset();
      } else {
        statusEl.textContent = '❌ ' + (data.error || 'Something went wrong. Please try again.');
        statusEl.className = 'form-status error';
      }
    } catch (err) {
      statusEl.textContent = '❌ Network error. Please try again later.';
      statusEl.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2"/></svg> Send Message`;
    }
  });
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen.toString());
    });

    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}

// ─── Fade In Animations ───────────────────────────────────────────────────────
function observeFadeIns() {
  const elements = document.querySelectorAll('.fade-in:not(.visible)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── Initialize ───────────────────────────────────────────────────────────────
async function init() {
  initNavbar();
  initContactForm();
  observeFadeIns();

  // Load all data in parallel
  await Promise.all([
    applySettings(),
    loadProfile(),
    loadCVStatus(),
    loadSocialLinks(),
    loadContactInfo(),
    loadSkills(),
    loadProjects(),
    loadExperience(),
    loadServices(),
  ]);

  // Re-run fade in after dynamic content loaded
  observeFadeIns();
}

document.addEventListener('DOMContentLoaded', init);
