import React, { useState } from 'react';
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  SkipToContent,
  Button,
} from '@carbon/react';
import PlayerSearch from './components/PlayerSearch/PlayerSearch';
import PlayerSelect from './components/PlayerSelect/PlayerSelect';
import PositionFilter from './components/PositionFilter/PositionFilter';
import PlayerSort, { sortPlayers } from './components/PlayerSort/PlayerSort';
import PlayerCard from './components/PlayerCard/PlayerCard';
import PlayerSummary from './components/PlayerSummary/PlayerSummary';
import PlayerCompare from './components/PlayerCompare/PlayerCompare';
import FormationBoard, { FORMATIONS } from './components/FormationBoard/FormationBoard';
import { generateTeamByFormation } from './utils/teamGenerator';
import './App.scss';

// Attempt to load pre-fetched player data; falls back to empty array if not yet generated.
let players = [];
try {
  players = require('./data/players.json');
} catch {
  // players.json doesn't exist yet — run `node scripts/fetchPlayers.mjs` to generate it.
}

const PAGES = { BROWSER: 'browser', COMPARE: 'compare', FORMATION: 'formation' };

function App() {
  const [page, setPage]                     = useState(PAGES.BROWSER);

  // ── Browser page state ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]       = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [sortKey, setSortKey]               = useState('name-asc');
  const [selectedName, setSelectedName]     = useState('');

  // ── Formation page state ────────────────────────────────────────────────────
  const [formation, setFormation]           = useState('4-4-2');
  const [squad, setSquad]                   = useState([]);

  // ── Browser derived lists ───────────────────────────────────────────────────
  // 1. Search (case-insensitive substring on name)
  const searchedPlayers = searchQuery
    ? players.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : players;

  // 2. Position filter
  const filteredPlayers = positionFilter
    ? searchedPlayers.filter((p) => p.position === positionFilter)
    : searchedPlayers;

  // 3. Sort
  const displayedPlayers = sortPlayers(filteredPlayers, sortKey);

  const selectedPlayer = players.find((p) => p.name === selectedName) ?? null;

  function handlePositionChange(pos) {
    setPositionFilter(pos);
    setSelectedName('');
  }

  function handleSearchChange(q) {
    setSearchQuery(q);
    setSelectedName('');
  }

  function handleGenerateTeam() {
    const formationDef = FORMATIONS[formation];
    setSquad(generateTeamByFormation(players, {
      fwd: formationDef.fwd,
      mid: formationDef.mid,
      def: formationDef.def,
    }));
  }

  function handleFormationChange(newFormation) {
    setFormation(newFormation);
    setSquad([]); // clear squad so board shows empty-state until regenerated
  }

  return (
    <>
      <Header aria-label="Player Dashboard">
        <SkipToContent />
        <HeaderName prefix="" onClick={() => setPage(PAGES.BROWSER)} className="app-header-name">
          Player Dashboard
        </HeaderName>
        <HeaderNavigation aria-label="Main navigation">
          <HeaderMenuItem
            isCurrentPage={page === PAGES.BROWSER}
            onClick={() => setPage(PAGES.BROWSER)}
          >
            Player Browser
          </HeaderMenuItem>
          <HeaderMenuItem
            isCurrentPage={page === PAGES.COMPARE}
            onClick={() => setPage(PAGES.COMPARE)}
          >
            Compare Players
          </HeaderMenuItem>
          <HeaderMenuItem
            isCurrentPage={page === PAGES.FORMATION}
            onClick={() => setPage(PAGES.FORMATION)}
          >
            Team Formation
          </HeaderMenuItem>
        </HeaderNavigation>
      </Header>

      <main className="app-content">

        {/* ── Player Browser ── */}
        {page === PAGES.BROWSER && (
          <div className="app-page">
            <div className="app-browser-search">
              <PlayerSearch value={searchQuery} onChange={handleSearchChange} />
            </div>
            <div className="app-browser-filters">
              <PositionFilter value={positionFilter} onChange={handlePositionChange} />
              <PlayerSort value={sortKey} onChange={setSortKey} />
              <PlayerSelect
                players={displayedPlayers}
                selectedName={selectedName}
                onChange={setSelectedName}
              />
            </div>
            <PlayerCard player={selectedPlayer} />
            <PlayerSummary player={selectedPlayer} />
          </div>
        )}

        {/* ── Player Comparison ── */}
        {page === PAGES.COMPARE && (
          <div className="app-page app-page--wide">
            <h1 className="app-page-title">Compare Players</h1>
            <PlayerCompare players={players} />
          </div>
        )}

        {/* ── Team Formation ── */}
        {page === PAGES.FORMATION && (
          <div className="app-page app-page--formation">
            <div className="app-formation-header">
              <h1 className="app-formation-title">Team Formation Visualizer</h1>
              <Button
                kind="primary"
                size="md"
                onClick={handleGenerateTeam}
                disabled={players.length === 0}
              >
                Generate Team
              </Button>
            </div>
            <div className="app-formation-board">
              <FormationBoard
                players={squad}
                formation={formation}
                onFormationChange={handleFormationChange}
              />
            </div>
          </div>
        )}

      </main>
    </>
  );
}

export default App;
