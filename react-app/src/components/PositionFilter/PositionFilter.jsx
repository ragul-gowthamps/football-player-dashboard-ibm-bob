import React from 'react';
import { Select, SelectItem } from '@carbon/react';

// Canonical position labels shown in the dropdown.
// "All Positions" (empty string) means no filter.
const POSITION_OPTIONS = [
  { value: '',           label: 'All Positions' },
  { value: 'Attacker',  label: 'Attackers' },
  { value: 'Midfielder', label: 'Midfielders' },
  { value: 'Defender',  label: 'Defenders' },
  { value: 'Goalkeeper', label: 'Goalkeepers' },
];

function PositionFilter({ value, onChange }) {
  return (
    <Select
      id="position-filter"
      labelText="Position"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {POSITION_OPTIONS.map((opt) => (
        <SelectItem key={opt.value} value={opt.value} text={opt.label} />
      ))}
    </Select>
  );
}

export { POSITION_OPTIONS };
export default PositionFilter;
