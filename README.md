| :--- | :--- |
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
