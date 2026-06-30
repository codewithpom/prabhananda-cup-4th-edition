import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { Team, Match, Sponsor, TournamentMeta, HeroContent, VenueInfo, SocialLinks } from './types';
import { subscribeToTournamentData, updateMatch as dbUpdateMatch, addMatch as dbAddMatch, deleteMatch as dbDeleteMatch, addEvent as dbAddEvent, upsertTeam as dbUpsertTeam, deleteTeam as dbDeleteTeam, upsertSponsor as dbUpsertSponsor, deleteSponsor as dbDeleteSponsor, updateTournamentMeta as dbUpdateTournamentMeta, updateHeroContent as dbUpdateHeroContent, updateVenueInfo as dbUpdateVenueInfo, updateSocialLinks as dbUpdateSocialLinks } from './services/db';
import { signIn as authSignIn, signOut as authSignOut, onAuthChange } from './services/auth';
import { transformTeams, transformMatches, transformSponsors, transformTournamentMeta, transformHeroContent, transformVenueInfo } from './utils/firebaseTransform';
import { TEAMS, FIXTURES, SPONSORS, SOCIAL_LINKS } from './data';
import { isFirebaseConfigured } from './firebase';

interface AppContextType {
  teams: Team[];
  fixtures: Match[];
  sponsors: Sponsor[];
  tournamentMeta: TournamentMeta;
  heroContent: HeroContent;
  venueInfo: VenueInfo;
  socialLinks: SocialLinks;
  isLoading: boolean;
  selectedMatchId: string | null;
  setSelectedMatchId: (id: string | null) => void;
  adminUser: User | null;
  authError: string | null;
  useDummyData: boolean;
  setUseDummyData: (val: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateMatch: (matchId: string, updates: Partial<Match>) => Promise<void>;
  addMatch: (match: Omit<Match, 'id' | 'homeTeam' | 'awayTeam'> & { homeTeamId: string; awayTeamId: string }) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  addEvent: (matchId: string, event: Omit<import('./types').PlayEvent, 'id'>) => Promise<void>;
  upsertTeam: (team: Team) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  upsertSponsor: (sponsor: Sponsor) => Promise<void>;
  deleteSponsor: (sponsorId: string) => Promise<void>;
  updateTournamentMeta: (meta: Partial<TournamentMeta>) => Promise<void>;
  updateHeroContent: (hero: Partial<HeroContent>) => Promise<void>;
  updateVenueInfo: (venue: Partial<VenueInfo>) => Promise<void>;
  updateSocialLinks: (socialLinks: Partial<SocialLinks>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_TOURNAMENT_META: TournamentMeta = {
  name: 'Prabhananda Cup',
  edition: '4th Edition',
  year: 2026,
  tagline: 'Under-16 State Championship',
  matchDay: 'MATCH DAY 04 • LIVE NOW',
  startDate: '2026-05-20',
  endDate: '2026-05-28',
  officialPartner: 'KOLKATA ATHLETICS MEDIA',
  referee: 'P. K. Bandyopadhyay',
  audioLanguage: 'Hindi / Bengali / English',
};

const DEFAULT_HERO_CONTENT: HeroContent = {
  titleLine1: 'PRABHA',
  titleLine2: 'NANDA',
  badgeText: 'CUP 4TH ED',
  subtitleText: 'Under-16 State Championship',
  backgroundImageUrl: '',
};

const DEFAULT_VENUE_INFO: VenueInfo = {
  name: 'Ramakrishna Mission Vidyalaya',
  address: 'Narendrapur, Kolkata, West Bengal 700103',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.974558237302!2d88.39655187600862!3d22.448777179579737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0271b80c3527df%3A0xe5ed809b02a90101!2sRamakrishna%20Mission%20Vidyalaya%2C%20Narendrapur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  stadiumLabel: 'MAIN STADIUM',
};

const DEFAULT_SOCIAL_LINKS: SocialLinks = SOCIAL_LINKS;

export function AppProvider({ children }: { children: ReactNode }) {
  // Internal Firebase/static state (raw). Derived display values computed below.
  const [firebaseTeams, setFirebaseTeams] = useState<Team[]>(() => isFirebaseConfigured ? [] : TEAMS);
  const [firebaseFixtures, setFirebaseFixtures] = useState<Match[]>(() => isFirebaseConfigured ? [] : FIXTURES);
  const [firebaseSponsors, setFirebaseSponsors] = useState<Sponsor[]>(() => isFirebaseConfigured ? [] : SPONSORS);
  const [tournamentMeta, setTournamentMeta] = useState<TournamentMeta>(DEFAULT_TOURNAMENT_META);
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [venueInfo, setVenueInfo] = useState<VenueInfo>(DEFAULT_VENUE_INFO);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(DEFAULT_SOCIAL_LINKS);
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Dummy data override — persisted across page refreshes via localStorage.
  const [useDummyData, setUseDummyDataState] = useState<boolean>(() => {
    try { return localStorage.getItem('useDummyData') === 'true'; } catch { return false; }
  });

  const setUseDummyData = (val: boolean) => {
    setUseDummyDataState(val);
    try { localStorage.setItem('useDummyData', val ? 'true' : 'false'); } catch {}
  };

  // Derived display values — when the toggle is ON, always serve static dummy data.
  const teams = useDummyData ? TEAMS : firebaseTeams;
  const fixtures = useDummyData ? FIXTURES : firebaseFixtures;
  const sponsors = useDummyData ? SPONSORS : firebaseSponsors;

  useEffect(() => {
    const unsubscribeAuth = onAuthChange((user) => {
      setAdminUser(user);
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    let settled = false;

    // Fall back to static data if Firebase doesn't respond within 4 seconds.
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setFirebaseTeams(TEAMS);
        setFirebaseFixtures(FIXTURES);
        setFirebaseSponsors(SPONSORS);
        setIsLoading(false);
      }
    }, 4000);

    const unsubscribeData = subscribeToTournamentData((rawData) => {
      clearTimeout(timeout);
      settled = true;

      const teamsArray = transformTeams(rawData.teams as Record<string, unknown> | undefined);
      const teamsMap: Record<string, Team> = {};
      teamsArray.forEach(t => { teamsMap[t.id] = t; });
      const fixturesArray = transformMatches(rawData.matches as Record<string, unknown> | undefined, teamsMap);
      const sponsorsArray = transformSponsors(rawData.sponsors as Record<string, unknown> | undefined);

      setFirebaseTeams(teamsArray.length > 0 ? teamsArray : TEAMS);
      setFirebaseFixtures(fixturesArray.length > 0 ? fixturesArray : FIXTURES);
      setFirebaseSponsors(sponsorsArray.length > 0 ? sponsorsArray : SPONSORS);
      setTournamentMeta(transformTournamentMeta(rawData.tournament?.meta as Record<string, unknown> | undefined));
      setHeroContent(transformHeroContent(rawData.tournament?.hero as Record<string, unknown> | undefined));
      setVenueInfo(transformVenueInfo(rawData.tournament?.venue as Record<string, unknown> | undefined));
      setSocialLinks({
        facebook: (rawData.tournament?.socialLinks as Record<string, unknown> | undefined)?.facebook as string || '',
        instagram: (rawData.tournament?.socialLinks as Record<string, unknown> | undefined)?.instagram as string || '',
        x: (rawData.tournament?.socialLinks as Record<string, unknown> | undefined)?.x as string || '',
      });
      setIsLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribeData();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await authSignIn(email, password);
    } catch (err: unknown) {
      let message = 'Login failed. Please try again.';
      if (err instanceof Error) {
        const codeMatch = err.message.match(/\(auth\/([^)]+)\)/);
        const code = codeMatch?.[1];
        if (code === 'invalid-credential' || code === 'wrong-password' || code === 'user-not-found') {
          message = 'Invalid email or password.';
        } else if (code === 'too-many-requests') {
          message = 'Too many failed attempts. Please wait and try again.';
        } else if (code === 'network-request-failed') {
          message = 'Network error — could not reach Firebase. Check your internet connection.';
        } else if (code === 'operation-not-allowed') {
          message = 'Email/Password login is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.';
        } else if (code) {
          message = `Auth error: ${code}`;
        }
      }
      setAuthError(message);
      throw err;
    }
  };

  const signOut = async () => {
    await authSignOut();
  };

  const updateMatch = async (matchId: string, updates: Partial<Match>) => {
    const { homeTeam, awayTeam, ...rest } = updates as Record<string, unknown>;
    void homeTeam; void awayTeam;
    await dbUpdateMatch(matchId, rest);
  };

  const addMatch = async (match: Omit<Match, 'id' | 'homeTeam' | 'awayTeam'> & { homeTeamId: string; awayTeamId: string }) => {
    await dbAddMatch(match as Record<string, unknown>);
  };

  const deleteMatch = async (matchId: string) => {
    await dbDeleteMatch(matchId);
  };

  const addEvent = async (matchId: string, event: Omit<import('./types').PlayEvent, 'id'>) => {
    await dbAddEvent(matchId, event as Record<string, unknown>);
  };

  const upsertTeam = async (team: Team) => {
    const { roster, ...teamData } = team;
    const rosterMap: Record<string, unknown> = {};
    if (roster) {
      roster.forEach(p => { rosterMap[p.id] = p; });
    }
    await dbUpsertTeam({ ...teamData, roster: rosterMap } as Record<string, unknown> & { id: string });
  };

  const deleteTeam = async (teamId: string) => {
    await dbDeleteTeam(teamId);
  };

  const upsertSponsor = async (sponsor: Sponsor) => {
    await dbUpsertSponsor(sponsor as unknown as Record<string, unknown> & { id: string });
  };

  const deleteSponsor = async (sponsorId: string) => {
    await dbDeleteSponsor(sponsorId);
  };

  const updateTournamentMeta = async (meta: Partial<TournamentMeta>) => {
    await dbUpdateTournamentMeta(meta as Partial<Record<string, unknown>>);
  };

  const updateHeroContent = async (hero: Partial<HeroContent>) => {
    await dbUpdateHeroContent(hero as Partial<Record<string, unknown>>);
  };

  const updateVenueInfo = async (venue: Partial<VenueInfo>) => {
    await dbUpdateVenueInfo(venue as Partial<Record<string, unknown>>);
  };

  const updateSocialLinks = async (links: Partial<SocialLinks>) => {
    await dbUpdateSocialLinks(links as Partial<Record<string, unknown>>);
  };

  return (
    <AppContext.Provider value={{
      teams, fixtures, sponsors,
      tournamentMeta, heroContent, venueInfo, socialLinks,
      isLoading,
      selectedMatchId, setSelectedMatchId,
      adminUser, authError,
      useDummyData, setUseDummyData,
      signIn, signOut,
      updateMatch, addMatch, deleteMatch, addEvent,
      upsertTeam, deleteTeam,
      upsertSponsor, deleteSponsor,
      updateTournamentMeta, updateHeroContent, updateVenueInfo, updateSocialLinks,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
