import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { TEAMS, FIXTURES, SPONSORS } from '../data';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Build teams map for lookup
const teamsById: Record<string, typeof TEAMS[number]> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t]),
);

// Transform teams: convert roster array to object keyed by player id
const teamsData: Record<string, unknown> = {};
for (const team of TEAMS) {
  const { roster, ...teamWithoutRoster } = team;
  const rosterObj: Record<string, unknown> | undefined = roster
    ? Object.fromEntries(roster.map((p) => [p.id, p]))
    : undefined;
  teamsData[team.id] = {
    ...teamWithoutRoster,
    ...(rosterObj !== undefined && { roster: rosterObj }),
  };
}

// Transform fixtures: replace embedded homeTeam/awayTeam objects with string IDs
// and convert events array to object keyed by event id
const matchesData: Record<string, unknown> = {};
for (const fixture of FIXTURES) {
  const { homeTeam, awayTeam, events, ...rest } = fixture;

  // Ensure the teams exist in our map
  const _ = teamsById[homeTeam.id];
  const __ = teamsById[awayTeam.id];
  void _;
  void __;

  const eventsObj: Record<string, unknown> | undefined = events
    ? Object.fromEntries(events.map((e) => [e.id, e]))
    : undefined;

  matchesData[fixture.id] = {
    ...rest,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    ...(eventsObj !== undefined && { events: eventsObj }),
  };
}

// Transform sponsors to object keyed by id
const sponsorsData: Record<string, unknown> = Object.fromEntries(
  SPONSORS.map((s) => [s.id, s]),
);

const seedData = {
  tournament: {
    meta: {
      name: 'Prabhananda Cup',
      edition: '4th Edition',
      year: 2026,
      tagline: 'Under-16 State Championship',
      matchDay: 'MATCH DAY 04 • LIVE NOW',
      startDate: '2026-05-20',
      endDate: '2026-05-28',
    },
    hero: {
      titleLine1: 'PRABHA',
      titleLine2: 'NANDA',
      badgeText: 'CUP 4TH ED',
      subtitleText: 'Under-16 State Championship',
      backgroundImageUrl: '',
    },
    venue: {
      name: 'Ramakrishna Mission Vidyalaya',
      address: 'Narendrapur, Kolkata, West Bengal 700103',
      mapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.974558237302!2d88.39655187600862!3d22.448777179579737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0271b80c3527df%3A0xe5ed809b02a90101!2sRamakrishna%20Mission%20Vidyalaya%2C%20Narendrapur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
      stadiumLabel: 'MAIN STADIUM',
    },
  },
  teams: teamsData,
  matches: matchesData,
  sponsors: sponsorsData,
};

async function seed() {
  try {
    console.log('Seeding Firebase Realtime Database...');
    await set(ref(db, '/'), seedData);
    console.log('Seed complete! All tournament data written to Firebase.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
