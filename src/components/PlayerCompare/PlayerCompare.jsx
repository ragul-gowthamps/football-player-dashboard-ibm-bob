import React from 'react';
import { Tile } from '@carbon/react';
import PlayerSelect from '../PlayerSelect/PlayerSelect';
import './_player-compare.scss';

function formatRating(rating) {
  if (rating == null) return '—';
  return `${parseFloat(rating).toFixed(1)} / 10`;
}

const STATS = [
  { label: 'Position',    key: 'position'    },
  { label: 'Age',         key: 'age'         },
  { label: 'Nationality', key: 'citizenship' },
  { label: 'Club',        key: 'club'        },
  { label: 'Rating',      key: 'rating', format: formatRating },
];

function CompareCard({ player, players, selectedName, onSelect, slot }) {
  return (
    <div className="compare-slot">
      <PlayerSelect
        id={`compare-select-${slot}`}
        players={players}
        selectedName={selectedName}
        onChange={onSelect}
      />
      {player ? (
        <Tile className="compare-card">
          {player.photo && (
            <div className="compare-card__photo-wrap">
              <img
                src={player.photo}
                alt={player.name}
                className="compare-card__photo"
              />
            </div>
          )}
          <h3 className="compare-card__name">{player.name}</h3>
          <dl className="compare-card__stats">
            {STATS.map(({ label, key, format }) => (
              <div key={key} className="compare-card__row">
                <dt className="compare-card__label">{label}</dt>
                <dd className="compare-card__value">
                  {format ? format(player[key]) : (player[key] ?? '—')}
                </dd>
              </div>
            ))}
          </dl>
        </Tile>
      ) : (
        <div className="compare-empty">Select a player to compare</div>
      )}
    </div>
  );
}

function PlayerCompare({ players }) {
  const [nameA, setNameA] = React.useState('');
  const [nameB, setNameB] = React.useState('');

  const playerA = players.find((p) => p.name === nameA) ?? null;
  const playerB = players.find((p) => p.name === nameB) ?? null;

  return (
    <div className="player-compare">
      <CompareCard slot="a" players={players} selectedName={nameA} onSelect={setNameA} player={playerA} />
      <div className="compare-divider">VS</div>
      <CompareCard slot="b" players={players} selectedName={nameB} onSelect={setNameB} player={playerB} />
    </div>
  );
}

export default PlayerCompare;
