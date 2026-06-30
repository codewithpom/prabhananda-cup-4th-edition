import {
  Team,
  Match,
  Sponsor,
  TournamentMeta,
  HeroContent,
  VenueInfo,
  PlayEvent,
  Player,
} from '../types';
import { RawFirebaseData } from '../services/db';

export function transformTeams(raw: Record<string, unknown> | undefined): Team[] {
  if (!raw) return [];
  return Object.entries(raw).map(([id, value]) => {
    const team = value as Record<string, unknown>;
    const rawRoster = team.roster as Record<string, unknown> | undefined;
    const roster: Player[] = rawRoster
      ? Object.entries(rawRoster).map(([pid, pval]) => {
          const p = pval as Record<string, unknown>;
          return {
            id: (p.id as string) ?? pid,
            name: (p.name as string) ?? '',
            photo: (p.photo as string) ?? '',
            position: (p.position as Player['position']) ?? 'Midfielder',
            bio: (p.bio as string) ?? '',
          };
        })
      : undefined;

    return {
      id: (team.id as string) ?? id,
      name: (team.name as string) ?? '',
      logo: (team.logo as string) ?? '',
      group: (team.group as string) ?? '',
      ...(roster !== undefined && { roster }),
    };
  });
}

function resolveTeamDisplayName(
  teamName: string | undefined,
  overrideName: string | null | undefined,
  isTbd: boolean | undefined,
): string {
  if (isTbd) return 'TBD';
  const trimmedOverride = overrideName?.trim();
  return trimmedOverride || teamName || 'Unknown';
}

export function transformMatches(
  rawMatches: Record<string, unknown> | undefined,
  teamsMap: Record<string, Team>,
): Match[] {
  if (!rawMatches) return [];

  const matches: Match[] = Object.entries(rawMatches).map(([id, value]) => {
    const m = value as Record<string, unknown>;

    const homeTeamId = (m.homeTeamId as string) ?? '';
    const awayTeamId = (m.awayTeamId as string) ?? '';
    const homeTeamConfig = teamsMap[homeTeamId];
    const awayTeamConfig = teamsMap[awayTeamId];
    const homeTeam: Team = {
      id: homeTeamId,
      name: resolveTeamDisplayName(homeTeamConfig?.name, m.homeTeamName as string | null | undefined, m.homeTeamTbd as boolean | undefined),
      logo: homeTeamConfig?.logo ?? '',
      group: homeTeamConfig?.group ?? '',
    };
    const awayTeam: Team = {
      id: awayTeamId,
      name: resolveTeamDisplayName(awayTeamConfig?.name, m.awayTeamName as string | null | undefined, m.awayTeamTbd as boolean | undefined),
      logo: awayTeamConfig?.logo ?? '',
      group: awayTeamConfig?.group ?? '',
    };

    // Transform events object to array
    const rawEvents = m.events as Record<string, unknown> | undefined;
    const events: PlayEvent[] | undefined = rawEvents
      ? Object.entries(rawEvents).map(([eid, eVal]) => {
          const ev = eVal as Record<string, unknown>;
          return {
            id: (ev.id as string) ?? eid,
            time: (ev.time as string) ?? '',
            type: (ev.type as PlayEvent['type']) ?? 'Commentary',
            description: (ev.description as string) ?? '',
            teamId: ev.teamId as string | undefined,
          };
        })
      : undefined;

    const rawStats = m.stats as Record<string, unknown> | undefined;
    const stats: Match['stats'] = rawStats
      ? {
          possession: (rawStats.possession as [number, number]) ?? [50, 50],
          shots: (rawStats.shots as [number, number]) ?? [0, 0],
          fouls: (rawStats.fouls as [number, number]) ?? [0, 0],
        }
      : undefined;

    return {
      id: (m.id as string) ?? id,
      homeTeam,
      awayTeam,
      homeScore: m.homeScore !== undefined ? (m.homeScore as number | null) : null,
      awayScore: m.awayScore !== undefined ? (m.awayScore as number | null) : null,
      status: (m.status as Match['status']) ?? 'UPCOMING',
      date: (m.date as string) ?? '',
      time: (m.time as string) ?? '',
      ...(events !== undefined && { events }),
      ...(m.streamUrl !== undefined && { streamUrl: m.streamUrl as string }),
      ...(m.highlightsUrl !== undefined && { highlightsUrl: m.highlightsUrl as string }),
      ...(m.aiCommentary !== undefined && { aiCommentary: m.aiCommentary as string }),
      ...(stats !== undefined && { stats }),
    };
  });

  // Sort by date descending (most recent first)
  return matches.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function transformSponsors(raw: Record<string, unknown> | undefined): Sponsor[] {
  if (!raw) return [];
  return Object.entries(raw).map(([id, value]) => {
    const s = value as Record<string, unknown>;
    return {
      id: (s.id as string) ?? id,
      name: (s.name as string) ?? '',
      logoUrl: (s.logoUrl as string) ?? '',
      tier: (s.tier as Sponsor['tier']) ?? 'Gold',
      websiteUrl: (s.websiteUrl as string) ?? '',
    };
  });
}

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

export function transformTournamentMeta(
  raw: Record<string, unknown> | undefined,
): TournamentMeta {
  if (!raw) return { ...DEFAULT_TOURNAMENT_META };
  return {
    name: (raw.name as string) ?? DEFAULT_TOURNAMENT_META.name,
    edition: (raw.edition as string) ?? DEFAULT_TOURNAMENT_META.edition,
    year: (raw.year as number) ?? DEFAULT_TOURNAMENT_META.year,
    tagline: (raw.tagline as string) ?? DEFAULT_TOURNAMENT_META.tagline,
    matchDay: (raw.matchDay as string) ?? DEFAULT_TOURNAMENT_META.matchDay,
    startDate: (raw.startDate as string) ?? DEFAULT_TOURNAMENT_META.startDate,
    endDate: (raw.endDate as string) ?? DEFAULT_TOURNAMENT_META.endDate,
    officialPartner: (raw.officialPartner as string) ?? DEFAULT_TOURNAMENT_META.officialPartner,
    referee: (raw.referee as string) ?? DEFAULT_TOURNAMENT_META.referee,
    audioLanguage: (raw.audioLanguage as string) ?? DEFAULT_TOURNAMENT_META.audioLanguage,
  };
}

const DEFAULT_HERO_CONTENT: HeroContent = {
  titleLine1: 'PRABHA',
  titleLine2: 'NANDA',
  badgeText: 'CUP 4TH ED',
  subtitleText: 'Under-16 State Championship',
  backgroundImageUrl: '',
};

export function transformHeroContent(
  raw: Record<string, unknown> | undefined,
): HeroContent {
  if (!raw) return { ...DEFAULT_HERO_CONTENT };
  return {
    titleLine1: (raw.titleLine1 as string) ?? DEFAULT_HERO_CONTENT.titleLine1,
    titleLine2: (raw.titleLine2 as string) ?? DEFAULT_HERO_CONTENT.titleLine2,
    badgeText: (raw.badgeText as string) ?? DEFAULT_HERO_CONTENT.badgeText,
    subtitleText: (raw.subtitleText as string) ?? DEFAULT_HERO_CONTENT.subtitleText,
    backgroundImageUrl:
      (raw.backgroundImageUrl as string) ?? DEFAULT_HERO_CONTENT.backgroundImageUrl,
  };
}

const DEFAULT_VENUE_INFO: VenueInfo = {
  name: 'Ramakrishna Mission Vidyalaya',
  address: 'Narendrapur, Kolkata, West Bengal 700103',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.974558237302!2d88.39655187600862!3d22.448777179579737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0271b80c3527df%3A0xe5ed809b02a90101!2sRamakrishna%20Mission%20Vidyalaya%2C%20Narendrapur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  stadiumLabel: 'MAIN STADIUM',
};

export function transformVenueInfo(
  raw: Record<string, unknown> | undefined,
): VenueInfo {
  if (!raw) return { ...DEFAULT_VENUE_INFO };
  return {
    name: (raw.name as string) ?? DEFAULT_VENUE_INFO.name,
    address: (raw.address as string) ?? DEFAULT_VENUE_INFO.address,
    mapEmbedUrl: (raw.mapEmbedUrl as string) ?? DEFAULT_VENUE_INFO.mapEmbedUrl,
    stadiumLabel: (raw.stadiumLabel as string) ?? DEFAULT_VENUE_INFO.stadiumLabel,
  };
}

export function transformAll(data: RawFirebaseData): {
  teams: Team[];
  matches: Match[];
  sponsors: Sponsor[];
  meta: TournamentMeta;
  hero: HeroContent;
  venue: VenueInfo;
} {
  const teams = transformTeams(data.teams as Record<string, unknown> | undefined);
  const teamsMap: Record<string, Team> = Object.fromEntries(teams.map((t) => [t.id, t]));
  const matches = transformMatches(
    data.matches as Record<string, unknown> | undefined,
    teamsMap,
  );
  const sponsors = transformSponsors(data.sponsors as Record<string, unknown> | undefined);
  const meta = transformTournamentMeta(data.tournament?.meta);
  const hero = transformHeroContent(data.tournament?.hero);
  const venue = transformVenueInfo(data.tournament?.venue);
  return { teams, matches, sponsors, meta, hero, venue };
}
