# Campus Notification System

A full-stack campus notification application that fetches, prioritises, and displays real-time notifications (Placements, Results, Events) from a live evaluation API.

---

## Project Structure

```
RA2311026010526/
├── logging_middleware/          # Reusable custom logger (no console.log)
├── notification_app_be/         # Node.js backend — priority inbox CLI
├── notification_app_fe/         # Next.js 16 frontend — notification dashboard
├── notification_system_design.md
└── .gitignore
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Material UI v6 |
| Backend | Node.js, Axios |
| Logger | Custom file + stdout logger (zero `console.log`) |
| Styling | MUI Light Theme, Inter font |

---

## Features

- **Priority Inbox** — ranks notifications by type weight (Placement > Result > Event) + normalised recency score
- **All Notifications** — sorted newest-first by timestamp
- **Filter Page** — filter by type, keyword search, unread-only toggle
- **Custom Logger** — structured `[TIMESTAMP] [LEVEL] message | meta` format, writes to both stdout and a log file
- **Expandable Cards** — click any notification to see full details, ID, and priority score
- **Read / Unread tracking** — in-memory, persists across tab navigation
---

### 1 · Logging Middleware

```bash
cd logging_middleware
node -e "const l = require('./logger'); l.info('Logger OK')"
```

---

### 2 · Backend — Priority Inbox

```bash
cd notification_app_be
npm install

# Copy env template and add your token
cp .env.example .env.local
# Edit .env.local → set NOTIFY_TOKEN=your_client_secret

# Run
NOTIFY_TOKEN=your_token node priorityInbox.js
# or on Windows:
$env:NOTIFY_TOKEN="your_token"; node priorityInbox.js
```

### 3 · Frontend — Notification Dashboard

```bash
cd notification_app_fe
npm install

# Copy env template and add your token
cp .env.example .env.local
# Edit .env.local → set NOTIFY_TOKEN=your_client_secret

# Start dev server
npm run dev
```

Open **http://localhost:3000**

---

## Priority Algorithm

```
priority = TYPE_WEIGHT[type] + normalised_recency

TYPE_WEIGHT:
  Placement → 300
  Result    → 200
  Event     → 100

normalised_recency = ((epoch - min_epoch) / (max_epoch - min_epoch)) * 99
```

This ensures type is always the primary sort key, with recency as a secondary tiebreaker within the same type band. See `notification_system_design.md` for full design documentation.

---
