/**
 * Kenechukwu Asogwa - Portfolio Website Logic
 * Clean, lightweight Vanilla JavaScript
 */

// Project Data Store with exact specified features and technologies
const PROJECTS_DATA = {
  ellimate: {
    title: 'ElliMate',
    type: 'Mobile Application',
    tagline: 'Live together. Communicate better.',
    image: '/images/ellimate.jpg',
    github: 'https://github.com/your-username/ellimate',
    description:
      'ElliMate is a mobile application designed to help roommates and apartment members communicate, coordinate shared responsibilities, manage apartment updates, organize laundry bookings, and stay connected in one place.',
    technologies: ['Flutter', 'Dart', 'Supabase', 'PostgreSQL'],
    features: [
      'User authentication',
      'Apartment creation and joining',
      'Invite codes',
      'Apartment member management',
      'Real-time chat',
      'Apartment updates',
      'Laundry booking',
      'Notifications',
      'Profile management',
      'Secure database access with Row Level Security'
    ]
  },
  connecta: {
    title: 'Connecta',
    type: 'Web Application & API',
    tagline: 'Student communication and interaction network',
    image: '/images/connecta.jpg',
    github: 'https://github.com/your-username/connecta',
    description:
      'Connecta is a social networking web application designed around student communication and interaction, emphasizing structured backend API architecture and real-time connectivity.',
    technologies: [
      'Django',
      'Django REST Framework',
      'PostgreSQL',
      'Redis',
      'WebSockets',
      'HTML',
      'CSS',
      'JavaScript'
    ],
    features: [
      'User authentication',
      'Social networking features',
      'Profiles',
      'Messaging/communication',
      'Responsive interface',
      'Backend API architecture',
      'PostgreSQL database',
      'Real-time communication architecture'
    ]
  },
  'kc-app': {
    title: 'KC App',
    type: 'Mobile Application',
    tagline: 'Task and note management application',
    image: '/images/kc-app.jpg',
    github: 'https://github.com/your-username/kc-app',
    description:
      'KC App is a task and note management application designed to help users organize tasks and personal notes in a simple, responsive interface with persistent local data storage.',
    technologies: ['Flutter', 'Dart', 'SharedPreferences'],
    features: [
      'Task management',
      'Notes',
      'Editing and deleting',
      'Persistent local storage',
      'Theme customization',
      'Responsive mobile interface'
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initActiveNavObserver();
  initProjectModal();
  initContactForm();
  initCopyEmail();
  initCurrentYear();
});

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (!toggleBtn || !mobileNav) return;

  function toggleMenu() {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    toggleBtn.classList.toggle('active', !isExpanded);
    mobileNav.classList.toggle('open', !isExpanded);
    mobileNav.setAttribute('aria-hidden', String(isExpanded));
  }

  function closeMenu() {
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.classList.remove('active');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
  }

  toggleBtn.addEventListener('click', toggleMenu);

  // Close when clicking mobile nav links
  const mobileLinks = mobileNav.querySelectorAll('a');
  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      mobileNav.classList.contains('open') &&
      !mobileNav.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
      closeMenu();
    }
  });
}

/**
 * Active Navigation Indicator on Scroll
 */
function initActiveNavObserver() {
  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!sections.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -65% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        updateActiveLink(id);
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));

  function updateActiveLink(activeId) {
    desktopLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${activeId}`);
    });
    mobileLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${activeId}`);
    });
  }
}

/**
 * Project Details Modal Dialog
 */
function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const footerCloseBtn = document.getElementById('modal-close-footer-btn');
  const detailButtons = document.querySelectorAll('.project-details-btn');

  if (!modal) return;

  const modalImg = document.getElementById('modal-project-img');
  const modalType = document.getElementById('modal-project-type');
  const modalTitle = document.getElementById('modal-project-title');
  const modalTagline = document.getElementById('modal-project-tagline');
  const modalDesc = document.getElementById('modal-project-desc');
  const modalTech = document.getElementById('modal-project-tech');
  const modalFeatures = document.getElementById('modal-project-features');
  const modalGithub = document.getElementById('modal-project-github');

  let lastActiveElement = null;

  function openModal(projectId) {
    const project = PROJECTS_DATA[projectId];
    if (!project) return;

    lastActiveElement = document.activeElement;

    // Populate data
    modalImg.src = project.image;
    modalImg.alt = `${project.title} detailed screenshot preview`;
    modalType.textContent = project.type;
    modalTitle.textContent = project.title;
    modalTagline.textContent = project.tagline;
    modalDesc.textContent = project.description;
    modalGithub.href = project.github;

    // Badges
    modalTech.innerHTML = '';
    project.technologies.forEach((tech) => {
      const badge = document.createElement('span');
      badge.className = 'tech-badge';
      badge.textContent = tech;
      modalTech.appendChild(badge);
    });

    // Features
    modalFeatures.innerHTML = '';
    project.features.forEach((feature) => {
      const li = document.createElement('li');
      li.textContent = feature;
      modalFeatures.appendChild(li);
    });

    // Show modal
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastActiveElement) {
      lastActiveElement.focus();
    }
  }

  detailButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = btn.getAttribute('data-project');
      openModal(projectId);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (footerCloseBtn) footerCloseBtn.addEventListener('click', closeModal);

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/**
 * Contact Form Validation & Friendly Submission Handling
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function clearErrors() {
    nameInput.classList.remove('invalid');
    emailInput.classList.remove('invalid');
    messageInput.classList.remove('invalid');
    if (nameError) nameError.classList.remove('visible');
    if (emailError) emailError.classList.remove('visible');
    if (messageError) messageError.classList.remove('visible');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    let isValid = true;
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const messageVal = messageInput.value.trim();

    if (!nameVal) {
      nameInput.classList.add('invalid');
      if (nameError) nameError.classList.add('visible');
      isValid = false;
    }

    if (!emailVal || !validateEmail(emailVal)) {
      emailInput.classList.add('invalid');
      if (emailError) emailError.classList.add('visible');
      isValid = false;
    }

    if (!messageVal || messageVal.length < 10) {
      messageInput.classList.add('invalid');
      if (messageError) messageError.classList.add('visible');
      isValid = false;
    }

    if (!isValid) return;

    // Simulation feedback
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Sending...</span>`;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.reset();
      showToast(
        'Thank you! Your message was received. (This form is ready to connect with your email backend!)',
        'success'
      );
    }, 800);
  });
}

/**
 * Copy Email to Clipboard helper
 */
function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  const emailLink = document.getElementById('email-link');

  if (!copyBtn || !emailLink) return;

  copyBtn.addEventListener('click', async () => {
    const email = emailLink.textContent.trim();
    try {
      await navigator.clipboard.writeText(email);
      showToast(`Copied "${email}" to clipboard!`, 'info');
    } catch {
      showToast(`Email: ${email}`, 'info');
    }
  });
}

/**
 * Toast Notification System
 */
let toastTimeout;
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const messageEl = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');

  if (!toast || !messageEl) return;

  clearTimeout(toastTimeout);

  messageEl.textContent = message;

  if (iconEl) {
    iconEl.textContent = type === 'success' ? '✓' : 'ℹ';
  }

  toast.classList.add('show');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

/**
 * Auto-update current copyright year
 */
function initCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
