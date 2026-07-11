import React from 'react';
import { Tile } from '@carbon/react';
import './_player-summary.scss';

function formDescription(rating) {
  if (rating == null) return null;
  const r = parseFloat(rating);
  if (r >= 8.0) return 'in strong form';
  if (r >= 6.0) return 'showing consistent form';
  return 'building form';
}

function buildSummary(player) {
  const { name, position, age, citizenship, club, rating } = player;
  const parts = [];

  // Opening sentence — always present (name is always set)
  const opening = [
    name,
    position  ? `is a ${position}` : null,
    club      ? `playing for ${club}` : null,
  ].filter(Boolean).join(' ');
  parts.push(`${opening}.`);

  // Personal details sentence
  const personal = [
    age         ? `${age} years old` : null,
    citizenship ? `a ${citizenship} international` : null,
  ].filter(Boolean);
  if (personal.length) parts.push(`${name} is ${personal.join(' and ')}.`);

  // Form sentence
  const form = formDescription(rating);
  if (form) parts.push(`${name} is currently ${form}.`);

  parts.push('This profile is based on the available dataset only.');

  return parts.join(' ');
}

function PlayerSummary({ player }) {
  if (!player) return null;

  return (
    <Tile className="player-summary">
      <h3 className="player-summary__label">Player Summary</h3>
      <p className="player-summary__text">{buildSummary(player)}</p>
      <p className="player-summary__source">
        This summary is based only on the loaded dataset.
      </p>
    </Tile>
  );
}

export default PlayerSummary;
