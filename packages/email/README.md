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

**Note:** To generate email templates use [new.email](https://new.email/)

---

## 📁 Folder Structure

```bash
@ziron/email/
├── src/
│ ├── index.ts # Email utils (exported to consumers)
│ └── templates/ # React Email templates
│     └── verification-email.tsx
├── package.json
├── tsconfig.json
└── README.md
```

---
### 1. Run the preview server
To preview all templates in the browser:

```bash
pnpm dev:email
```
By default, the server runs on http://localhost:3333.

### 2. Example Template
```tsx
// src/templates/WelcomeEmail.tsx
import {
  Html,
  Tailwind,
  Body,
  Container,
  Heading,
  Text,
} from "@react-email/components";

const WelcomeEmail = () => (
  <Html lang="en">
    <Tailwind>
      <Body className="bg-gray-100 py-10 font-sans">
        <Container className="bg-white shadow rounded-lg p-8 max-w-xl mx-auto">
          <Heading className="text-2xl font-bold mb-4">Welcome to Ziron 👋</Heading>
          <Text className="text-gray-800 text-base">
            Thank you for joining our community. We’re excited to have you onboard!
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default WelcomeEmail;
```
Save the file in src/templates and it will automatically show up in the dev preview UI.

---

## 📤 Sending Emails (Coming Soon)
You'll be able to send emails using Nodemailer once integrated:

```ts
import { sendEmail } from "@ziron/email";
import VerificationEmail from "./templates/VerificationEmail";

await sendEmail({
  to: "user@example.com",
  subject: "Verify your account",
  react: <VerificationEmail verificationUrl="https://example.com/verify?token=abc123" />,
});
```
SMTP configuration will be pulled from environment variables.

| Script      | Description                                         |
| ----------- | --------------------------------------------------- |
| `dev:email` | Launches the React Email preview server (port 3333) |
| `export`    | Exports email templates to static HTML files        |
| `clean`     | Cleans build cache, `node_modules`, etc.            |
| `format`    | Formats files using [Biome](https://biomejs.dev)    |

Run any of these using:
```bash
pnpm dev:email
```
---

## 🌐 SMTP Configuration (for future delivery)

Once Nodemailer is added, configure via:

```ini
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-password
EMAIL_FROM=no-reply@yourdomain.com
```

Add these in your monorepo's .env file.

