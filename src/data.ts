import { Team, Match, Sponsor } from './types';

export const TEAMS: Team[] = [
  { 
    id: '1', 
    name: 'RKMV Narendrapur', 
    logo: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=200&q=80', 
    group: 'A',
    roster: [
      { id: 'p1', name: 'Ayan Chatterjee', photo: 'https://i.pravatar.cc/150?u=p1', position: 'Forward', bio: 'Top scorer of the last tournament.' },
      { id: 'p2', name: 'Rohan Mitra', photo: 'https://i.pravatar.cc/150?u=p2', position: 'Midfielder', bio: 'Captain and playmaker.' },
      { id: 'p3', name: 'Sayan Das', photo: 'https://i.pravatar.cc/150?u=p3', position: 'Defender', bio: 'Solid at the back.' },
      { id: 'p4', name: 'Kunal Sen', photo: 'https://i.pravatar.cc/150?u=p4', position: 'Goalkeeper', bio: 'Known for spectacular saves.' },
    ]
  },
  { 
    id: '2', 
    name: 'RKMV Deoghar', 
    logo: 'https://images.unsplash.com/photo-1628260412297-a3377e45006f?auto=format&fit=crop&w=200&q=80', 
    group: 'A',
    roster: [
      { id: 'd1', name: 'Aryan Singh', photo: 'https://i.pravatar.cc/150?u=d1', position: 'Forward', bio: 'Quick and agile.' },
      { id: 'd2', name: 'Vivek Kumar', photo: 'https://i.pravatar.cc/150?u=d2', position: 'Midfielder', bio: 'Excellent passing vision.' },
      { id: 'd3', name: 'Rahul Sharma', photo: 'https://i.pravatar.cc/150?u=d3', position: 'Defender', bio: 'Tough tackler.' },
    ]
  },
  { id: '3', name: 'RKM Narayanpur', logo: 'https://images.unsplash.com/photo-1599058918144-1ffabb6ab9a0?auto=format&fit=crop&w=200&q=80', group: 'B' },
  { id: '4', name: 'Baranagore RKM', logo: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&w=200&q=80', group: 'B' },
  { id: '5', name: 'Purulia RKM', logo: 'https://images.unsplash.com/photo-1577908323215-9c9ae0eac5b3?auto=format&fit=crop&w=200&q=80', group: 'C' },
  { id: '6', name: 'Asansol RKM', logo: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=200&q=80', group: 'C' },
];

export const FIXTURES: Match[] = [
  {
    id: 'm1',
    homeTeam: TEAMS[0],
    awayTeam: TEAMS[1],
    homeScore: 2,
    awayScore: 1,
    status: 'LIVE',
    date: '2026-05-23',
    time: '15:00',
    streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
    events: [
      { id: 'e1', time: '12\'', type: 'Goal', description: 'Ayan Chatterjee scores a screamer from 25 yards out!', teamId: '1' },
      { id: 'e2', time: '28\'', type: 'Yellow Card', description: 'Rohan Mitra booked for a late challenge.', teamId: '1' },
      { id: 'e3', time: '45\'', type: 'Goal', description: 'Aryan Singh equalizes just before halftime.', teamId: '2' },
      { id: 'e4', time: '68\'', type: 'Goal', description: 'Sayan Das heads in from a corner to restore the lead!', teamId: '1' },
      { id: 'e5', time: '72\'', type: 'Commentary', description: 'Narendrapur dominating possession in the midfield.' }
    ],
    stats: {
      possession: [58, 42],
      shots: [12, 7],
      fouls: [8, 11]
    }
  },
  {
    id: 'm2',
    homeTeam: TEAMS[2],
    awayTeam: TEAMS[3],
    homeScore: null,
    awayScore: null,
    status: 'UPCOMING',
    date: '2026-05-24',
    time: '10:00',
  },
  {
    id: 'm3',
    homeTeam: TEAMS[4],
    awayTeam: TEAMS[5],
    homeScore: null,
    awayScore: null,
    status: 'UPCOMING',
    date: '2026-05-24',
    time: '14:30',
  },
  {
    id: 'm4',
    homeTeam: TEAMS[0],
    awayTeam: TEAMS[2],
    homeScore: 3,
    awayScore: 0,
    status: 'FINISHED',
    date: '2026-05-20',
    time: '16:00',
    highlightsUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
    events: [
      { id: 'e41', time: '18\'', type: 'Goal', description: 'Ayan Chatterjee scores an opening header setup by Mitra.', teamId: '1' },
      { id: 'e42', time: '55\'', type: 'Goal', description: 'Rohan Mitra converts an elegant penalty kick.', teamId: '1' },
      { id: 'e43', time: '82\'', type: 'Goal', description: 'Sunder Sen dashes through the defensive lines and bangs a low shot.', teamId: '1' }
    ],
    stats: {
      possession: [65, 35],
      shots: [18, 4],
      fouls: [6, 9]
    }
  },
  {
    id: 'm5',
    homeTeam: TEAMS[1],
    awayTeam: TEAMS[3],
    homeScore: 1,
    awayScore: 2,
    status: 'FINISHED',
    date: '2026-05-21',
    time: '14:30',
    highlightsUrl: 'https://www.youtube.com/embed/6_9Wz7f_O9s?autoplay=1&mute=1',
    events: [
      { id: 'e51', time: '8\'', type: 'Goal', description: 'Baranagore converts a speedy corner kick with a stunning volley.', teamId: '4' },
      { id: 'e52', time: '30\'', type: 'Goal', description: 'Aryan Singh levels the score with a stunning long-range drive!', teamId: '2' },
      { id: 'e53', time: '74\'', type: 'Goal', description: 'Baranagore attacker slips past the keeper to secure the victory.', teamId: '4' }
    ],
    stats: {
      possession: [45, 55],
      shots: [9, 14],
      fouls: [12, 10]
    }
  }
];

export const SPONSORS: Sponsor[] = [
  { id: 's1', name: 'EduSports India', logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ae4f66?auto=format&fit=crop&w=300&q=80', tier: 'Title', websiteUrl: 'https://example.com/edusports' },
  { id: 's2', name: 'Kolkata Athletics', logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=300&q=80', tier: 'Platinum', websiteUrl: 'https://example.com/kolkataathletics' },
  { id: 's3', name: 'Bengal Youth', logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80', tier: 'Gold', websiteUrl: 'https://example.com/bengalyouth' },
];
