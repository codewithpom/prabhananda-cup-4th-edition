# Prabhananda Cup 4th Edition

Official website for the **Prabhananda Cup 4th Edition** — an annual Under-16 football championship hosted by **Ramakrishna Mission Vidyalaya, Narendrapur**, West Bengal, India.

The site delivers live match scores, real-time updates via Firebase, AI-generated commentary powered by Gemini, and a full admin panel for tournament management — all from a fast, static React SPA.

---

## Features

- **Live Scores** — Real-time scoreboard with automatic updates pushed to every connected client via Firebase Realtime Database
- **Match Timeline** — Per-match event feed (goals, cards, substitutions, commentary) updated live during play
- **Match Statistics** — Possession, shots, and fouls displayed for each match
- **AI Commentary** — Gemini AI generates contextual match commentary on demand
- **Fixtures & Results** — Full fixture list with status badges (Upcoming / Live / Finished) and final scores
- **Match Highlights** — Embedded YouTube highlights for completed matches
- **Team Rosters** — Squad cards with player photos, positions, and bios
- **Sponsor Showcase** — Tiered sponsor display (Title / Platinum / Gold) with links
- **Venue Information** — Stadium details with embedded Google Maps
- **Admin Panel** — Password-protected command center for updating scores, match status, and events in real time
- **Animated UI** — Smooth transitions and entrance animations via Motion (Framer Motion v12)
- **Fully Responsive** — Mobile-first design built with Tailwind CSS 4

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Animation | Motion (Framer Motion v12) |
| Database | Firebase Realtime Database |
| Auth | Firebase Authentication (Email/Password) |
| AI | Google Gemini via `@google/genai` |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Running Without Firebase (Demo Mode)

You do **not** need a Firebase account to preview the app. Without any environment variables set, the site loads instantly with built-in dummy data — all teams, fixtures, match events, sponsors, and venue info are pre-populated from `src/data.ts`.

```bash
git clone https://github.com/<your-org>/prabhananda-cup-4th-edition.git
cd prabhananda-cup-4th-edition
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The full UI will render with sample data. The admin panel login will not work in demo mode (Firebase Auth is required for writes).

> When Firebase **is** configured, the app switches automatically to live data from the database. No code changes needed — just add the `.env.local` file described below.

---

## Connecting to Firebase

### Step 1 — Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and click **Add project**.
2. Give it a name (e.g. `prabhananda-cup`) and follow the prompts. You can disable Google Analytics.

### Step 2 — Enable Realtime Database

1. In the left sidebar go to **Build > Realtime Database** and click **Create Database**.
2. Choose a region — **asia-south1 (Mumbai)** is recommended for India.
3. Start in **locked mode** (you will update the rules in Step 5).

### Step 3 — Enable Authentication

1. In the left sidebar go to **Build > Authentication > Sign-in method**.
2. Click **Email/Password** and toggle it **Enabled**. Save.
3. Go to the **Users** tab and click **Add user**. Enter the email and password you want to use for the admin panel. Save these credentials — you'll need them to log in.

### Step 4 — Get your Web App config

1. In the left sidebar click the gear icon → **Project Settings**.
2. Scroll down to **Your apps** and click **Add app > Web** (the `</>` icon).
3. Register the app (any nickname is fine). You do **not** need Firebase Hosting.
4. Copy the `firebaseConfig` object that appears. It will look like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123..."
};
```

### Step 5 — Set database security rules

1. In the left sidebar go to **Build > Realtime Database > Rules**.
2. Replace the contents with:

```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null"
  }
}
```

3. Click **Publish**. This allows anyone to read tournament data while restricting all writes to the authenticated admin user.

### Step 6 — Create `.env.local`

In the project root, copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123...
VITE_GEMINI_API_KEY=AIzaSy...
```

> Get your Gemini API key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey). It is optional — AI commentary will be disabled if not provided.

### Step 7 — Seed the database

Run the seed script **once** to push the initial teams, fixtures, and sponsors into Firebase:

```bash
npm run seed
```

> **Important:** Only run this once against a fresh database. Re-running will overwrite any live data you have edited through the admin panel.

### Step 8 — Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app will now load data from Firebase in real time. To verify it is working, click the gear icon in the footer, log in with the admin credentials from Step 3, and update a match score — you should see it change live in another browser tab.

---

## Vercel Deployment

**1. Push to GitHub**

Ensure your code is pushed to a GitHub repository.

**2. Connect the repo on Vercel**

- Go to [vercel.com](https://vercel.com), click **Add New > Project**, and import your GitHub repository.
- Vercel will auto-detect the Vite framework. No build settings need to be changed.

**3. Add environment variables**

In your Vercel project, go to **Settings > Environment Variables** and add all eight `VITE_*` variables listed in the [Environment Variables](#environment-variables) section. Set them for the **Production**, **Preview**, and **Development** environments.

**4. Deploy**

Click **Deploy**. Subsequent pushes to `main` will trigger automatic production deployments. Pull requests will generate preview deployments.

---

## GitHub Actions CI/CD

The workflow at `.github/workflows/deploy.yml` automatically type-checks, builds, and deploys the project on every push to `main` and every pull request targeting `main`.

Add the following secrets to your GitHub repository under **Settings > Secrets and variables > Actions**:

| Secret | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_DATABASE_URL` | Firebase Realtime Database URL |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_GEMINI_API_KEY` | Google Gemini API key |
| `VERCEL_TOKEN` | Vercel personal access token (from vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Your Vercel team/org ID (from `.vercel/project.json` after running `vercel link`) |
| `VERCEL_PROJECT_ID` | Your Vercel project ID (from `.vercel/project.json`) |

To obtain `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`, run `npx vercel link` locally in the project directory once. The values are written to `.vercel/project.json`.

---

## Admin Panel

The admin panel (Command Center) allows authorized users to manage the tournament in real time.

**Accessing the panel:**

1. Open the live site in a browser.
2. Scroll to the footer and click the small **gear icon** in the bottom-right area of the footer.
3. Enter the credentials for the Firebase Auth admin user you created during Step 3 of the Firebase setup.

**What you can do:**

- Change match status (Upcoming / Live / Finished)
- Update home and away scores
- Add match events (goals, cards, substitutions, commentary)
- Manage teams, sponsors, and tournament metadata (if those tabs are implemented)

All changes write directly to Firebase and are broadcast in real time to every visitor currently on the site.

---

## Environment Variables

Create a `.env.local` file at the project root with the following keys:

| Variable | Description | Example |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_DATABASE_URL` | Realtime Database URL | `https://your-project-default-rtdb.firebaseio.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `your-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging sender ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:123456789012:web:abc...` |
| `VITE_GEMINI_API_KEY` | Google AI Studio API key | `AIzaSy...` |

All variables are prefixed with `VITE_` so Vite injects them into the client bundle at build time. Never commit `.env.local` to source control.

---

## License

All rights reserved. Hosted by Ramakrishna Mission Vidyalaya, Narendrapur. &copy; 2026.
