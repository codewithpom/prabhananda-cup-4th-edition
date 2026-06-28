import { test, expect } from '@playwright/test';
import { transformMatches } from '../src/utils/firebaseTransform';

test('transformMatches supports match-level team name overrides and TBD display', () => {
  const teamsMap = {
    teamA: { id: 'teamA', name: 'Alpha FC', logo: '', group: '' },
    teamB: { id: 'teamB', name: 'Beta FC', logo: '', group: '' },
  } as Record<string, any>;

  const matches = transformMatches({
    match1: {
      id: 'match1',
      homeTeamId: 'teamA',
      awayTeamId: 'teamB',
      homeTeamName: 'Finalists A',
      awayTeamTbd: true,
      status: 'UPCOMING',
      date: '2026-06-30',
      time: '19:00',
    },
  } as Record<string, unknown>, teamsMap);

  expect(matches[0].homeTeam.name).toBe('Finalists A');
  expect(matches[0].awayTeam.name).toBe('TBD');
});
