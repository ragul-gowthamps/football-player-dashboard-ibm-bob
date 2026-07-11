import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.REACT_APP_API_FOOTBALL_KEY ?? process.env.API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';
const PREMIER_LEAGUE_ID = 39;
const SEASON = 2023;
const OUTPUT_DIR = join(__dirname, '..', 'src', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'players.json');

// Top Premier League teams with their API-Football team IDs
const TEAMS = [
  { id: 50,  name: 'Manchester City' },
  { id: 33,  name: 'Manchester United' },
  { id: 40,  name: 'Liverpool' },
  { id: 42,  name: 'Arsenal' },
  { id: 49,  name: 'Chelsea' },
  { id: 47,  name: 'Tottenham' },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchTeamPlayers(team) {
  const url = `${BASE_URL}/players?team=${team.id}&season=${SEASON}`;
  const response = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching team ${team.name}: ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API error for team ${team.name}: ${JSON.stringify(json.errors)}`);
  }

  return json.response ?? [];
}

function extractPlayer(entry) {
  const { player, statistics } = entry;

  if (!statistics || statistics.length === 0) return null;

  // Only keep Premier League stats
  const plStats = statistics.find((s) => s.league?.id === PREMIER_LEAGUE_ID);
  if (!plStats) return null;

  const rating = plStats.games?.rating ? parseFloat(plStats.games.rating) : null;
  const height = player.height
    ? parseInt(player.height.replace(/\D/g, ''), 10) || null
    : null;

  return {
    name: player.name,
    photo: player.photo,
    position: plStats.games?.position ?? null,
    age: player.age,
    citizenship: player.nationality,
    height,
    club: plStats.team?.name ?? null,
    rating,
  };
}

async function main() {
  if (!API_KEY) {
    console.error(
      'Error: neither REACT_APP_API_FOOTBALL_KEY nor API_FOOTBALL_KEY is set. ' +
      'Add one of them to your .env file and try again.'
    );
    process.exit(1);
  }

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const allPlayers = [];

  for (const team of TEAMS) {
    console.log(`Fetching players for ${team.name} (team ID ${team.id})…`);
    try {
      const entries = await fetchTeamPlayers(team);
      const players = entries.map(extractPlayer).filter(Boolean);
      console.log(`  → ${players.length} players with Premier League stats`);
      allPlayers.push(...players);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }

    // Respect free-plan rate limit (10 req/min → 500 ms gap is safe)
    await delay(500);
  }

  console.log(`\nTotal players fetched (with duplicates): ${allPlayers.length}`);

  // Deduplicate by name — keep first occurrence
  const seen = new Set();
  const unique = allPlayers.filter(({ name }) => {
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  });

  console.log(`Players after deduplication: ${unique.length}`);

  writeFileSync(OUTPUT_FILE, JSON.stringify(unique, null, 2), 'utf-8');
  console.log(`\n✓ Saved ${unique.length} players to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
