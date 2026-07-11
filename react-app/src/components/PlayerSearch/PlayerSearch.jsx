import React from 'react';
import { Search } from '@carbon/react';

/**
 * PlayerSearch — controlled text input that filters the player list.
 *
 * Props:
 *   value     {string}   current search string
 *   onChange  {function} called with new string value on every keystroke
 */
function PlayerSearch({ value, onChange }) {
  return (
    <Search
      id="player-search"
      labelText="Search players"
      placeholder="Search by name…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClear={() => onChange('')}
      size="md"
    />
  );
}

export default PlayerSearch;
