import {
  ref,
  onValue,
  update,
  push,
  remove,
  set,
} from 'firebase/database';
import { db } from '../firebase';

export interface RawFirebaseData {
  tournament?: {
    meta?: Record<string, unknown>;
    hero?: Record<string, unknown>;
    venue?: Record<string, unknown>;
  };
  teams?: Record<string, unknown>;
  matches?: Record<string, unknown>;
  sponsors?: Record<string, unknown>;
}

export function subscribeToTournamentData(
  callback: (data: RawFirebaseData) => void,
): () => void {
  if (!db) return () => {};
  const rootRef = ref(db, '/');
  const unsubscribe = onValue(rootRef, (snapshot) => {
    const data: RawFirebaseData = snapshot.val() ?? {};
    callback(data);
  });
  return unsubscribe;
}

export async function updateMatch(
  matchId: string,
  updates: Record<string, unknown>,
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await update(ref(db, `matches/${matchId}`), updates);
}

export async function addMatch(match: Record<string, unknown>): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const matchesRef = ref(db, 'matches');
  const newRef = await push(matchesRef, match);
  return newRef.key!;
}

export async function deleteMatch(matchId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await remove(ref(db, `matches/${matchId}`));
}

export async function addEvent(
  matchId: string,
  event: Record<string, unknown>,
): Promise<string> {
  if (!db) throw new Error('Firebase not configured');
  const eventsRef = ref(db, `matches/${matchId}/events`);
  const newRef = await push(eventsRef, event);
  return newRef.key!;
}

export async function upsertTeam(
  team: Record<string, unknown> & { id: string },
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await set(ref(db, `teams/${team.id}`), team);
}

export async function deleteTeam(teamId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await remove(ref(db, `teams/${teamId}`));
}

export async function upsertSponsor(
  sponsor: Record<string, unknown> & { id: string },
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await set(ref(db, `sponsors/${sponsor.id}`), sponsor);
}

export async function deleteSponsor(sponsorId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await remove(ref(db, `sponsors/${sponsorId}`));
}

export async function updateTournamentMeta(
  meta: Partial<Record<string, unknown>>,
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await update(ref(db, 'tournament/meta'), meta);
}

export async function updateHeroContent(
  hero: Partial<Record<string, unknown>>,
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await update(ref(db, 'tournament/hero'), hero);
}

export async function updateVenueInfo(
  venue: Partial<Record<string, unknown>>,
): Promise<void> {
  if (!db) throw new Error('Firebase not configured');
  await update(ref(db, 'tournament/venue'), venue);
}
