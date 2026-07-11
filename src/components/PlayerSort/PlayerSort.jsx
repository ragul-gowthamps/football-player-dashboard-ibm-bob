import React from 'react';
import { Select, SelectItem } from '@carbon/react';

export const SORT_OPTIONS = [
  { value: 'name-asc',    label: 'Name (A → Z)' },
  { value: 'name-desc',   label: 'Name (Z → A)' },
  { value: 'age-asc',     label: 'Age (youngest first)' },
  { value: 'rating-desc', label: 'Rating (best first)' },
];

/**
 * Returns a new sorted copy of `players` according to `sortKey`.
 * @param {Array}  players
 * @param {string} sortKey  — one of the SORT_OPTIONS values
 * @returns {Array}
 */
export function sortPlayers(players, sortKey) {
  const arr = [...players];
  switch (sortKey) {
    case 'name-asc':
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return arr.sort((a, b) => b.name.localeCompare(a.name));
    case 'age-asc':
      return arr.sort((a, b) => (a.age ?? Infinity) - (b.age ?? Infinity));
    case 'rating-desc':
      return arr.sort((a, b) => (b.rating ?? -Infinity) - (a.rating ?? -Infinity));
    default:
      return arr;
  }
}

function PlayerSort({ value, onChange }) {
  return (
    <Select
      id="player-sort"
      labelText="Sort by"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {SORT_OPTIONS.map((opt) => (
        <SelectItem key={opt.value} value={opt.value} text={opt.label} />
      ))}
    </Select>
  );
}

export default PlayerSort;
