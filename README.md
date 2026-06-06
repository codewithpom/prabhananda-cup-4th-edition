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

## Local Development

### Prerequisites

- Node.js 20 or later
- A Firebase project (see setup below)
- A Google AI Studio API key for Gemini

### Setup

**1. Clone the repository**

```bash
git clone https://github.com/<your-org>/prabhananda-cup-4th-edition.git
cd prabhananda-cup-4th-edition
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and set all values (see the [Environment Variables](#environment-variables) section below).

**4. Firebase project setup**

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project (or use an existing one).
2. Navigate to **Build > Realtime Database** and create a database. Choose a region close to your users. Start in **locked mode** — you will add rules in the next step.
3. Navigate to **Build > Authentication > Sign-in method** and enable the **Email/Password** provider.
4. Navigate to **Authentication > Users** and manually create an admin user with your chosen email and a strong password. This account is used to authenticate the admin panel.
5. Navigate to **Project Settings > General > Your apps**, click **Add app > Web**, register the app, and copy the `firebaseConfig` values into your `.env.local`.

Paste the following security rules into **Realtime Database > Rules**:

```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null"
  }
}
```

These rules allow any visitor to read tournament data while restricting all writes to authenticated admin users.

**5. Seed the database**

Run the seed script once to populate Firebase with the initial teams, fixtures, and sponsors:

```bash
npm run seed
```

> **Important:** Only run this once. Re-running will overwrite existing data.

**6. Start the development server**

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

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
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
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
3. Enter the credentials for the Firebase Auth admin user you created during setup.

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
