// Mock data structured like Sportmonks API v3 responses

export interface Team {
  id: number;
  name: string;
  short_code: string;
  logo_path: string;
}

export interface Odds {
  id: string;
  market: string;
  label: string;
  value: number;
  matchId: number;
}

export interface Match {
  id: number;
  name: string;
  starting_at: string;
  state: {
    short_name: 'LIVE' | 'NS' | 'FT' | 'HT' | 'ET' | 'PEN';
    description: string;
  };
  scores: {
    localteam_score: number | null;
    visitorteam_score: number | null;
  };
  time: {
    minute: number | null;
    added_time: number | null;
  };
  league: {
    id: number;
    name: string;
    logo_path: string;
  };
  localTeam: Team;
  visitorTeam: Team;
  odds: Odds[];
}

// Team logos (using placeholder URLs)
const teamLogos: Record<string, string> = {
  'PSG': 'https://media.api-sports.io/football/teams/85.png',
  'OM': 'https://media.api-sports.io/football/teams/81.png',
  'OL': 'https://media.api-sports.io/football/teams/80.png',
  'FCB': 'https://media.api-sports.io/football/teams/529.png',
  'RMA': 'https://media.api-sports.io/football/teams/541.png',
  'ATM': 'https://media.api-sports.io/football/teams/530.png',
  'MCI': 'https://media.api-sports.io/football/teams/50.png',
  'MUN': 'https://media.api-sports.io/football/teams/33.png',
  'LIV': 'https://media.api-sports.io/football/teams/40.png',
  'CHE': 'https://media.api-sports.io/football/teams/49.png',
  'ARS': 'https://media.api-sports.io/football/teams/42.png',
  'TOT': 'https://media.api-sports.io/football/teams/47.png',
  'BAY': 'https://media.api-sports.io/football/teams/157.png',
  'BVB': 'https://media.api-sports.io/football/teams/165.png',
  'JUV': 'https://media.api-sports.io/football/teams/496.png',
  'INT': 'https://media.api-sports.io/football/teams/505.png',
  'ACM': 'https://media.api-sports.io/football/teams/489.png',
  'NAP': 'https://media.api-sports.io/football/teams/492.png',
};

const leagueLogos: Record<string, string> = {
  'Ligue 1': 'https://media.api-sports.io/football/leagues/61.png',
  'La Liga': 'https://media.api-sports.io/football/leagues/140.png',
  'Premier League': 'https://media.api-sports.io/football/leagues/39.png',
  'Bundesliga': 'https://media.api-sports.io/football/leagues/78.png',
  'Serie A': 'https://media.api-sports.io/football/leagues/135.png',
  'Champions League': 'https://media.api-sports.io/football/leagues/2.png',
};

function generateOdds(matchId: number): Odds[] {
  const homeWin = (Math.random() * 2 + 1.2).toFixed(2);
  const draw = (Math.random() * 1.5 + 2.8).toFixed(2);
  const awayWin = (Math.random() * 3 + 1.5).toFixed(2);
  const over25 = (Math.random() * 0.5 + 1.6).toFixed(2);
  const under25 = (Math.random() * 0.5 + 2.0).toFixed(2);
  const btts = (Math.random() * 0.5 + 1.7).toFixed(2);

  return [
    { id: `${matchId}-1`, market: '1X2', label: '1', value: parseFloat(homeWin), matchId },
    { id: `${matchId}-X`, market: '1X2', label: 'X', value: parseFloat(draw), matchId },
    { id: `${matchId}-2`, market: '1X2', label: '2', value: parseFloat(awayWin), matchId },
    { id: `${matchId}-O25`, market: 'O/U 2.5', label: 'O2.5', value: parseFloat(over25), matchId },
    { id: `${matchId}-U25`, market: 'O/U 2.5', label: 'U2.5', value: parseFloat(under25), matchId },
    { id: `${matchId}-BTTS`, market: 'BTTS', label: 'BTTS', value: parseFloat(btts), matchId },
  ];
}

// Live matches (mock data)
export const liveMatches: Match[] = [
  {
    id: 1001,
    name: 'PSG vs Marseille',
    starting_at: new Date().toISOString(),
    state: { short_name: 'LIVE', description: 'In Play' },
    scores: { localteam_score: 2, visitorteam_score: 1 },
    time: { minute: 67, added_time: null },
    league: { id: 1, name: 'Ligue 1', logo_path: leagueLogos['Ligue 1'] },
    localTeam: { id: 1, name: 'Paris Saint-Germain', short_code: 'PSG', logo_path: teamLogos['PSG'] },
    visitorTeam: { id: 2, name: 'Olympique de Marseille', short_code: 'OM', logo_path: teamLogos['OM'] },
    odds: generateOdds(1001),
  },
  {
    id: 1002,
    name: 'Man City vs Liverpool',
    starting_at: new Date().toISOString(),
    state: { short_name: 'HT', description: 'Half Time' },
    scores: { localteam_score: 1, visitorteam_score: 1 },
    time: { minute: 45, added_time: 2 },
    league: { id: 2, name: 'Premier League', logo_path: leagueLogos['Premier League'] },
    localTeam: { id: 3, name: 'Manchester City', short_code: 'MCI', logo_path: teamLogos['MCI'] },
    visitorTeam: { id: 4, name: 'Liverpool', short_code: 'LIV', logo_path: teamLogos['LIV'] },
    odds: generateOdds(1002),
  },
  {
    id: 1003,
    name: 'Barcelona vs Real Madrid',
    starting_at: new Date().toISOString(),
    state: { short_name: 'LIVE', description: 'In Play' },
    scores: { localteam_score: 0, visitorteam_score: 0 },
    time: { minute: 23, added_time: null },
    league: { id: 3, name: 'La Liga', logo_path: leagueLogos['La Liga'] },
    localTeam: { id: 5, name: 'FC Barcelona', short_code: 'FCB', logo_path: teamLogos['FCB'] },
    visitorTeam: { id: 6, name: 'Real Madrid', short_code: 'RMA', logo_path: teamLogos['RMA'] },
    odds: generateOdds(1003),
  },
];

// Upcoming matches
export const upcomingMatches: Match[] = [
  {
    id: 2001,
    name: 'Arsenal vs Chelsea',
    starting_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    state: { short_name: 'NS', description: 'Not Started' },
    scores: { localteam_score: null, visitorteam_score: null },
    time: { minute: null, added_time: null },
    league: { id: 2, name: 'Premier League', logo_path: leagueLogos['Premier League'] },
    localTeam: { id: 7, name: 'Arsenal', short_code: 'ARS', logo_path: teamLogos['ARS'] },
    visitorTeam: { id: 8, name: 'Chelsea', short_code: 'CHE', logo_path: teamLogos['CHE'] },
    odds: generateOdds(2001),
  },
  {
    id: 2002,
    name: 'Bayern vs Dortmund',
    starting_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    state: { short_name: 'NS', description: 'Not Started' },
    scores: { localteam_score: null, visitorteam_score: null },
    time: { minute: null, added_time: null },
    league: { id: 4, name: 'Bundesliga', logo_path: leagueLogos['Bundesliga'] },
    localTeam: { id: 9, name: 'Bayern Munich', short_code: 'BAY', logo_path: teamLogos['BAY'] },
    visitorTeam: { id: 10, name: 'Borussia Dortmund', short_code: 'BVB', logo_path: teamLogos['BVB'] },
    odds: generateOdds(2002),
  },
  {
    id: 2003,
    name: 'Juventus vs Inter',
    starting_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    state: { short_name: 'NS', description: 'Not Started' },
    scores: { localteam_score: null, visitorteam_score: null },
    time: { minute: null, added_time: null },
    league: { id: 5, name: 'Serie A', logo_path: leagueLogos['Serie A'] },
    localTeam: { id: 11, name: 'Juventus', short_code: 'JUV', logo_path: teamLogos['JUV'] },
    visitorTeam: { id: 12, name: 'Inter Milan', short_code: 'INT', logo_path: teamLogos['INT'] },
    odds: generateOdds(2003),
  },
  {
    id: 2004,
    name: 'Lyon vs Monaco',
    starting_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    state: { short_name: 'NS', description: 'Not Started' },
    scores: { localteam_score: null, visitorteam_score: null },
    time: { minute: null, added_time: null },
    league: { id: 1, name: 'Ligue 1', logo_path: leagueLogos['Ligue 1'] },
    localTeam: { id: 13, name: 'Olympique Lyonnais', short_code: 'OL', logo_path: teamLogos['OL'] },
    visitorTeam: { id: 14, name: 'AS Monaco', short_code: 'MON', logo_path: 'https://media.api-sports.io/football/teams/91.png' },
    odds: generateOdds(2004),
  },
  {
    id: 2005,
    name: 'Atletico vs Sevilla',
    starting_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    state: { short_name: 'NS', description: 'Not Started' },
    scores: { localteam_score: null, visitorteam_score: null },
    time: { minute: null, added_time: null },
    league: { id: 3, name: 'La Liga', logo_path: leagueLogos['La Liga'] },
    localTeam: { id: 15, name: 'Atletico Madrid', short_code: 'ATM', logo_path: teamLogos['ATM'] },
    visitorTeam: { id: 16, name: 'Sevilla FC', short_code: 'SEV', logo_path: 'https://media.api-sports.io/football/teams/536.png' },
    odds: generateOdds(2005),
  },
  {
    id: 2006,
    name: 'Man United vs Tottenham',
    starting_at: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    state: { short_name: 'NS', description: 'Not Started' },
    scores: { localteam_score: null, visitorteam_score: null },
    time: { minute: null, added_time: null },
    league: { id: 2, name: 'Premier League', logo_path: leagueLogos['Premier League'] },
    localTeam: { id: 17, name: 'Manchester United', short_code: 'MUN', logo_path: teamLogos['MUN'] },
    visitorTeam: { id: 18, name: 'Tottenham', short_code: 'TOT', logo_path: teamLogos['TOT'] },
    odds: generateOdds(2006),
  },
];

// Get all matches
export function getAllMatches(): Match[] {
  return [...liveMatches, ...upcomingMatches];
}

// Get match by ID
export function getMatchById(id: number): Match | undefined {
  return getAllMatches().find(m => m.id === id);
}
