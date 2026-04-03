# PhishGuard Prototype

Desktop-first, browser-based prototype for a phishing-awareness and email-analysis SaaS.

## Run locally

Because this prototype is static HTML/CSS/JS, you can run with any local web server:

```bash
python3 -m http.server 4173
```

Then open: `http://localhost:4173`

## What's mocked

- Demo authentication (login/register/forgot password/optional 2FA)
- Role switching between Employee, Organization Manager, and Site Administrator
- Email/phishing analysis scoring and findings (rule-based mock, no AI integration)
- Uploaded file handling is ephemeral and not persisted
- Learning modules, quizzes, progress/certificate state
- Organization tools (employees, groups, assignments, simulations, alerts)
- Admin tools (dashboard, module publishing/management, support inbox)
- Persistent contact support drawer

## Main prototype flow

1. Visit `/` and log in as demo user
2. Navigate to **Analyze Email** (`/app/analyze`)
3. Paste email text or load a sample/upload file
4. Click **Analyze Message**
5. Review risk score, indicators, explanation, next actions, and related learning modules
