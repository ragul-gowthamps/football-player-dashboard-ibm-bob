/**
 * @typedef {Object} Player
 * @property {string}      name
 * @property {string}      [photo]
 * @property {string}      [position]  — 'Attacker' | 'Midfielder' | 'Defender' | 'Goalkeeper'
 * @property {number}      [age]
 * @property {string}      [citizenship]
 * @property {string}      [club]
 * @property {number|null} [rating]
 */

/** Shuffle an array (Fisher-Yates, non-mutating). */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick up to `n` random players matching the given position from `pool`.
 * Falls back to any remaining player if not enough positional matches exist.
 */
function pick(pool, position, n) {
  const matching = shuffle(pool.filter((p) => p.position === position));
  return matching.slice(0, n);
}

/**
 * Build a position-aware 11-player squad for a given formation.
 *
 * @param {Player[]} allPlayers
 * @param {{ fwd: number, mid: number, def: number }} formation
 * @returns {Player[]} Ordered: [forwards..., midfielders..., defenders..., goalkeeper]
 */
export function generateTeamByFormation(allPlayers, formation = { fwd: 2, mid: 4, def: 4 }) {
  const { fwd, mid, def } = formation;

  const forwards    = pick(allPlayers, 'Attacker',   fwd);
  const midfielders = pick(allPlayers, 'Midfielder',  mid);
  const defenders   = pick(allPlayers, 'Defender',    def);
  const goalkeepers = pick(allPlayers, 'Goalkeeper',  1);

  // Fill any shortfall with random remaining players so we always return 11
  const used = new Set([...forwards, ...midfielders, ...defenders, ...goalkeepers].map((p) => p.name));
  const bench = shuffle(allPlayers.filter((p) => !used.has(p.name)));
  const needed = 11 - forwards.length - midfielders.length - defenders.length - goalkeepers.length;
  const fillers = bench.slice(0, needed);

  return [...forwards, ...midfielders, ...defenders, ...goalkeepers, ...fillers];
}

/**
 * Legacy: randomly selects 11 players from the provided pool.
 * @param {Player[]} allPlayers
 * @returns {Player[]}
 */
export function generateRandomTeam(allPlayers) {
  return shuffle(allPlayers).slice(0, 11);
}
