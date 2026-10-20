# Kenechukwu Asogwa — Developer Portfolio & Admin Management System

A production-ready, full-stack personal developer portfolio website paired with a **Private Admin Dashboard**. Built specifically for **Kenechukwu Asogwa** (Mobile & Software Developer).

All portfolio content is dynamically served from a SQLite database and can be managed directly through forms in the private admin dashboard—**no code editing required**.

---

## 🌟 Key Features

### 1. Public Portfolio (`http://localhost:3000`)
- **Dynamic Content**: Profile, Bio, Skills, Projects, Experience, Services, and Contact channels are loaded dynamically via REST APIs.
- **Project Showcase**: Rich presentation of core projects:
  - **ElliMate**: Roommate finding & off-campus accommodation platform (Flutter, Supabase, Django).
  - **Connecta**: Multi-provider messaging & social connectivity platform (React, Node.js, Socket.IO, Redis).
  - **KC App**: Clean task & note management application (Flutter, Dart, SQLite).
- **Interactive Project Modals**: Live screenshots/mockups, architecture breakdown, key features, and source repository links.
- **Skills Categorization**: Clean categorized display across Mobile Development, Backend & APIs, Web Development, and Database & Tools.
- **Real-Time Contact Form**: Prospective clients and recruiters can send messages directly. Submissions are saved to the database and viewable in the admin dashboard.
- **Responsive & Accessible**: Ultra-sleek dark theme with cyber teal accents, glassmorphic navigation, micro-interactions, and mobile navigation drawer.

### 2. Private Admin Dashboard (`http://localhost:3000/admin`)
- **Secure Authentication**: JWT-based authentication with bcrypt-hashed passwords and brute-force rate limiting.
- **Profile Management**: Update full name, professional title, location, tagline, bio, and upload custom profile pictures.
- **Project Manager**: Add, edit, reorder, publish/unpublish projects, and upload project screenshots.
- **Skills Manager**: Add and categorize skills with visual proficiency level controls.
- **Experience Timeline**: Update training experience (e.g. *Nanocodes Programming Limited, Nsukka, Enugu State, Nigeria*).
- **Services Manager**: Manage offered services (Mobile Development, Web Development, Backend, Database).
- **Contact Channels & Social Links**: Configure active links for GitHub, LinkedIn, Twitter/X, WhatsApp, and email.
- **CV / Resume Manager**: Upload a PDF resume and toggle its visibility or download availability on the live site.
- **Messages Inbox**: View, read, and delete contact inquiries submitted from the public site.
- **Site Settings**: Customize portfolio title, footer copyright, and SEO metadata.

---

## 🚀 Getting Started

### 1. Environment Configuration
The `.env` file is pre-configured in the project root:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@portfolio.local
ADMIN_PASSWORD=PortfolioAdmin2024!
ADMIN_NAME=Kenechukwu Asogwa
BASE_URL=http://localhost:3000
```

### 2. Start the Application
Run the start command from the project root:
```bash
npm start
```
Or with auto-restart on file changes:
```bash
npm run dev
```

The database (`portfolio.db`) will automatically initialize and seed with Kenechukwu's profile, projects, and skills on first run.

---

## 🔐 Admin Credentials

| URL | Default Email | Default Password |
| :--- | :--- | :--- |
| **`http://localhost:3000/admin`** | `admin@portfolio.local` | `PortfolioAdmin2024!` |

*(You can update your email, display name, and password anytime from the dashboard settings.)*

---

## 📁 Architecture Overview

```text
portfolio/
├── portfolio.db             # SQLite database storing all portfolio data
├── public/                  # Frontend assets served by Express
│   ├── index.html           # Public portfolio single-page application
│   ├── css/
│   │   └── portfolio.css    # Modern dark theme & responsive styles
│   ├── js/
│   │   └── portfolio.js     # Public dynamic data loader & interactive UI
│   ├── admin/               # Private Admin Dashboard
│   │   ├── index.html       # Admin SPA interface
│   │   ├── admin.css        # Admin theme & component styling
│   │   └── admin.js         # Admin dashboard logic, CRUD operations & JWT auth
│   └── images/              # Project mockups and assets
├── server/
│   ├── index.js             # Express server entry point & SPA routing
│   ├── database.js          # SQLite schema creation & seed data
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication middleware
│   │   └── upload.js        # Multer file upload & Sharp image processing
│   └── routes/              # REST API endpoints
│       ├── auth.js          # Admin login & credential management
│       ├── profile.js       # Profile & bio updates
│       ├── projects.js      # Projects CRUD & image attachments
│       ├── skills.js        # Skills CRUD
│       ├── experience.js    # Experience timeline CRUD
│       ├── services.js      # Services CRUD
│       ├── contact.js       # Contact info & message inbox
│       ├── social.js        # Social links management
│       ├── cv.js            # CV upload & management
│       └── settings.js      # Site settings
├── uploads/                 # Uploaded profile photos, CVs, and project images
├── package.json             # Dependencies and scripts
└── README.md                # Documentation
```

---

## 📡 REST API Summary

| Endpoint | Method | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/profile` | GET / PUT | Public / Admin | Fetch & update personal profile |
| `/api/projects` | GET / POST | Public / Admin | List published projects / Create project |
| `/api/projects/:id` | PUT / DELETE | Admin | Update / Delete project |
| `/api/skills` | GET / POST | Public / Admin | List skills / Create skill |
| `/api/skills/:id` | PUT / DELETE | Admin | Update / Delete skill |
| `/api/experience` | GET / POST | Public / Admin | Experience timeline management |
| `/api/services` | GET / POST | Public / Admin | List / Update services |
| `/api/contact` | GET / PUT | Public / Admin | Contact details |
| `/api/contact/message` | POST | Public | Submit contact inquiry |
| `/api/contact/messages` | GET / DELETE | Admin | View & manage messages |
| `/api/cv` | GET / POST | Public / Admin | Download CV / Upload new CV PDF |
| `/api/auth/login` | POST | Public | Authenticate admin |
| `/api/settings` | GET / PUT | Public / Admin | Manage site settings |
