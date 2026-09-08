# Resume Builder

Full-stack resume builder web app.

## Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, dnd-kit
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **PDF:** Puppeteer (server-side HTML → PDF)
- **DOCX:** docx library (server-side document generation)
- **Auth:** JWT + bcrypt + Google OAuth 2.0 (`google-auth-library`, httpOnly cookies, rate limited)
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
- MongoDB — local MongoDB instance, MongoDB Atlas connection string, or `docker compose up -d` (requires Docker Desktop installed and running).

## Setup

Docker is **not required** for local development. You can run the backend and frontend directly via npm:

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

*Note on Docker:* If you want to use Docker Compose later for MongoDB or containerized services, ensure Docker Desktop is installed and running, then run `docker compose up -d`.

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

| Method | Endpoint                      | Auth | Description                                         |
| ------ | ----------------------------- | ---- | --------------------------------------------------- |
| POST   | `/api/auth/signup`            | –    | Create account, returns token & sets httpOnly cookie|
| POST   | `/api/auth/login`             | –    | Login, returns token & sets httpOnly cookie         |
| POST   | `/api/auth/logout`            | Yes  | Clear cookie & session                              |
| GET    | `/api/auth/me`                | Yes  | Get current authenticated user                      |
| POST   | `/api/auth/forgot-password`   | –    | Request password reset email                        |
| POST   | `/api/auth/reset-password`    | –    | Reset password with token                           |
| GET    | `/api/auth/google`            | –    | Initiate Google OAuth 2.0 redirect flow             |
| GET    | `/api/auth/google/callback`   | –    | Handle OAuth callback, link/create user, issue JWT  |
| GET    | `/api/resumes`                | Yes  | List current user's resumes                         |
| POST   | `/api/resumes`                | Yes  | Create a resume                                     |
| GET    | `/api/resumes/:id`            | Yes  | Fetch one resume                                    |
| PUT    | `/api/resumes/:id`            | Yes  | Update a resume                                     |
| DELETE | `/api/resumes/:id`            | Yes  | Delete a resume                                     |
| POST   | `/api/resumes/:id/export`     | Yes  | Render ATS HTML → PDF (Puppeteer)                   |
| POST   | `/api/resumes/:id/export-docx`| Yes  | Render ATS DOCX (docx library)                      |
| POST   | `/api/resumes/:id/ats-score`  | Yes  | Rule-based ATS score & Job Description keyword match|
| POST   | `/api/ai/suggest-bullet`      | Yes  | Improve an experience bullet                        |

## AI endpoint

`POST /api/ai/suggest-bullet` with `{ jobTitle, bullet }`. It uses
`GEMINI_API_KEY` if set, otherwise `OPENAI_API_KEY`. Returns `{ suggestion }`.
If neither key is configured the endpoint returns `503`.

## Password reset flow

1. User requests reset at `/forgot-password` with email
2. Server generates secure token, stores hash + expiry, emails reset link
3. User clicks link (`/reset-password?token=...`) and sets new password
4. Server validates token, updates password, clears token

## Google OAuth 2.0 Setup

The application uses Google OAuth 2.0 with [`google-auth-library`](https://github.com/googleapis/google-auth-library-nodejs) (Google's official client library) for secure, stateless verification and account linking without requiring express session serialization or Passport middleware.

### 1. Create OAuth 2.0 Credentials in Google Cloud Console

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - Select User Type (e.g. **External**) and click **Create**.
   - Fill in App Name (e.g. `Resume Builder`), User support email, and Developer contact information.
   - Under **Scopes**, add `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and `openid`.
   - Save and continue.
4. Navigate to **APIs & Services** > **Credentials**:
   - Click **+ Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Resume Builder Web Client`.
   - **Authorized JavaScript origins**:
     - Local dev: `http://localhost:5173`
     - Production: `https://yourdomain.com`
   - **Authorized redirect URIs**:
     - Local dev: `http://localhost:5001/api/auth/google/callback`
     - Production: `https://api.yourdomain.com/api/auth/google/callback` (or your full production backend callback URL)
   - Click **Create** and copy your **Client ID** and **Client Secret**.

### 2. Configure Environment Variables

Add the credentials to `server/.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

### 3. Authentication & Account Linking Behavior

- **Additive & Non-destructive:** Existing email/password accounts remain intact.
- **Auto-linking:** If a user logs in with Google and an existing account with the same email already exists, Google login is linked to that account without altering the existing password.
- **New Users:** If no account exists for the Google email, a new account is provisioned with `google_id` and marked as Google-linked (no password required).
- **Error Handling:** If the user cancels the Google prompt or Google rejects authentication, the backend safely redirects to `/login?error=...` with an inline alert rendered to the user.

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

## Google AdSense Integration & Policy Compliance

This application is pre-configured for Google AdSense monetization in strict compliance with Google Publisher Policies and GDPR privacy requirements.

### 1. After Account Approval: Setup Steps

1. **Update `ads.txt`**:
   Open `client/public/ads.txt` and replace `pub-XXXXXXXXXXXXXXXX` with your real Publisher ID:
   ```text
   google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
   ```
   *Note: Ensure your domain serves this file at root (e.g. `https://yourdomain.com/ads.txt`).*

2. **Configure Client ID in `.env`**:
   In `client/.env` (or your production hosting environment variables):
   ```env
   VITE_ADSENSE_CLIENT_ID=ca-pub-1234567890123456
   ```
   Vite injects this value into the `<script async src="https://pagead2.googlesyndication.com/..."></script>` tag in `index.html` at build time.

3. **Configure Ad Unit Slot IDs**:
   Create ad units in your Google AdSense dashboard (Display ads &bull; Responsive) and update the `slotId` props in the respective pages:
   - `client/src/components/Layout.jsx`: Desktop sidebar ad slot (`slotId="1000000001"`)
   - `client/src/pages/DashboardPage.jsx`: Dashboard bottom ad slot (`slotId="1000000002"`)
   - `client/src/pages/AtsCheckerPage.jsx`: ATS Checker results bottom ad slot (`slotId="1000000003"`)
   - `client/src/pages/JobMatchPage.jsx`: Job Match results bottom ad slot (`slotId="1000000004"`)

### 2. Ad-Free Document Integrity Guarantee

- **Strict Ad-Free Zones:** In accordance with professional document standards, ads are **never** placed inside the resume builder editing interface, live resume preview canvas, template switchers, or download/export dialogs.
- **Print & PDF Safety:** All `<AdSlot />` elements have the `.no-print` class and fail gracefully without altering layout or printable margins.

### 3. Google AdSense Site Approval Checklist

Before applying for site review in the Google AdSense dashboard:
- [x] **Public Domain:** App must be deployed to a live, publicly accessible custom domain with valid SSL/HTTPS (Google rejects `localhost` and raw IP addresses).
- [x] **Crawlability:** `client/public/robots.txt` explicitly allows `Mediapartners-Google` and search engine indexing.
- [x] **Mandatory Legal Pages:** Accessible `/privacy-policy` and `/terms-of-service` pages linked in the site footer with substantive disclosures regarding Google AdSense cookies and DoubleClick DART technology.
- [x] **Cookie Consent:** Interactive cookie consent banner active for GDPR and ePrivacy compliance.
- [x] **Original Content:** Original, rich resume builder tools, ATS scoring heuristics, and job match analysis to prevent "Thin Content" rejections.