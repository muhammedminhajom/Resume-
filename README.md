# Resume Builder

Full-stack resume builder web app.

## Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, dnd-kit
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **PDF:** Puppeteer (server-side HTML → PDF)
- **DOCX:** docx library (server-side document generation)
- **Auth:** JWT + bcrypt (httpOnly cookies, rate limited)
- **AI (optional):** Gemini / OpenAI bullet suggestions
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint

## Project layout

```
├── client/   # React frontend (Vite)
└── server/   # Express API
```

## Prerequisites

- Node.js 18+
- MongoDB — run locally with `docker compose up -d`, or use MongoDB Atlas

## Setup

### Backend

```bash
cd server
npm install
cp .env.example .env      # set MONGODB_URI, JWT_SECRET, optionally AI keys + SMTP for password reset
npm run dev               # http://localhost:5001
```

### Frontend

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5001`, so no extra
config is needed locally.

## Available scripts

### Client

| Command | Description |
| ------ | ----------- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests (watch) |
| `npm run test:run` | Run tests once |
| `npm run lint` | Lint source files |
| `npm run lint:fix` | Lint and auto-fix |

### Server

| Command | Description |
| ------ | ----------- |
| `npm run dev` | Start dev server with nodemon |
| `npm start` | Start production server |
| `npm run lint` | Lint source files |
| `npm run lint:fix` | Lint and auto-fix |

## API reference

| Method | Endpoint                     | Auth | Description                        |
| ------ | ---------------------------- | ---- | ---------------------------------- |
| POST   | `/api/auth/signup`           | –    | Create account, sets httpOnly cookie |
| POST   | `/api/auth/login`            | –    | Login, sets httpOnly cookie        |
| POST   | `/api/auth/logout`           | Yes  | Clear cookie                       |
| GET    | `/api/auth/me`               | Yes  | Get current user                   |
| POST   | `/api/auth/forgot-password`  | –    | Request password reset email       |
| POST   | `/api/auth/reset-password`   | –    | Reset password with token          |
| GET    | `/api/resumes`               | Yes  | List current user's resumes        |
| POST   | `/api/resumes`               | Yes  | Create a resume                    |
| GET    | `/api/resumes/:id`           | Yes  | Fetch one resume                   |
| PUT    | `/api/resumes/:id`           | Yes  | Update a resume                    |
| DELETE | `/api/resumes/:id`           | Yes  | Delete a resume                    |
| POST   | `/api/resumes/:id/export`    | Yes  | Render HTML → PDF (Puppeteer)      |
| POST   | `/api/resumes/:id/export-docx`| Yes | Render DOCX (docx library)         |
| POST   | `/api/ai/suggest-bullet`     | Yes  | Improve an experience bullet       |

## AI endpoint

`POST /api/ai/suggest-bullet` with `{ jobTitle, bullet }`. It uses
`GEMINI_API_KEY` if set, otherwise `OPENAI_API_KEY`. Returns `{ suggestion }`.
If neither key is configured the endpoint returns `503`.

## Password reset flow

1. User requests reset at `/forgot-password` with email
2. Server generates secure token, stores hash + expiry, emails reset link
3. User clicks link (`/reset-password?token=...`) and sets new password
4. Server validates token, updates password, clears token

## Security notes

- JWT stored in httpOnly, Secure, SameSite=Lax cookies (not localStorage)
- Rate limiting on `/api/auth/*` (20 req/15min) and `/api/*` (100 req/15min)
- All user input sanitized with DOMPurify before storage and render
- Helmet.js headers enabled
- CORS restricted to configured `CLIENT_ORIGIN`

## Deploy

- **Frontend:** Vercel (build `client`, set `VITE_API_URL=/api` and proxy or point to backend)
- **Backend:** Render / Railway (start command `npm start`, env: `MONGODB_URI`, `JWT_SECRET`, `SMTP_*`)
- **Database:** MongoDB Atlas or Supabase-compatible managed Mongo