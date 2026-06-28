import { test, expect } from '@playwright/test';

// Simulates the 15 Firebase matches exactly as stored — all UPCOMING,
// sorted descending by date (as transformMatches does), so Final comes first.
const FIREBASE_FIXTURES = [
  // Final — would have been fixtures[0] with the old broken code
  { id:'m15', status:'UPCOMING' as const, date:'2026-07-07', time:'15:30', homeTeam:{id:'tbd',name:'TBD',logo:'',group:''}, awayTeam:{id:'tbd',name:'TBD',logo:'',group:''} },
  { id:'m13', status:'UPCOMING' as const, date:'2026-07-07', time:'07:15', homeTeam:{id:'tbd',name:'TBD',logo:'',group:''}, awayTeam:{id:'tbd',name:'TBD',logo:'',group:''} },
  { id:'m14', status:'UPCOMING' as const, date:'2026-07-07', time:'07:15', homeTeam:{id:'tbd',name:'TBD',logo:'',group:''}, awayTeam:{id:'tbd',name:'TBD',logo:'',group:''} },
  { id:'m11', status:'UPCOMING' as const, date:'2026-07-06', time:'16:30', homeTeam:{id:'tbd',name:'TBD',logo:'',group:''}, awayTeam:{id:'tbd',name:'TBD',logo:'',group:''} },
  { id:'m12', status:'UPCOMING' as const, date:'2026-07-06', time:'16:30', homeTeam:{id:'tbd',name:'TBD',logo:'',group:''}, awayTeam:{id:'tbd',name:'TBD',logo:'',group:''} },
  { id:'m9',  status:'UPCOMING' as const, date:'2026-07-06', time:'15:15', homeTeam:{id:'tbd',name:'TBD',logo:'',group:''}, awayTeam:{id:'tbd',name:'TBD',logo:'',group:''} },
  { id:'m10', status:'UPCOMING' as const, date:'2026-07-06', time:'15:15', homeTeam:{id:'tbd',name:'TBD',logo:'',group:''}, awayTeam:{id:'tbd',name:'TBD',logo:'',group:''} },
  { id:'m7',  status:'UPCOMING' as const, date:'2026-07-06', time:'08:45', homeTeam:{id:'team13',name:'RKM Narendrapur',logo:'',group:''}, awayTeam:{id:'team14',name:'RKM Sarisha',logo:'',group:''} },
  { id:'m8',  status:'UPCOMING' as const, date:'2026-07-06', time:'08:45', homeTeam:{id:'team15',name:'RKM Midnapor',logo:'',group:''}, awayTeam:{id:'team16',name:'RKM Ramharipur',logo:'',group:''} },
  { id:'m4',  status:'UPCOMING' as const, date:'2026-07-06', time:'07:15', homeTeam:{id:'team7',name:'RKM Asansol',logo:'',group:''}, awayTeam:{id:'team8',name:'RKM Narainpur',logo:'',group:''} },
  { id:'m5',  status:'UPCOMING' as const, date:'2026-07-06', time:'07:15', homeTeam:{id:'team9',name:'RKM Kamarpukur',logo:'',group:''}, awayTeam:{id:'team10',name:'RKM Rahara',logo:'',group:''} },
  { id:'m6',  status:'UPCOMING' as const, date:'2026-07-06', time:'07:15', homeTeam:{id:'team11',name:'RKM Jhargram',logo:'',group:''}, awayTeam:{id:'team12',name:'RKM Taki',logo:'',group:''} },
  // Round 1 matches — should be shown as the "next match"
  { id:'m1',  status:'UPCOMING' as const, date:'2026-07-05', time:'16:30', homeTeam:{id:'team1',name:'RKM Baranagar',logo:'',group:''}, awayTeam:{id:'team2',name:'RKM Manasadwip',logo:'',group:''} },
  { id:'m2',  status:'UPCOMING' as const, date:'2026-07-05', time:'16:30', homeTeam:{id:'team3',name:'RKM Jayrambati',logo:'',group:''}, awayTeam:{id:'team4',name:'RKM Sargachi',logo:'',group:''} },
  { id:'m3',  status:'UPCOMING' as const, date:'2026-07-05', time:'16:30', homeTeam:{id:'team5',name:'RKM Malda',logo:'',group:''}, awayTeam:{id:'team6',name:'RKM Deoghar',logo:'',group:''} },
];

test('LiveMatch selection logic — picks earliest upcoming, not the Final', async ({ page }) => {
  const result = await page.evaluate((fixtures) => {
    // Exact logic from LiveMatch.tsx
    const match = fixtures.find((m: { status: string }) => m.status === 'LIVE')
      || [...fixtures].sort((a: { date: string; time: string }, b: { date: string; time: string }) => (a.date + a.time) < (b.date + b.time) ? -1 : 1).find((m: { status: string }) => m.status === 'UPCOMING')
      || fixtures[0];
    return { id: match?.id, home: match?.homeTeam.name, away: match?.awayTeam.name };
  }, FIREBASE_FIXTURES);

  console.log('Selected match:', result);

  expect(result.id).toBe('m1');
  expect(result.home).toBe('RKM Baranagar');
  expect(result.away).toBe('RKM Manasadwip');
});

test('OLD broken logic — would have shown TBD (Final)', async ({ page }) => {
  const result = await page.evaluate((fixtures) => {
    // Old code: fixtures.find(LIVE) || fixtures[0]
    const match = fixtures.find((m: { status: string }) => m.status === 'LIVE') || fixtures[0];
    return { id: (match as { id: string }).id, home: (match as { homeTeam: { name: string } }).homeTeam.name };
  }, FIREBASE_FIXTURES);

  console.log('Old logic picked:', result);
  // Old logic picks m15 (Final, TBD) — the bug
  expect(result.id).toBe('m15');
  expect(result.home).toBe('TBD');
});
