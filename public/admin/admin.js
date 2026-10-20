/* ═══════════════════════════════════════════════════════════════════════════
   KC PORTFOLIO — ADMIN DASHBOARD JAVASCRIPT
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── State ────────────────────────────────────────────────────────────────────
let authToken = null;
let currentSection = 'overview';
let editingItem = null;

// ─── Auth Helpers ─────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('kc_admin_token');
}
function setToken(token) {
  localStorage.setItem('kc_admin_token', token);
  authToken = token;
}
function clearToken() {
  localStorage.removeItem('kc_admin_token');
  authToken = null;
}

// ─── API Helpers ──────────────────────────────────────────────────────────────
async function api(method, endpoint, body = null, isFormData = false) {
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const opts = { method, headers };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(endpoint, opts);
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 || res.status === 403) {
    logout();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function toast(message, type = 'success') {
  const el = document.getElementById('admin-toast');
  el.textContent = message;
  el.className = `toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 4000);
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function showModal({ title, body, actions }) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  const footer = document.getElementById('modal-footer');
  footer.innerHTML = actions.map(a =>
    `<button class="btn ${a.class || 'btn-ghost'}" id="modal-action-${a.id}">${a.label}</button>`
  ).join('');
  document.getElementById('modal-overlay').style.display = 'flex';

  return new Promise((resolve) => {
    actions.forEach(a => {
      document.getElementById(`modal-action-${a.id}`)?.addEventListener('click', () => {
        closeModal();
        resolve(a.id);
      });
    });
    document.getElementById('modal-close')?.addEventListener('click', () => {
      closeModal();
      resolve(null);
    });
  });
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

// ─── Escape HTML ──────────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Login ────────────────────────────────────────────────────────────────────
function initLogin() {
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const pwdToggle = document.getElementById('password-toggle');
  const pwdInput = document.getElementById('login-password');
  const eyeShow = document.getElementById('eye-show');
  const eyeHide = document.getElementById('eye-hide');

  pwdToggle?.addEventListener('click', () => {
    const isPass = pwdInput.type === 'password';
    pwdInput.type = isPass ? 'text' : 'password';
    eyeShow.style.display = isPass ? 'none' : 'block';
    eyeHide.style.display = isPass ? 'block' : 'none';
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    errorEl.classList.remove('show');

    if (!email || !password) {
      errorEl.textContent = 'Please enter your email and password.';
      errorEl.classList.add('show');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Signing in...';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token);
        showDashboard(data.user);
      } else {
        errorEl.textContent = data.error || 'Login failed. Please try again.';
        errorEl.classList.add('show');
      }
    } catch (err) {
      errorEl.textContent = 'Network error. Please try again.';
      errorEl.classList.add('show');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Sign In`;
    }
  });
}

function logout() {
  clearToken();
  document.getElementById('admin-app').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
  toast('Logged out successfully.', 'info');
}

// ─── Show Dashboard ───────────────────────────────────────────────────────────
function showDashboard(user) {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('admin-app').style.display = 'flex';

  if (user) {
    const name = user.name || 'Admin';
    document.getElementById('admin-name').textContent = name;
    document.getElementById('admin-email').textContent = user.email || '';
    document.getElementById('admin-avatar').textContent = name[0].toUpperCase();
  }

  initSidebar();
  loadSection('overview');
  loadMessageCount();
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebarClose = document.getElementById('sidebar-close');

  menuToggle?.addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('show');
    menuToggle.setAttribute('aria-expanded', 'true');
  });

  sidebarClose?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    menuToggle?.setAttribute('aria-expanded', 'false');
  }

  // Nav items
  document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      loadSection(section);
      if (window.innerWidth < 900) closeSidebar();
    });
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', logout);
}

function setActiveNav(section) {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === section);
    btn.setAttribute('aria-current', btn.dataset.section === section ? 'page' : '');
  });

  const titles = {
    overview: 'Overview',
    profile: 'Profile Management',
    skills: 'Skills Manager',
    projects: 'Projects Manager',
    experience: 'Experience Manager',
    services: 'Services Manager',
    social: 'Social Links',
    contact: 'Contact Information',
    cv: 'CV / Resume',
    messages: 'Contact Messages',
    settings: 'Site Settings',
  };
  document.getElementById('topbar-title').textContent = titles[section] || section;
}

// ─── Section Router ───────────────────────────────────────────────────────────
async function loadSection(section) {
  currentSection = section;
  setActiveNav(section);
  const content = document.getElementById('content');
  content.innerHTML = `<div class="loading-screen"><div class="spinner"></div><p>Loading...</p></div>`;

  const renderers = {
    overview: renderOverview,
    profile: renderProfile,
    skills: renderSkills,
    projects: renderProjects,
    experience: renderExperience,
    services: renderServices,
    social: renderSocial,
    contact: renderContact,
    cv: renderCV,
    messages: renderMessages,
    settings: renderSettings,
  };

  const render = renderers[section];
  if (render) {
    try {
      await render(content);
    } catch (err) {
      content.innerHTML = `<div class="alert alert-danger">Failed to load section: ${esc(err.message)}</div>`;
    }
  }
}

// ─── Message Count Badge ──────────────────────────────────────────────────────
async function loadMessageCount() {
  try {
    const messages = await api('GET', '/api/contact/messages');
    const unread = messages.filter(m => !m.is_read).length;
    const badge = document.getElementById('msg-badge');
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'inline-block' : 'none';
    }
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
async function renderOverview(content) {
  const [profile, projects, skills, experience, services, messages] = await Promise.all([
    api('GET', '/api/profile').catch(() => ({})),
    api('GET', '/api/projects/all').catch(() => []),
    api('GET', '/api/skills/all').catch(() => []),
    api('GET', '/api/experience').catch(() => []),
    api('GET', '/api/services/all').catch(() => []),
    api('GET', '/api/contact/messages').catch(() => []),
  ]);

  const unread = messages.filter(m => !m.is_read).length;

  content.innerHTML = `
    <div class="section-header-admin">
      <div>
        <h1 class="section-title-admin">Welcome back, ${esc(profile.full_name || 'Admin')} 👋</h1>
        <p style="color:var(--text-subtle);font-size:0.875rem;margin-top:4px">Manage your portfolio from this dashboard.</p>
      </div>
      <a href="/" target="_blank" class="btn btn-ghost btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        View Portfolio
      </a>
    </div>

    <div class="stats-grid">
      <div class="stat-card-admin">
        <div class="stat-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
        </div>
        <div class="stat-number-admin">${projects.length}</div>
        <div class="stat-label-admin">Projects</div>
      </div>
      <div class="stat-card-admin">
        <div class="stat-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>
        </div>
        <div class="stat-number-admin">${skills.length}</div>
        <div class="stat-label-admin">Skills</div>
      </div>
      <div class="stat-card-admin">
        <div class="stat-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
        <div class="stat-number-admin">${experience.length}</div>
        <div class="stat-label-admin">Experience</div>
      </div>
      <div class="stat-card-admin">
        <div class="stat-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="stat-number-admin">${services.length}</div>
        <div class="stat-label-admin">Services</div>
      </div>
      <div class="stat-card-admin">
        <div class="stat-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="stat-number-admin" style="color:${unread > 0 ? 'var(--danger)' : 'var(--text)'}">${messages.length}</div>
        <div class="stat-label-admin">Messages${unread > 0 ? ` (${unread} unread)` : ''}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Quick Actions</div>
          <div class="card-subtitle">Jump to the most common tasks</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">
        ${[
          { section: 'profile', label: 'Edit Profile', icon: 'user' },
          { section: 'projects', label: 'Manage Projects', icon: 'monitor' },
          { section: 'skills', label: 'Manage Skills', icon: 'code' },
          { section: 'experience', label: 'Add Experience', icon: 'briefcase' },
          { section: 'cv', label: 'Upload CV', icon: 'file' },
          { section: 'messages', label: 'View Messages', icon: 'message' },
        ].map(a => `
          <button class="btn btn-ghost" onclick="loadSection('${a.section}')" style="justify-content:center;padding:14px">
            ${a.label}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════════════════════
async function renderProfile(content) {
  const profile = await api('GET', '/api/profile');

  content.innerHTML = `
    <div class="section-header-admin">
      <h1 class="section-title-admin">Profile Management</h1>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start">
      <!-- Profile Picture -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Profile Picture</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center">
          <div id="profile-pic-preview" style="position:relative">
            ${profile.profile_picture
              ? `<img src="${esc(profile.profile_picture)}" alt="Profile" class="profile-picture-preview" />`
              : `<div style="width:120px;height:120px;border-radius:50%;background:rgba(99,102,241,0.12);border:3px dashed var(--border-accent);display:flex;align-items:center;justify-content:center;color:var(--text-subtle)">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                 </div>`
            }
          </div>
          <div style="width:100%">
            <label class="upload-zone" style="padding:20px;display:flex;flex-direction:column;align-items:center;gap:8px">
              <input type="file" id="profile-pic-input" accept=".jpg,.jpeg,.png,.webp" />
              <svg class="upload-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p class="upload-text">Click to upload picture</p>
              <p class="upload-hint">JPG, JPEG, PNG, WEBP — max 5MB</p>
            </label>
            <div id="profile-pic-status" style="margin-top:8px;font-size:0.8rem;text-align:center;min-height:20px"></div>
            <div style="display:flex;gap:8px;margin-top:10px;justify-content:center">
              <button class="btn btn-primary btn-sm" id="upload-pic-btn" style="display:none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload
              </button>
              ${profile.profile_picture ? `<button class="btn btn-danger btn-sm" id="remove-pic-btn">Remove</button>` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Basic Info -->
      <div class="card">
        <div class="card-header"><div class="card-title">Basic Information</div></div>
        <form id="profile-form">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input class="form-input" name="full_name" value="${esc(profile.full_name || '')}" placeholder="Your full name" required />
          </div>
          <div class="form-group">
            <label class="form-label">Professional Title</label>
            <input class="form-input" name="professional_title" value="${esc(profile.professional_title || '')}" placeholder="e.g. Mobile & Software Developer" required />
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <input class="form-input" name="location" value="${esc(profile.location || '')}" placeholder="e.g. Nigeria" />
          </div>
          <div class="form-group">
            <label class="form-label">Tagline</label>
            <input class="form-input" name="tagline" value="${esc(profile.tagline || '')}" placeholder="Short tagline" />
          </div>
          <div class="form-group">
            <label class="form-label">Hero Intro Text</label>
            <input class="form-input" name="hero_intro" value="${esc(profile.hero_intro || '')}" placeholder="e.g. Hi, I'm Kenechukwu 👋" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" id="profile-save-btn">Save Profile</button>
          </div>
        </form>
      </div>
    </div>

    <!-- About Section -->
    <div class="card" style="margin-top:24px">
      <div class="card-header"><div class="card-title">About Me Section</div></div>
      <form id="about-form">
        <div class="form-group">
          <label class="form-label">Section Heading</label>
          <input class="form-input" name="about_heading" value="${esc(profile.about_heading || 'About Me')}" />
        </div>
        <div class="form-group">
          <label class="form-label">Main Description</label>
          <textarea class="form-input form-textarea" name="about_description" rows="5" placeholder="Tell visitors about yourself...">${esc(profile.about_description || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Additional Paragraph (optional)</label>
          <textarea class="form-input form-textarea" name="about_extra" rows="3" placeholder="Optional extra paragraph...">${esc(profile.about_extra || '')}</textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save About</button>
        </div>
      </form>
    </div>
  `;

  // ─ Profile Picture Upload ─
  const picInput = document.getElementById('profile-pic-input');
  const uploadBtn = document.getElementById('upload-pic-btn');
  const picStatus = document.getElementById('profile-pic-status');
  const picPreview = document.getElementById('profile-pic-preview');
  let selectedFile = null;

  picInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      picStatus.innerHTML = '<span style="color:var(--danger)">Invalid file type. Use JPG, PNG, or WEBP.</span>';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      picStatus.innerHTML = '<span style="color:var(--danger)">File too large. Max 5MB.</span>';
      return;
    }

    selectedFile = file;
    picStatus.innerHTML = `<span style="color:var(--success)">Ready: ${esc(file.name)}</span>`;
    uploadBtn.style.display = 'inline-flex';

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      picPreview.innerHTML = `<img src="${ev.target.result}" alt="Preview" class="profile-picture-preview" />`;
    };
    reader.readAsDataURL(file);
  });

  uploadBtn?.addEventListener('click', async () => {
    if (!selectedFile) return;
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';
    picStatus.textContent = '';

    try {
      const formData = new FormData();
      formData.append('picture', selectedFile);
      const result = await api('POST', '/api/profile/picture', formData, true);
      toast('Profile picture uploaded successfully!', 'success');
      picStatus.innerHTML = '<span style="color:var(--success)">Uploaded successfully!</span>';
      uploadBtn.style.display = 'none';
      selectedFile = null;
    } catch (err) {
      toast(err.message, 'error');
      picStatus.innerHTML = `<span style="color:var(--danger)">${esc(err.message)}</span>`;
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload';
    }
  });

  // Remove picture
  document.getElementById('remove-pic-btn')?.addEventListener('click', async () => {
    const result = await showModal({
      title: 'Remove Profile Picture',
      body: '<p style="color:var(--text-muted)">Are you sure you want to remove your profile picture?</p>',
      actions: [
        { id: 'cancel', label: 'Cancel', class: 'btn-ghost' },
        { id: 'confirm', label: 'Remove', class: 'btn-danger' },
      ],
    });
    if (result === 'confirm') {
      try {
        await api('DELETE', '/api/profile/picture');
        toast('Profile picture removed.', 'success');
        renderProfile(content);
      } catch (err) { toast(err.message, 'error'); }
    }
  });

  // ─ Profile Form ─
  document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('profile-save-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());

    // Merge about fields from the other form
    const aboutFd = new FormData(document.getElementById('about-form'));
    Object.assign(body, Object.fromEntries(aboutFd.entries()));

    try {
      await api('PUT', '/api/profile', body);
      toast('Profile saved successfully!', 'success');
      await renderProfile(content);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Profile';
    }
  });

  // ─ About Form ─
  document.getElementById('about-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    // Merge with profile form
    const profileFd = new FormData(document.getElementById('profile-form'));
    const fd = new FormData(e.target);
    const body = { ...Object.fromEntries(profileFd.entries()), ...Object.fromEntries(fd.entries()) };

    try {
      await api('PUT', '/api/profile', body);
      toast('About section saved successfully!', 'success');
      await renderProfile(content);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save About';
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILLS
// ═══════════════════════════════════════════════════════════════════════════════
async function renderSkills(content) {
  const skills = await api('GET', '/api/skills/all');
  const categories = ['Mobile', 'Frontend', 'Backend', 'Database', 'Tools', 'Other'];

  content.innerHTML = `
    <div class="section-header-admin">
      <h1 class="section-title-admin">Skills Manager</h1>
      <button class="btn btn-primary" id="add-skill-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Skill
      </button>
    </div>

    <!-- Add/Edit Form -->
    <div class="card" id="skill-form-wrap" style="display:none;margin-bottom:24px">
      <div class="card-header">
        <div class="card-title" id="skill-form-title">Add Skill</div>
      </div>
      <form id="skill-form">
        <input type="hidden" id="skill-id" />
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Skill Name <span style="color:var(--accent-light)">*</span></label>
            <input class="form-input" id="skill-name" placeholder="e.g. Flutter" required />
          </div>
          <div class="form-group">
            <label class="form-label">Category <span style="color:var(--accent-light)">*</span></label>
            <select class="form-select" id="skill-category">
              ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-checkbox-wrap">
            <input type="checkbox" id="skill-active" checked />
            <span class="form-checkbox-label">Active (visible on portfolio)</span>
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="skill-save-btn">Save Skill</button>
          <button type="button" class="btn btn-ghost" id="skill-cancel-btn">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Skills List -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">All Skills (${skills.length})</div>
      </div>
      ${skills.length === 0
        ? `<div class="empty-state"><p>No skills yet. Click "Add Skill" to get started.</p></div>`
        : `<div class="item-list" id="skills-list">
            ${skills.map(s => `
              <div class="item-row" data-id="${s.id}">
                <div class="item-info">
                  <div class="item-name">${esc(s.name)}</div>
                  <div class="item-meta">${esc(s.category)}</div>
                </div>
                <div class="item-badges">
                  ${s.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-muted">Inactive</span>'}
                </div>
                <div class="item-actions">
                  <button class="btn btn-ghost btn-xs" onclick="editSkill('${s.id}')">Edit</button>
                  <button class="btn btn-danger btn-xs" onclick="deleteSkill('${s.id}', '${esc(s.name)}')">Delete</button>
                </div>
              </div>
            `).join('')}
          </div>`
      }
    </div>
  `;

  // Toggle form
  document.getElementById('add-skill-btn')?.addEventListener('click', () => {
    document.getElementById('skill-form-wrap').style.display = 'block';
    document.getElementById('skill-form-title').textContent = 'Add Skill';
    document.getElementById('skill-id').value = '';
    document.getElementById('skill-name').value = '';
    document.getElementById('skill-category').value = categories[0];
    document.getElementById('skill-active').checked = true;
    document.getElementById('skill-name').focus();
  });

  document.getElementById('skill-cancel-btn')?.addEventListener('click', () => {
    document.getElementById('skill-form-wrap').style.display = 'none';
  });

  document.getElementById('skill-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('skill-id').value;
    const name = document.getElementById('skill-name').value.trim();
    const category = document.getElementById('skill-category').value;
    const is_active = document.getElementById('skill-active').checked ? 1 : 0;
    const btn = document.getElementById('skill-save-btn');

    if (!name) return toast('Skill name is required.', 'error');

    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      if (id) {
        await api('PUT', `/api/skills/${id}`, { name, category, is_active });
        toast('Skill updated successfully!', 'success');
      } else {
        await api('POST', '/api/skills', { name, category, is_active });
        toast('Skill added successfully!', 'success');
      }
      await renderSkills(content);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Skill';
    }
  });
}

window.editSkill = async (id) => {
  try {
    const skills = await api('GET', '/api/skills/all');
    const skill = skills.find(s => String(s.id) === String(id));
    if (!skill) return;

    document.getElementById('skill-form-wrap').style.display = 'block';
    document.getElementById('skill-form-title').textContent = 'Edit Skill';
    document.getElementById('skill-id').value = skill.id;
    document.getElementById('skill-name').value = skill.name;
    document.getElementById('skill-category').value = skill.category;
    document.getElementById('skill-active').checked = !!skill.is_active;
    document.getElementById('skill-form-wrap').scrollIntoView({ behavior: 'smooth' });
  } catch (err) { toast(err.message, 'error'); }
};

window.deleteSkill = async (id, name) => {
  const result = await showModal({
    title: 'Delete Skill',
    body: `<p style="color:var(--text-muted)">Are you sure you want to delete the skill "<strong>${esc(name)}</strong>"? This cannot be undone.</p>`,
    actions: [
      { id: 'cancel', label: 'Cancel', class: 'btn-ghost' },
      { id: 'confirm', label: 'Delete', class: 'btn-danger' },
    ],
  });
  if (result === 'confirm') {
    try {
      await api('DELETE', `/api/skills/${id}`);
      toast('Skill deleted successfully.', 'success');
      loadSection('skills');
    } catch (err) { toast(err.message, 'error'); }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════════════════════
async function renderProjects(content) {
  const projects = await api('GET', '/api/projects/all');

  content.innerHTML = `
    <div class="section-header-admin">
      <h1 class="section-title-admin">Projects Manager</h1>
      <button class="btn btn-primary" id="add-project-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Project
      </button>
    </div>

    <!-- Project Form -->
    <div class="card" id="project-form-wrap" style="display:none;margin-bottom:24px">
      <div class="card-header">
        <div class="card-title" id="project-form-title">Add Project</div>
      </div>
      <form id="project-form">
        <input type="hidden" id="project-id" />

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Project Name <span style="color:var(--accent-light)">*</span></label>
            <input class="form-input" id="proj-name" placeholder="e.g. ElliMate" required />
          </div>
          <div class="form-group">
            <label class="form-label">Platform Category <span style="color:var(--accent-light)">*</span></label>
            <select class="form-select" id="proj-category">
              <option value="Mobile App Project">Mobile App Project</option>
              <option value="Web Project">Web Project</option>
            </select>
            <p class="form-hint">Assign to Web Projects or Mobile App Projects on your portfolio.</p>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Short Tagline</label>
          <input class="form-input" id="proj-tagline" placeholder="e.g. Live together. Communicate better." />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input form-textarea" id="proj-description" rows="5" placeholder="Describe the project..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Technologies Used</label>
          <div class="tech-tags-input" id="tech-tags-container">
            <input type="text" class="tech-tag-input-field" id="tech-input" placeholder="Type a technology and press Enter..." />
          </div>
          <p class="form-hint">Press Enter or comma to add each technology. Press Backspace to remove the last one.</p>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Live Project URL
            </label>
            <input class="form-input" id="proj-live-url" type="url" placeholder="https://my-project.onrender.com" />
            <p class="form-hint">Paste the live hosting URL (e.g., Render, Vercel, Netlify). Leave empty if not yet deployed.</p>
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub Repository URL
            </label>
            <input class="form-input" id="proj-github-url" type="url" placeholder="https://github.com/username/repo" />
          </div>
        </div>

        <!-- Mobile App Downloads Configuration (Optional) -->
        <div id="mobile-download-section" style="margin-top:20px;padding:20px;background:rgba(255,255,255,0.02);border:1px solid var(--border-accent);border-radius:var(--radius)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent-light)"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            <h3 style="font-size:0.95rem;font-weight:700;color:var(--text);margin:0">Mobile App Downloads & Links (Optional)</h3>
          </div>
          <p class="form-hint" style="margin-bottom:16px">Add download options for mobile apps. Corresponding download buttons will appear on the public card.</p>

          <div class="form-group">
            <label class="form-label">Upload Android APK (.apk)</label>
            <div id="proj-apk-current-wrap" style="margin-bottom:8px;display:none;padding:10px 14px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:var(--radius-sm)">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                <span style="font-size:0.85rem;color:#10b981;font-weight:600" id="proj-apk-current-text">Current APK uploaded</span>
                <button type="button" class="btn btn-danger btn-xs" id="proj-apk-remove-btn">Remove APK</button>
              </div>
            </div>
            <label class="upload-zone" style="padding:14px">
              <input type="file" id="proj-apk-input" accept=".apk" />
              <svg class="upload-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p class="upload-text" style="font-size:0.85rem">Click to select APK file (.apk)</p>
              <p class="upload-hint">Max file size: 100MB</p>
            </label>
            <div id="proj-apk-status" style="margin-top:6px;font-size:0.8rem;min-height:18px"></div>
          </div>

          <div class="form-group">
            <label class="form-label">External APK Download URL (Alternative to file upload)</label>
            <input class="form-input" id="proj-apk-url" type="url" placeholder="https://example.com/downloads/app.apk" />
            <p class="form-hint">Direct external link to download the APK (e.g. GitHub Releases, Drive, Firebase).</p>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Google Play Store URL</label>
              <input class="form-input" id="proj-play-store-url" type="url" placeholder="https://play.google.com/store/apps/details?id=..." />
            </div>
            <div class="form-group">
              <label class="form-label">Apple App Store URL</label>
              <input class="form-input" id="proj-app-store-url" type="url" placeholder="https://apps.apple.com/app/..." />
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-top:16px">
          <label class="form-label">Other URL (optional)</label>
          <input class="form-input" id="proj-other-url" type="url" placeholder="https://..." />
        </div>

        <div style="display:flex;gap:16px;flex-wrap:wrap">
          <label class="form-checkbox-wrap" style="flex:1;min-width:180px">
            <input type="checkbox" id="proj-featured" />
            <span class="form-checkbox-label">⭐ Featured Project</span>
          </label>
          <label class="form-checkbox-wrap" style="flex:1;min-width:180px">
            <input type="checkbox" id="proj-published" checked />
            <span class="form-checkbox-label">✅ Published (visible on portfolio)</span>
          </label>
        </div>

        <!-- Project Image Upload -->
        <div class="divider"></div>
        <div id="project-image-section">
          <p class="form-label" style="margin-bottom:12px">Project Main Image</p>
          <div id="proj-image-preview-wrap" style="margin-bottom:12px;display:none">
            <img id="proj-image-preview" src="" alt="Preview" style="max-width:200px;border-radius:var(--radius);border:2px solid var(--border-accent)" />
          </div>
          <label class="upload-zone" style="padding:20px">
            <input type="file" id="proj-image-input" accept=".jpg,.jpeg,.png,.webp" />
            <svg class="upload-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p class="upload-text">Click to select project image</p>
            <p class="upload-hint">JPG, PNG, WEBP — max 10MB</p>
          </label>
          <div id="proj-image-status" style="margin-top:8px;font-size:0.8rem;min-height:20px"></div>
        </div>

        <div class="form-actions" style="margin-top:20px">
          <button type="submit" class="btn btn-primary" id="proj-save-btn">Save Project</button>
          <button type="button" class="btn btn-ghost" id="proj-cancel-btn">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Projects List -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">All Projects (${projects.length})</div>
      </div>
      ${projects.length === 0
        ? `<div class="empty-state"><p>No projects yet. Add your first project above.</p></div>`
        : `<div class="item-list">
            ${projects.map(p => {
              const hasLive = p.live_url && p.live_url.trim() !== '';
              const hasGithub = p.github_url && p.github_url.trim() !== '';
              const hasApk = (p.apk_file && p.apk_file.trim() !== '') || (p.apk_url && p.apk_url.trim() !== '');
              const hasPlay = p.play_store_url && p.play_store_url.trim() !== '';
              const hasAppStore = p.app_store_url && p.app_store_url.trim() !== '';
              return `
              <div class="item-row">
                <div class="item-thumb">
                  ${p.main_image
                    ? `<img src="${esc(p.main_image)}" alt="${esc(p.name)}" />`
                    : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>`
                  }
                </div>
                <div class="item-info">
                  <div class="item-name">${esc(p.name)}</div>
                  <div class="item-meta">
                    <span style="font-weight:600;color:var(--accent-light)">${esc(p.category || 'Project')}</span> · ${p.technologies?.join(', ') || 'No tech listed'}
                    ${hasLive ? ' · 🔗 Live' : ''}
                    ${hasGithub ? ' · 💻 GitHub' : ''}
                    ${hasApk ? ' · 📱 APK' : ''}
                    ${hasPlay ? ' · 🛒 Google Play' : ''}
                    ${hasAppStore ? ' · 🍎 App Store' : ''}
                  </div>
                </div>
                <div class="item-badges">
                  ${p.is_featured ? '<span class="badge badge-warning">Featured</span>' : ''}
                  ${p.is_published ? '<span class="badge badge-success">Published</span>' : '<span class="badge badge-muted">Hidden</span>'}
                </div>
                <div class="item-actions">
                  <button class="btn btn-ghost btn-xs" onclick="editProject('${p.id}')">Edit</button>
                  <button class="btn btn-danger btn-xs" onclick="deleteProject('${p.id}', '${esc(p.name)}')">Delete</button>
                </div>
              </div>
              `;
            }).join('')}
          </div>`
      }
    </div>
  `;

  // Tech tags functionality
  let techTags = [];

  function renderTechTags() {
    const container = document.getElementById('tech-tags-container');
    const input = document.getElementById('tech-input');
    container.querySelectorAll('.tech-tag-item').forEach(t => t.remove());
    techTags.forEach((tag, i) => {
      const el = document.createElement('span');
      el.className = 'tech-tag-item';
      el.innerHTML = `${esc(tag)} <button type="button" class="tech-tag-remove" data-index="${i}" aria-label="Remove ${esc(tag)}">✕</button>`;
      container.insertBefore(el, input);
    });
    container.querySelectorAll('.tech-tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        techTags.splice(parseInt(btn.dataset.index), 1);
        renderTechTags();
      });
    });
  }

  document.getElementById('tech-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = e.target.value.trim().replace(/,+$/, '');
      if (val && !techTags.includes(val)) {
        techTags.push(val);
        renderTechTags();
      }
      e.target.value = '';
    } else if (e.key === 'Backspace' && e.target.value === '' && techTags.length > 0) {
      techTags.pop();
      renderTechTags();
    }
  });

  // Category toggle for Mobile App Downloads
  function updateCategoryVisibility() {
    const cat = document.getElementById('proj-category')?.value || '';
    const isMobile = cat.toLowerCase().includes('mobile');
    const dlSection = document.getElementById('mobile-download-section');
    if (dlSection) dlSection.style.display = isMobile ? 'block' : 'none';
  }
  document.getElementById('proj-category')?.addEventListener('change', updateCategoryVisibility);

  // APK file selection
  let selectedProjectApk = null;
  document.getElementById('proj-apk-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.apk')) {
      toast('Please select a valid .apk file.', 'error');
      e.target.value = '';
      return;
    }
    selectedProjectApk = file;
    document.getElementById('proj-apk-status').innerHTML = `<span style="color:var(--success)">Selected APK: ${esc(file.name)} (${(file.size / (1024 * 1024)).toFixed(1)} MB)</span>`;
  });

  // Image preview
  let selectedProjectImage = null;
  document.getElementById('proj-image-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    selectedProjectImage = file;
    const previewWrap = document.getElementById('proj-image-preview-wrap');
    const preview = document.getElementById('proj-image-preview');
    const statusEl = document.getElementById('proj-image-status');

    const reader = new FileReader();
    reader.onload = (ev) => {
      preview.src = ev.target.result;
      previewWrap.style.display = 'block';
      statusEl.innerHTML = `<span style="color:var(--success)">Selected: ${esc(file.name)}</span>`;
    };
    reader.readAsDataURL(file);
  });

  // Toggle form
  document.getElementById('add-project-btn')?.addEventListener('click', () => {
    techTags = [];
    renderTechTags();
    document.getElementById('project-form').reset();
    document.getElementById('project-id').value = '';
    document.getElementById('project-form-title').textContent = 'Add Project';
    document.getElementById('proj-image-preview-wrap').style.display = 'none';
    document.getElementById('proj-image-status').textContent = '';
    document.getElementById('proj-apk-current-wrap').style.display = 'none';
    document.getElementById('proj-apk-status').textContent = '';
    selectedProjectImage = null;
    selectedProjectApk = null;
    updateCategoryVisibility();
    document.getElementById('project-form-wrap').style.display = 'block';
    document.getElementById('proj-name').focus();
  });

  document.getElementById('proj-cancel-btn')?.addEventListener('click', () => {
    document.getElementById('project-form-wrap').style.display = 'none';
  });

  // Submit
  document.getElementById('project-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    const btn = document.getElementById('proj-save-btn');

    const name = document.getElementById('proj-name').value.trim();
    if (!name) return toast('Project name is required.', 'error');

    btn.disabled = true;
    btn.innerHTML = '<span class="inline-spinner"></span> Saving...';

    try {
      const liveVal = document.getElementById('proj-live-url').value.trim();
      const githubVal = document.getElementById('proj-github-url').value.trim();
      const isFeatured = document.getElementById('proj-featured').checked ? 1 : 0;
      const isPublished = document.getElementById('proj-published').checked ? 1 : 0;
      const currentTags = window._currentTechTags || techTags;

      const body = {
        name,
        tagline: document.getElementById('proj-tagline').value.trim(),
        description: document.getElementById('proj-description').value.trim(),
        category: document.getElementById('proj-category').value,
        liveUrl: liveVal,
        live_url: liveVal,
        githubUrl: githubVal,
        github_url: githubVal,
        apkUrl: document.getElementById('proj-apk-url').value.trim(),
        apk_url: document.getElementById('proj-apk-url').value.trim(),
        playStoreUrl: document.getElementById('proj-play-store-url').value.trim(),
        play_store_url: document.getElementById('proj-play-store-url').value.trim(),
        appStoreUrl: document.getElementById('proj-app-store-url').value.trim(),
        app_store_url: document.getElementById('proj-app-store-url').value.trim(),
        other_url: document.getElementById('proj-other-url').value.trim(),
        featured: isFeatured === 1,
        is_featured: isFeatured,
        published: isPublished === 1,
        is_published: isPublished,
        technologies: currentTags,
      };

      let savedId;
      if (id) {
        await api('PUT', `/api/projects/${id}`, body);
        savedId = id;
        toast('Project updated successfully!', 'success');
      } else {
        const result = await api('POST', '/api/projects', body);
        savedId = result.project.id || result.project._id;
        toast('Project created successfully!', 'success');
      }

      // Upload image if selected
      if (selectedProjectImage && savedId) {
        const imgData = new FormData();
        imgData.append('image', selectedProjectImage);
        await api('POST', `/api/projects/${savedId}/image`, imgData, true);
        toast('Project image uploaded!', 'success');
      }

      // Upload APK if selected
      if (selectedProjectApk && savedId) {
        const apkData = new FormData();
        apkData.append('apk', selectedProjectApk);
        await api('POST', `/api/projects/${savedId}/apk`, apkData, true);
        toast('APK file uploaded!', 'success');
      }

      window._currentTechTags = null;
      selectedProjectImage = null;
      selectedProjectApk = null;
      await renderProjects(content);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Project';
    }
  });
}

window.editProject = async (id) => {
  try {
    const res = await fetch(`/api/projects/${id}`);
    const p = await res.json();

    document.getElementById('project-form-wrap').style.display = 'block';
    document.getElementById('project-form-title').textContent = 'Edit Project';
    document.getElementById('project-id').value = p.id || p._id || '';
    document.getElementById('proj-name').value = p.name || '';
    document.getElementById('proj-tagline').value = p.tagline || '';
    document.getElementById('proj-description').value = p.description || '';

    // Category mapping
    const cat = (p.category || '').toLowerCase();
    const isWeb = cat.includes('web') || cat === 'frontend' || cat === 'backend';
    const catSelect = document.getElementById('proj-category');
    catSelect.value = isWeb ? 'Web Project' : 'Mobile App Project';

    // Toggle mobile download section
    const dlSection = document.getElementById('mobile-download-section');
    if (dlSection) dlSection.style.display = isWeb ? 'none' : 'block';

    document.getElementById('proj-live-url').value = p.liveUrl || p.live_url || '';
    document.getElementById('proj-github-url').value = p.githubUrl || p.github_url || '';
    document.getElementById('proj-apk-url').value = p.apkUrl || p.apk_url || '';
    document.getElementById('proj-play-store-url').value = p.playStoreUrl || p.play_store_url || '';
    document.getElementById('proj-app-store-url').value = p.appStoreUrl || p.app_store_url || '';
    document.getElementById('proj-other-url').value = p.other_url || '';
    document.getElementById('proj-featured').checked = !!(p.featured ?? p.is_featured);
    document.getElementById('proj-published').checked = !!(p.published ?? p.is_published);

    // Current APK status
    const currentApk = p.apk_file || p.apkFile;
    const apkWrap = document.getElementById('proj-apk-current-wrap');
    const apkText = document.getElementById('proj-apk-current-text');
    const apkStatus = document.getElementById('proj-apk-status');
    apkStatus.textContent = '';
    if (currentApk) {
      apkText.innerHTML = `Current APK: <a href="${esc(currentApk)}" download style="color:#10b981;text-decoration:underline;margin-left:4px">${esc(currentApk.split('/').pop())}</a>`;
      apkWrap.style.display = 'block';
      document.getElementById('proj-apk-remove-btn').onclick = async () => {
        if (confirm('Are you sure you want to remove the uploaded APK file?')) {
          try {
            await api('DELETE', `/api/projects/${p.id || p._id}/apk`);
            toast('APK removed successfully.', 'success');
            apkWrap.style.display = 'none';
          } catch (err) { toast(err.message, 'error'); }
        }
      };
    } else {
      apkWrap.style.display = 'none';
    }

    // Set technologies
    const techTagsInput = document.getElementById('tech-input');
    const techTagsContainer = document.getElementById('tech-tags-container');
    let techTags = p.technologies || [];
    window._currentTechTags = [...techTags];

    // Re-render tech tags
    techTagsContainer.querySelectorAll('.tech-tag-item').forEach(t => t.remove());
    techTags.forEach((tag, i) => {
      const el = document.createElement('span');
      el.className = 'tech-tag-item';
      el.innerHTML = `${esc(tag)} <button type="button" class="tech-tag-remove" data-index="${i}" aria-label="Remove">✕</button>`;
      techTagsContainer.insertBefore(el, techTagsInput);
    });
    techTagsContainer.querySelectorAll('.tech-tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        window._currentTechTags.splice(idx, 1);
        btn.closest('.tech-tag-item').remove();
      });
    });

    // Show current image
    const currentImg = p.image || p.main_image;
    if (currentImg) {
      document.getElementById('proj-image-preview').src = currentImg;
      document.getElementById('proj-image-preview-wrap').style.display = 'block';
      document.getElementById('proj-image-status').innerHTML = `<span style="color:var(--text-subtle)">Current image shown. Upload new to replace.</span>`;
    }

    document.getElementById('project-form-wrap').scrollIntoView({ behavior: 'smooth' });
  } catch (err) { toast(err.message, 'error'); }
};

window.deleteProject = async (id, name) => {
  const result = await showModal({
    title: 'Delete Project',
    body: `<p style="color:var(--text-muted)">Are you sure you want to delete "<strong>${esc(name)}</strong>"? All project images will also be deleted. This cannot be undone.</p>`,
    actions: [
      { id: 'cancel', label: 'Cancel', class: 'btn-ghost' },
      { id: 'confirm', label: 'Delete Project', class: 'btn-danger' },
    ],
  });
  if (result === 'confirm') {
    try {
      await api('DELETE', `/api/projects/${id}`);
      toast('Project deleted successfully.', 'success');
      loadSection('projects');
    } catch (err) { toast(err.message, 'error'); }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERIENCE
// ═══════════════════════════════════════════════════════════════════════════════
async function renderExperience(content) {
  const experience = await api('GET', '/api/experience');

  content.innerHTML = `
    <div class="section-header-admin">
      <h1 class="section-title-admin">Experience Manager</h1>
      <button class="btn btn-primary" id="add-exp-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Experience
      </button>
    </div>

    <div class="card" id="exp-form-wrap" style="display:none;margin-bottom:24px">
      <div class="card-header"><div class="card-title" id="exp-form-title">Add Experience</div></div>
      <form id="exp-form">
        <input type="hidden" id="exp-id" />
        <div class="form-group">
          <label class="form-label">Organization / Company <span style="color:var(--accent-light)">*</span></label>
          <input class="form-input" id="exp-org" placeholder="e.g. Nanocodes Programming Limited" required />
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Role / Position</label>
            <input class="form-input" id="exp-role" placeholder="e.g. Mobile Development Trainee" />
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <input class="form-input" id="exp-location" placeholder="e.g. Nsukka, Enugu State, Nigeria" />
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input class="form-input" id="exp-start" placeholder="e.g. Jan 2023 or 2023" />
          </div>
          <div class="form-group">
            <label class="form-label">End Date</label>
            <input class="form-input" id="exp-end" placeholder="e.g. Dec 2023 (leave blank if current)" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-checkbox-wrap">
            <input type="checkbox" id="exp-current" />
            <span class="form-checkbox-label">Current position (still working here)</span>
          </label>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input form-textarea" id="exp-description" rows="4" placeholder="Describe your role and responsibilities..."></textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="exp-save-btn">Save</button>
          <button type="button" class="btn btn-ghost" id="exp-cancel-btn">Cancel</button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Experience Entries (${experience.length})</div></div>
      ${experience.length === 0
        ? `<div class="empty-state"><p>No experience entries yet.</p></div>`
        : `<div class="item-list">
            ${experience.map(exp => `
              <div class="item-row">
                <div class="item-info">
                  <div class="item-name">${esc(exp.organization)}</div>
                  <div class="item-meta">${exp.role ? esc(exp.role) + ' · ' : ''}${exp.location || ''}</div>
                </div>
                <div class="item-badges">
                  ${exp.is_current ? '<span class="badge badge-success">Current</span>' : ''}
                </div>
                <div class="item-actions">
                  <button class="btn btn-ghost btn-xs" onclick="editExp('${exp.id}')">Edit</button>
                  <button class="btn btn-danger btn-xs" onclick="deleteExp('${exp.id}', '${esc(exp.organization)}')">Delete</button>
                </div>
              </div>
            `).join('')}
          </div>`
      }
    </div>
  `;

  document.getElementById('add-exp-btn')?.addEventListener('click', () => {
    document.getElementById('exp-form').reset();
    document.getElementById('exp-id').value = '';
    document.getElementById('exp-form-title').textContent = 'Add Experience';
    document.getElementById('exp-form-wrap').style.display = 'block';
    document.getElementById('exp-org').focus();
  });

  document.getElementById('exp-cancel-btn')?.addEventListener('click', () => {
    document.getElementById('exp-form-wrap').style.display = 'none';
  });

  document.getElementById('exp-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('exp-id').value;
    const btn = document.getElementById('exp-save-btn');
    const org = document.getElementById('exp-org').value.trim();
    if (!org) return toast('Organization is required.', 'error');

    btn.disabled = true;
    btn.textContent = 'Saving...';

    const body = {
      organization: org,
      role: document.getElementById('exp-role').value.trim(),
      location: document.getElementById('exp-location').value.trim(),
      start_date: document.getElementById('exp-start').value.trim(),
      end_date: document.getElementById('exp-end').value.trim(),
      is_current: document.getElementById('exp-current').checked ? 1 : 0,
      description: document.getElementById('exp-description').value.trim(),
    };

    try {
      if (id) {
        await api('PUT', `/api/experience/${id}`, body);
        toast('Experience updated!', 'success');
      } else {
        await api('POST', '/api/experience', body);
        toast('Experience added!', 'success');
      }
      await renderExperience(content);
    } catch (err) { toast(err.message, 'error'); }
    finally {
      btn.disabled = false;
      btn.textContent = 'Save';
    }
  });
}

window.editExp = async (id) => {
  const experience = await api('GET', '/api/experience').catch(() => []);
  const exp = experience.find(e => String(e.id) === String(id));
  if (!exp) return;

  document.getElementById('exp-form-wrap').style.display = 'block';
  document.getElementById('exp-form-title').textContent = 'Edit Experience';
  document.getElementById('exp-id').value = exp.id;
  document.getElementById('exp-org').value = exp.organization || '';
  document.getElementById('exp-role').value = exp.role || '';
  document.getElementById('exp-location').value = exp.location || '';
  document.getElementById('exp-start').value = exp.start_date || '';
  document.getElementById('exp-end').value = exp.end_date || '';
  document.getElementById('exp-current').checked = !!exp.is_current;
  document.getElementById('exp-description').value = exp.description || '';
  document.getElementById('exp-form-wrap').scrollIntoView({ behavior: 'smooth' });
};

window.deleteExp = async (id, org) => {
  const result = await showModal({
    title: 'Delete Experience',
    body: `<p style="color:var(--text-muted)">Delete experience at "<strong>${esc(org)}</strong>"?</p>`,
    actions: [
      { id: 'cancel', label: 'Cancel', class: 'btn-ghost' },
      { id: 'confirm', label: 'Delete', class: 'btn-danger' },
    ],
  });
  if (result === 'confirm') {
    try {
      await api('DELETE', `/api/experience/${id}`);
      toast('Experience deleted.', 'success');
      loadSection('experience');
    } catch (err) { toast(err.message, 'error'); }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════════════════
async function renderServices(content) {
  const services = await api('GET', '/api/services/all');
  const iconOptions = ['smartphone', 'monitor', 'server', 'database', 'code', 'globe', 'settings'];

  content.innerHTML = `
    <div class="section-header-admin">
      <h1 class="section-title-admin">Services Manager</h1>
      <button class="btn btn-primary" id="add-svc-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Service
      </button>
    </div>

    <div class="card" id="svc-form-wrap" style="display:none;margin-bottom:24px">
      <div class="card-header"><div class="card-title" id="svc-form-title">Add Service</div></div>
      <form id="svc-form">
        <input type="hidden" id="svc-id" />
        <div class="form-group">
          <label class="form-label">Service Title <span style="color:var(--accent-light)">*</span></label>
          <input class="form-input" id="svc-title" placeholder="e.g. Mobile App Development" required />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-input form-textarea" id="svc-description" rows="4" placeholder="Describe this service..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Icon</label>
          <select class="form-select" id="svc-icon">
            ${iconOptions.map(i => `<option value="${i}">${i}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-checkbox-wrap">
            <input type="checkbox" id="svc-active" checked />
            <span class="form-checkbox-label">Active (visible on portfolio)</span>
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="svc-save-btn">Save</button>
          <button type="button" class="btn btn-ghost" id="svc-cancel-btn">Cancel</button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Services (${services.length})</div></div>
      ${services.length === 0
        ? `<div class="empty-state"><p>No services added yet.</p></div>`
        : `<div class="item-list">
            ${services.map(s => `
              <div class="item-row">
                <div class="item-info">
                  <div class="item-name">${esc(s.title)}</div>
                  <div class="item-meta">${s.description ? esc(s.description.substring(0, 60)) + '...' : 'No description'}</div>
                </div>
                <div class="item-badges">
                  ${s.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-muted">Hidden</span>'}
                </div>
                <div class="item-actions">
                  <button class="btn btn-ghost btn-xs" onclick="editSvc('${s.id}')">Edit</button>
                  <button class="btn btn-danger btn-xs" onclick="deleteSvc('${s.id}', '${esc(s.title)}')">Delete</button>
                </div>
              </div>
            `).join('')}
          </div>`
      }
    </div>
  `;

  document.getElementById('add-svc-btn')?.addEventListener('click', () => {
    document.getElementById('svc-form').reset();
    document.getElementById('svc-id').value = '';
    document.getElementById('svc-form-title').textContent = 'Add Service';
    document.getElementById('svc-active').checked = true;
    document.getElementById('svc-form-wrap').style.display = 'block';
    document.getElementById('svc-title').focus();
  });

  document.getElementById('svc-cancel-btn')?.addEventListener('click', () => {
    document.getElementById('svc-form-wrap').style.display = 'none';
  });

  document.getElementById('svc-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('svc-id').value;
    const btn = document.getElementById('svc-save-btn');
    const title = document.getElementById('svc-title').value.trim();
    if (!title) return toast('Service title is required.', 'error');

    btn.disabled = true; btn.textContent = 'Saving...';
    const body = {
      title,
      description: document.getElementById('svc-description').value.trim(),
      icon: document.getElementById('svc-icon').value,
      is_active: document.getElementById('svc-active').checked ? 1 : 0,
    };

    try {
      if (id) {
        await api('PUT', `/api/services/${id}`, body);
        toast('Service updated!', 'success');
      } else {
        await api('POST', '/api/services', body);
        toast('Service added!', 'success');
      }
      await renderServices(content);
    } catch (err) { toast(err.message, 'error'); }
    finally { btn.disabled = false; btn.textContent = 'Save'; }
  });
}

window.editSvc = async (id) => {
  const services = await api('GET', '/api/services/all');
  const s = services.find(x => String(x.id) === String(id));
  if (!s) return;

  document.getElementById('svc-form-wrap').style.display = 'block';
  document.getElementById('svc-form-title').textContent = 'Edit Service';
  document.getElementById('svc-id').value = s.id;
  document.getElementById('svc-title').value = s.title || '';
  document.getElementById('svc-description').value = s.description || '';
  document.getElementById('svc-icon').value = s.icon || 'code';
  document.getElementById('svc-active').checked = !!s.is_active;
  document.getElementById('svc-form-wrap').scrollIntoView({ behavior: 'smooth' });
};

window.deleteSvc = async (id, title) => {
  const result = await showModal({
    title: 'Delete Service',
    body: `<p style="color:var(--text-muted)">Delete service "<strong>${esc(title)}</strong>"?</p>`,
    actions: [
      { id: 'cancel', label: 'Cancel', class: 'btn-ghost' },
      { id: 'confirm', label: 'Delete', class: 'btn-danger' },
    ],
  });
  if (result === 'confirm') {
    try {
      await api('DELETE', `/api/services/${id}`);
      toast('Service deleted.', 'success');
      loadSection('services');
    } catch (err) { toast(err.message, 'error'); }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL LINKS
// ═══════════════════════════════════════════════════════════════════════════════
async function renderSocial(content) {
  const links = await api('GET', '/api/social/all');

  content.innerHTML = `
    <div class="section-header-admin">
      <h1 class="section-title-admin">Social Links</h1>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="card-title">Edit Social Links</div>
        <div class="card-subtitle">Leave URL blank to hide a platform.</div>
      </div>
      <form id="social-form">
        ${links.map(link => `
          <div class="form-group" style="border-bottom:1px solid var(--border);padding-bottom:16px;margin-bottom:16px">
            <label class="form-label" style="display:flex;align-items:center;gap:8px">
              <strong>${esc(link.platform)}</strong>
              <label class="form-checkbox-wrap" style="margin:0;padding:4px 10px;flex-direction:row;gap:6px;font-size:0.78rem">
                <input type="checkbox" name="active_${link.id}" ${link.is_active ? 'checked' : ''} />
                <span class="form-checkbox-label" style="font-size:0.78rem">Active</span>
              </label>
            </label>
            <input class="form-input" name="url_${link.id}" value="${esc(link.url || '')}"
              placeholder="${link.platform === 'Email' ? 'your@email.com' : link.platform === 'WhatsApp' ? '+2348012345678' : `https://...`}"
            />
            <p class="form-hint">
              ${link.platform === 'Email' ? 'Enter your email address (without mailto:)' :
                link.platform === 'WhatsApp' ? 'Enter your phone number with country code e.g. +2348012345678' :
                'Full URL including https://'
              }
            </p>
          </div>
        `).join('')}
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="social-save-btn">Save Social Links</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('social-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('social-save-btn');
    btn.disabled = true; btn.textContent = 'Saving...';

    const updatedLinks = links.map(link => ({
      id: link.id,
      url: e.target[`url_${link.id}`].value.trim(),
      is_active: e.target[`active_${link.id}`].checked ? 1 : 0,
    }));

    try {
      await api('PUT', '/api/social/bulk/update', { links: updatedLinks });
      toast('Social links updated successfully!', 'success');
      await renderSocial(content);
    } catch (err) { toast(err.message, 'error'); }
    finally { btn.disabled = false; btn.textContent = 'Save Social Links'; }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT
// ═══════════════════════════════════════════════════════════════════════════════
async function renderContact(content) {
  const contact = await api('GET', '/api/contact');

  content.innerHTML = `
    <div class="section-header-admin">
      <h1 class="section-title-admin">Contact Information</h1>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Edit Contact Details</div></div>
      <form id="contact-form-admin">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input class="form-input" id="contact-email" type="email" value="${esc(contact.email || '')}" placeholder="your@email.com" />
        </div>
        <div class="form-group">
          <label class="form-label">WhatsApp Number</label>
          <input class="form-input" id="contact-whatsapp" value="${esc(contact.whatsapp || '')}" placeholder="+2348012345678" />
          <p class="form-hint">Include country code. This will create a wa.me link.</p>
        </div>
        <div class="form-group">
          <label class="form-label">Location</label>
          <input class="form-input" id="contact-location-input" value="${esc(contact.location || '')}" placeholder="e.g. Nigeria" />
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number (optional)</label>
          <input class="form-input" id="contact-phone" value="${esc(contact.phone || '')}" placeholder="+234..." />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="contact-save-btn">Save Contact Info</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('contact-form-admin')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contact-save-btn');
    btn.disabled = true; btn.textContent = 'Saving...';

    try {
      await api('PUT', '/api/contact', {
        email: document.getElementById('contact-email').value.trim(),
        whatsapp: document.getElementById('contact-whatsapp').value.trim(),
        location: document.getElementById('contact-location-input').value.trim(),
        phone: document.getElementById('contact-phone').value.trim(),
      });
      toast('Contact information updated!', 'success');
      await renderContact(content);
    } catch (err) { toast(err.message, 'error'); }
    finally { btn.disabled = false; btn.textContent = 'Save Contact Info'; }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CV / RESUME
// ═══════════════════════════════════════════════════════════════════════════════
async function renderCV(content) {
  const data = await api('GET', '/api/cv');
  const cv = data.cv;

  content.innerHTML = `
    <div class="section-header-admin">
      <h1 class="section-title-admin">CV / Resume Manager</h1>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Current CV</div></div>

      ${cv ? `
        <div class="cv-current">
          <div class="cv-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          </div>
          <div style="flex:1">
            <div class="cv-name">${esc(cv.original_name || 'CV.pdf')}</div>
            <div class="cv-date">Uploaded: ${new Date(cv.uploaded_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</div>
          </div>
          <div style="display:flex;gap:8px">
            <a href="/api/cv/download" class="btn btn-success btn-sm" target="_blank">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </a>
            <button class="btn btn-danger btn-sm" id="delete-cv-btn">Delete</button>
          </div>
        </div>
        <p class="form-hint" style="margin-bottom:16px">To replace your CV, upload a new one below. The old one will be removed automatically.</p>
      ` : `
        <div class="alert alert-info" style="margin-bottom:16px">No CV uploaded yet. Upload a PDF below.</div>
      `}

      <label class="upload-zone">
        <input type="file" id="cv-input" accept=".pdf" />
        <svg class="upload-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <p class="upload-text">Click to select PDF file</p>
        <p class="upload-hint">PDF only — max 10MB</p>
      </label>
      <div id="cv-status" style="margin-top:10px;font-size:0.875rem;min-height:20px"></div>
      <div style="display:flex;gap:10px;margin-top:12px">
        <button class="btn btn-primary" id="upload-cv-btn" style="display:none">Upload CV</button>
      </div>
    </div>
  `;

  let selectedCV = null;
  document.getElementById('cv-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      document.getElementById('cv-status').innerHTML = '<span style="color:var(--danger)">Only PDF files are allowed.</span>';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      document.getElementById('cv-status').innerHTML = '<span style="color:var(--danger)">File too large. Max 10MB.</span>';
      return;
    }
    selectedCV = file;
    document.getElementById('cv-status').innerHTML = `<span style="color:var(--success)">Selected: ${esc(file.name)}</span>`;
    document.getElementById('upload-cv-btn').style.display = 'inline-flex';
  });

  document.getElementById('upload-cv-btn')?.addEventListener('click', async () => {
    if (!selectedCV) return;
    const btn = document.getElementById('upload-cv-btn');
    btn.disabled = true; btn.textContent = 'Uploading...';

    try {
      const formData = new FormData();
      formData.append('cv', selectedCV);
      await api('POST', '/api/cv', formData, true);
      toast('CV uploaded successfully!', 'success');
      renderCV(content);
    } catch (err) { toast(err.message, 'error'); }
    finally { btn.disabled = false; btn.textContent = 'Upload CV'; }
  });

  document.getElementById('delete-cv-btn')?.addEventListener('click', async () => {
    const result = await showModal({
      title: 'Delete CV',
      body: '<p style="color:var(--text-muted)">Are you sure you want to delete your CV? This cannot be undone.</p>',
      actions: [
        { id: 'cancel', label: 'Cancel', class: 'btn-ghost' },
        { id: 'confirm', label: 'Delete CV', class: 'btn-danger' },
      ],
    });
    if (result === 'confirm') {
      try {
        await api('DELETE', '/api/cv');
        toast('CV deleted.', 'success');
        renderCV(content);
      } catch (err) { toast(err.message, 'error'); }
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════
async function renderMessages(content) {
  const messages = await api('GET', '/api/contact/messages');

  content.innerHTML = `
    <div class="section-header-admin">
      <h1 class="section-title-admin">Contact Messages (${messages.length})</h1>
    </div>

    ${messages.length === 0
      ? `<div class="empty-state">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
           <h3>No messages yet</h3>
           <p>Messages from your contact form will appear here.</p>
         </div>`
      : messages.map(msg => `
          <div class="message-card ${!msg.is_read ? 'unread' : ''}" id="msg-${msg.id}">
            <div class="message-header">
              <div>
                <div class="message-sender">${esc(msg.name)} ${!msg.is_read ? '<span class="badge badge-accent" style="vertical-align:middle">New</span>' : ''}</div>
                <div class="message-email">${esc(msg.email)}</div>
              </div>
              <div class="message-date">${new Date(msg.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
            </div>
            <div class="message-body">${esc(msg.message)}</div>
            <div class="message-actions">
              ${!msg.is_read ? `<button class="btn btn-ghost btn-xs" onclick="markRead('${msg.id}')">Mark as Read</button>` : ''}
              <a href="mailto:${esc(msg.email)}?subject=Re: Your message" class="btn btn-ghost btn-xs">Reply</a>
              <button class="btn btn-danger btn-xs" onclick="deleteMessage('${msg.id}')">Delete</button>
            </div>
          </div>
        `).join('')
    }
  `;
}

window.markRead = async (id) => {
  try {
    await api('PUT', `/api/contact/messages/${id}/read`);
    loadMessageCount();
    const card = document.getElementById(`msg-${id}`);
    if (card) {
      card.classList.remove('unread');
      card.querySelector('.badge.badge-accent')?.remove();
      card.querySelector('[onclick^="markRead"]')?.remove();
    }
  } catch (err) { toast(err.message, 'error'); }
};

window.deleteMessage = async (id) => {
  const result = await showModal({
    title: 'Delete Message',
    body: '<p style="color:var(--text-muted)">Delete this message permanently?</p>',
    actions: [
      { id: 'cancel', label: 'Cancel', class: 'btn-ghost' },
      { id: 'confirm', label: 'Delete', class: 'btn-danger' },
    ],
  });
  if (result === 'confirm') {
    try {
      await api('DELETE', `/api/contact/messages/${id}`);
      toast('Message deleted.', 'success');
      loadMessageCount();
      document.getElementById(`msg-${id}`)?.remove();
    } catch (err) { toast(err.message, 'error'); }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
async function renderSettings(content) {
  const settings = await api('GET', '/api/settings');

  content.innerHTML = `
    <div class="section-header-admin">
      <h1 class="section-title-admin">Site Settings</h1>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Portfolio Settings</div></div>
      <form id="settings-form">
        <div class="form-group">
          <label class="form-label">Portfolio Title (Browser Tab)</label>
          <input class="form-input" id="s-title" value="${esc(settings.portfolio_title || '')}" placeholder="Kenechukwu Asogwa | Mobile & Software Developer" />
        </div>
        <div class="form-group">
          <label class="form-label">Meta Description (SEO)</label>
          <textarea class="form-input form-textarea" id="s-meta" rows="3" placeholder="Professional portfolio description...">${esc(settings.meta_description || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Accent Color</label>
          <div class="color-input-wrap">
            <input type="color" class="color-picker" id="s-color" value="${settings.accent_color || '#6366f1'}" />
            <input class="form-input" id="s-color-text" value="${esc(settings.accent_color || '#6366f1')}" placeholder="#6366f1" style="max-width:160px" />
            <span style="font-size:0.8rem;color:var(--text-subtle)">Portfolio accent color</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Footer Text</label>
          <input class="form-input" id="s-footer" value="${esc(settings.footer_text || '')}" placeholder="© 2024 Kenechukwu Asogwa. All rights reserved." />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="settings-save-btn">Save Settings</button>
        </div>
      </form>
    </div>

    <div class="card" style="margin-top:24px">
      <div class="card-header"><div class="card-title">Change Admin Password</div></div>
      <form id="password-form">
        <div class="form-group">
          <label class="form-label">Current Password</label>
          <input type="password" class="form-input" id="curr-pass" placeholder="••••••••" required autocomplete="current-password" />
        </div>
        <div class="form-group">
          <label class="form-label">New Password</label>
          <input type="password" class="form-input" id="new-pass" placeholder="••••••••" required autocomplete="new-password" />
          <p class="form-hint">Minimum 8 characters.</p>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm New Password</label>
          <input type="password" class="form-input" id="confirm-pass" placeholder="••••••••" required autocomplete="new-password" />
        </div>
        <p id="pass-error" style="color:var(--danger);font-size:0.8rem;min-height:18px;margin-bottom:8px"></p>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="pass-save-btn">Change Password</button>
        </div>
      </form>
    </div>
  `;

  // Color sync
  const colorPicker = document.getElementById('s-color');
  const colorText = document.getElementById('s-color-text');
  colorPicker?.addEventListener('input', () => { colorText.value = colorPicker.value; });
  colorText?.addEventListener('input', () => { if (/^#[0-9A-Fa-f]{6}$/.test(colorText.value)) colorPicker.value = colorText.value; });

  document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('settings-save-btn');
    btn.disabled = true; btn.textContent = 'Saving...';

    try {
      await api('PUT', '/api/settings', {
        portfolio_title: document.getElementById('s-title').value.trim(),
        meta_description: document.getElementById('s-meta').value.trim(),
        accent_color: document.getElementById('s-color-text').value.trim() || '#6366f1',
        footer_text: document.getElementById('s-footer').value.trim(),
      });
      toast('Settings saved!', 'success');
    } catch (err) { toast(err.message, 'error'); }
    finally { btn.disabled = false; btn.textContent = 'Save Settings'; }
  });

  document.getElementById('password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('pass-error');
    const currPass = document.getElementById('curr-pass').value;
    const newPass = document.getElementById('new-pass').value;
    const confirmPass = document.getElementById('confirm-pass').value;

    errEl.textContent = '';

    if (newPass !== confirmPass) { errEl.textContent = 'New passwords do not match.'; return; }
    if (newPass.length < 8) { errEl.textContent = 'New password must be at least 8 characters.'; return; }

    const btn = document.getElementById('pass-save-btn');
    btn.disabled = true; btn.textContent = 'Changing...';

    try {
      await api('POST', '/api/auth/change-password', { currentPassword: currPass, newPassword: newPass });
      toast('Password changed successfully!', 'success');
      document.getElementById('password-form').reset();
    } catch (err) { errEl.textContent = err.message; }
    finally { btn.disabled = false; btn.textContent = 'Change Password'; }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════════
async function init() {
  const token = getToken();

  if (token) {
    // Verify token
    try {
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const { user } = await res.json();
        showDashboard(user);
        return;
      }
    } catch (e) {}
    clearToken();
  }

  // Show login
  document.getElementById('login-page').style.display = 'flex';
  initLogin();

  // Modal close
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
}

document.addEventListener('DOMContentLoaded', init);
