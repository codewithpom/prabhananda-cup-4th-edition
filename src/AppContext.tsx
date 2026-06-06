import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { Team, Match, Sponsor, TournamentMeta, HeroContent, VenueInfo } from './types';
import { subscribeToTournamentData, updateMatch as dbUpdateMatch, addMatch as dbAddMatch, deleteMatch as dbDeleteMatch, addEvent as dbAddEvent, upsertTeam as dbUpsertTeam, deleteTeam as dbDeleteTeam, upsertSponsor as dbUpsertSponsor, deleteSponsor as dbDeleteSponsor, updateTournamentMeta as dbUpdateTournamentMeta, updateHeroContent as dbUpdateHeroContent, updateVenueInfo as dbUpdateVenueInfo } from './services/db';
import { signIn as authSignIn, signOut as authSignOut, onAuthChange } from './services/auth';
import { transformTeams, transformMatches, transformSponsors, transformTournamentMeta, transformHeroContent, transformVenueInfo } from './utils/firebaseTransform';

interface AppContextType {
  teams: Team[];
  fixtures: Match[];
  sponsors: Sponsor[];
  tournamentMeta: TournamentMeta;
  heroContent: HeroContent;
  venueInfo: VenueInfo;
  isLoading: boolean;
  selectedMatchId: string | null;
  setSelectedMatchId: (id: string | null) => void;
  adminUser: User | null;
  authError: string | null;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [tournamentMeta, setTournamentMeta] = useState<TournamentMeta>({
    name: 'Prabhananda Cup',
    edition: '4th Edition',
    year: 2026,
    tagline: 'Under-16 State Championship',
    matchDay: 'MATCH DAY 04 • LIVE NOW',
    startDate: '2026-05-20',
    endDate: '2026-05-28',
  });
  const [heroContent, setHeroContent] = useState<HeroContent>({
    titleLine1: 'PRABHA',
    titleLine2: 'NANDA',
    badgeText: 'CUP 4TH ED',
    subtitleText: 'Under-16 State Championship',
    backgroundImageUrl: '',
  });
  const [venueInfo, setVenueInfo] = useState<VenueInfo>({
    name: 'Ramakrishna Mission Vidyalaya',
    address: 'Narendrapur, Kolkata, West Bengal 700103',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.974558237302!2d88.39655187600862!3d22.448777179579737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0271b80c3527df%3A0xe5ed809b02a90101!2sRamakrishna%20Mission%20Vidyalaya%2C%20Narendrapur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    stadiumLabel: 'MAIN STADIUM',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthChange((user) => {
      setAdminUser(user);
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    const unsubscribeData = subscribeToTournamentData((rawData) => {
      const teamsArray = transformTeams(rawData.teams as Record<string, unknown> | undefined);
      const teamsMap: Record<string, Team> = {};
      teamsArray.forEach(t => { teamsMap[t.id] = t; });

      setTeams(teamsArray);
      setFixtures(transformMatches(rawData.matches as Record<string, unknown> | undefined, teamsMap));
      setSponsors(transformSponsors(rawData.sponsors as Record<string, unknown> | undefined));
      setTournamentMeta(transformTournamentMeta(rawData.tournament?.meta as Record<string, unknown> | undefined));
      setHeroContent(transformHeroContent(rawData.tournament?.hero as Record<string, unknown> | undefined));
      setVenueInfo(transformVenueInfo(rawData.tournament?.venue as Record<string, unknown> | undefined));
      setIsLoading(false);
    });
    return unsubscribeData;
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    try {
      await authSignIn(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setAuthError(message.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, ''));
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

  return (
    <AppContext.Provider value={{
      teams, fixtures, sponsors,
      tournamentMeta, heroContent, venueInfo,
      isLoading,
      selectedMatchId, setSelectedMatchId,
      adminUser, authError,
      signIn, signOut,
      updateMatch, addMatch, deleteMatch, addEvent,
      upsertTeam, deleteTeam,
      upsertSponsor, deleteSponsor,
      updateTournamentMeta, updateHeroContent, updateVenueInfo,
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
