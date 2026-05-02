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

## Setup & Running

### Prerequisites
- Node.js ≥ 18
- npm

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

**Sample output:**
```
========================================================================================
  TOP 10 PRIORITY NOTIFICATIONS
========================================================================================
  Rank  | Type      | Priority | Timestamp           | Message
----------------------------------------------------------------------------------------
  #01   | Placement | 399.00   | 2026-04-22 17:51:18 | Campus placement drive for TCS...
  #02   | Result    | 299.12   | 2026-04-22 17:51:30 | Semester results published...
```

---

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

## Environment Variables

Copy `.env.example` to `.env.local` in each folder and fill in:

```env
EMAIL=your_university_email@example.edu
NAME=Your Full Name
ROLL_NO=RA0000000000000
ACCESS_CODE=your_access_code

CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret

# Used as Bearer token for the notification API
NOTIFY_TOKEN=your_client_secret
```

> **Note:** `.env.local` is git-ignored and will never be committed.

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

## Logging Format

All logs follow a structured format — no `console.log` is used anywhere:

```
[2026-05-02T06:30:01.123Z] [INFO]  Proxying notification request | {"url":"...","limit":"100"}
[2026-05-02T06:30:01.891Z] [INFO]  Notifications proxied successfully | {"count":25,"status":200}
[2026-05-02T06:30:02.012Z] [ERROR] Upstream API error | {"status":401,"body":"..."}
```

Sample logs are available in:
- `notification_app_fe/app.log`
- `notification_app_be/notifications.log`
