# 📬 @ziron/email

A modern transactional email package for your Turborepo monorepo. Write beautiful, dynamic emails using **React** and **Tailwind**, preview them locally, and (coming soon) send them via **Nodemailer**. Built for scalability, shared usage, and future-proof delivery workflows.

---

## ✨ Features

- ⚛️ React + Tailwind CSS for clean, maintainable email templates
- 🧪 Local development preview server with live reload
- 🧠 AI-assisted email generation via `new.email(...)` (experimental)
- 📤 Nodemailer-based delivery (planned)
- 🛠 Reusable in any app within a monorepo setup

---

## 📁 Folder Structure

my-project/
├── public/
├── src/
│   ├── components/  # Reusable React components
│   ├── layouts/     # Page layouts
│   └── content/     # MDX files and other content
│       ├── blog/
│       │   ├── my-first-post.mdx
│       │   └── another-article.mdx
│       └── pages/
│           └── about.mdx
├── package.json
├── next.config.js (or similar config for other frameworks)
└── README.md