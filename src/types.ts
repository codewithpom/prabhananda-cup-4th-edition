export interface Player {
  id: string;
  name: string;
  photo: string;
  position: 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper';
  bio: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  group: string;
  roster?: Player[];
}

export interface PlayEvent {
  id: string;
  time: string;
  type: 'Goal' | 'Yellow Card' | 'Red Card' | 'Substitution' | 'Commentary';
  description: string;
  teamId?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  homeTeamTbd?: boolean;
  awayTeamTbd?: boolean;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  date: string;
  time: string;
  events?: PlayEvent[];
  streamUrl?: string;
  highlightsUrl?: string;
  aiCommentary?: string;
  stats?: {
    possession: [number, number];
    shots: [number, number];
    fouls: [number, number];
  };
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  tier: 'Title' | 'Platinum' | 'Gold';
  websiteUrl: string;
}

export interface TournamentMeta {
  name: string;
  edition: string;
  year: number;
  tagline: string;
  matchDay: string;
  startDate: string;
  endDate: string;
}

export interface HeroContent {
  titleLine1: string;
  titleLine2: string;
  badgeText: string;
  subtitleText: string;
  backgroundImageUrl: string;
}

export interface VenueInfo {
  name: string;
  address: string;
  mapEmbedUrl: string;
  stadiumLabel: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  x: string;
}
