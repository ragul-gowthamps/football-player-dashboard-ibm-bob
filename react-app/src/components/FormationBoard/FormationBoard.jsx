import React, { useState } from 'react';
import { Select, SelectItem, Tile } from '@carbon/react';

// ─── Field dimensions ─────────────────────────────────────────────────────────
const W  = 560;
const H  = 840;
const B  = 20;
const CW = W + B * 2;
const CH = H + B * 2 + 40;

const fx  = (x) => B + x;
const fy  = (y) => B + 20 + y;
const CX  = fx(W / 2);
const MID = fy(H / 2);

const PA_W  = W * 0.5;
const PA_H  = H * 0.155;
const GA_W  = PA_W * 0.5;
const GA_H  = PA_H * 0.38;
const P_OFF = PA_H * 0.71;
const ARC_R = 73;
const C_R   = 73;
const GOAL_W = PA_W * 0.46;
const GOAL_H = 20;

const L   = { fill: 'none', stroke: 'rgba(255,255,255,0.90)', strokeWidth: 1.8 };
const DOT = { fill: 'rgba(255,255,255,0.90)' };

// ─── Formation definitions ────────────────────────────────────────────────────
/**
 * Each formation maps to ROWS: array of row descriptors.
 *   indices  — which squad slot to read (squad is ordered fwd…mid…def…gk)
 *   y        — fractional field-height position (0=top, 1=bottom)
 *   numbers  — shirt numbers displayed on badges
 *
 * Squad order for all formations: forwards first, then mid, then def, then GK (index 10).
 */
export const FORMATIONS = {
  '4-4-2': {
    label: '4-4-2',
    fwd: 2, mid: 4, def: 4,
    rows: [
      { indices: [0, 1],       y: 0.11, numbers: [10, 11] },
      { indices: [2, 3, 4, 5], y: 0.33, numbers: [6, 7, 8, 9] },
      { indices: [6, 7, 8, 9], y: 0.62, numbers: [2, 3, 4, 5] },
      { indices: [10],         y: 0.87, numbers: [1] },
    ],
  },
  '4-3-3': {
    label: '4-3-3',
    fwd: 3, mid: 3, def: 4,
    rows: [
      { indices: [0, 1, 2],    y: 0.11, numbers: [9, 10, 11] },
      { indices: [3, 4, 5],    y: 0.35, numbers: [6, 7, 8] },
      { indices: [6, 7, 8, 9], y: 0.62, numbers: [2, 3, 4, 5] },
      { indices: [10],         y: 0.87, numbers: [1] },
    ],
  },
  '3-5-2': {
    label: '3-5-2',
    fwd: 2, mid: 5, def: 3,
    rows: [
      { indices: [0, 1],          y: 0.11, numbers: [10, 11] },
      { indices: [2, 3, 4, 5, 6], y: 0.33, numbers: [5, 6, 7, 8, 9] },
      { indices: [7, 8, 9],       y: 0.62, numbers: [2, 3, 4] },
      { indices: [10],            y: 0.87, numbers: [1] },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function arcIntersect(cx, cy, r, lineY) {
  const dy = lineY - cy;
  const disc = r * r - dy * dy;
  if (disc < 0) return null;
  const dx = Math.sqrt(disc);
  return { x1: cx - dx, x2: cx + dx };
}

function GoalNetPattern({ id }) {
  return (
    <defs>
      <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M 0 6 L 6 0" style={{ fill: 'none', stroke: 'rgba(255,255,255,0.35)', strokeWidth: 0.8 }} />
      </pattern>
    </defs>
  );
}

// ─── SVG Field Markings ───────────────────────────────────────────────────────
function FieldMarkings() {
  const tPA_x = fx(W / 2 - PA_W / 2), tPA_y = fy(0);
  const tGA_x = fx(W / 2 - GA_W / 2), tGA_y = fy(0);
  const tPS_y = fy(P_OFF);
  const tArc_y = fy(PA_H);
  const tArc = arcIntersect(CX, tPS_y, ARC_R, tArc_y);

  const bPA_x = fx(W / 2 - PA_W / 2), bPA_y = fy(H - PA_H);
  const bGA_x = fx(W / 2 - GA_W / 2), bGA_y = fy(H - GA_H);
  const bPS_y = fy(H - P_OFF);
  const bArc_y = fy(H - PA_H);
  const bArc = arcIntersect(CX, bPS_y, ARC_R, bArc_y);

  const CR = 9;
  const x0 = fx(0), x1 = fx(W), y0 = fy(0), y1 = fy(H);

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox={`0 0 ${CW} ${CH}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <GoalNetPattern id="netTop" /><GoalNetPattern id="netBot" />
      <rect x={CX - GOAL_W / 2} y={0}          width={GOAL_W} height={GOAL_H} style={{ fill: 'url(#netTop)', stroke: 'rgba(255,255,255,0.90)', strokeWidth: 1.8 }} />
      <rect x={CX - GOAL_W / 2} y={CH - GOAL_H} width={GOAL_W} height={GOAL_H} style={{ fill: 'url(#netBot)', stroke: 'rgba(255,255,255,0.90)', strokeWidth: 1.8 }} />
      <rect x={fx(0)} y={fy(0)} width={W} height={H} style={L} />
      <line x1={fx(0)} y1={MID} x2={fx(W)} y2={MID} style={L} />
      <circle cx={CX} cy={MID} r={C_R} style={L} />
      <circle cx={CX} cy={MID} r={3.5} style={DOT} />
      <rect x={tPA_x} y={tPA_y} width={PA_W} height={PA_H} style={L} />
      <rect x={tGA_x} y={tGA_y} width={GA_W} height={GA_H} style={L} />
      <circle cx={CX} cy={tPS_y} r={3.5} style={DOT} />
      {tArc && <path d={`M ${tArc.x1} ${tArc_y} A ${ARC_R} ${ARC_R} 0 0 0 ${tArc.x2} ${tArc_y}`} style={L} />}
      <rect x={bPA_x} y={bPA_y} width={PA_W} height={PA_H} style={L} />
      <rect x={bGA_x} y={bGA_y} width={GA_W} height={GA_H} style={L} />
      <circle cx={CX} cy={bPS_y} r={3.5} style={DOT} />
      {bArc && <path d={`M ${bArc.x1} ${bArc_y} A ${ARC_R} ${ARC_R} 0 0 1 ${bArc.x2} ${bArc_y}`} style={L} />}
      <path d={`M ${x0} ${y0 + CR} A ${CR} ${CR} 0 0 1 ${x0 + CR} ${y0}`} style={L} />
      <path d={`M ${x1 - CR} ${y0} A ${CR} ${CR} 0 0 1 ${x1} ${y0 + CR}`} style={L} />
      <path d={`M ${x0 + CR} ${y1} A ${CR} ${CR} 0 0 1 ${x0} ${y1 - CR}`} style={L} />
      <path d={`M ${x1} ${y1 - CR} A ${CR} ${CR} 0 0 1 ${x1 - CR} ${y1}`} style={L} />
    </svg>
  );
}

// ─── Hover Tooltip ────────────────────────────────────────────────────────────
function Tooltip({ player }) {
  if (!player) return null;
  const rating = player.rating != null ? `${parseFloat(player.rating).toFixed(1)} / 10` : '—';
  return (
    <div style={{
      position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(22,22,22,0.95)', color: '#fff',
      borderRadius: 6, padding: '6px 10px',
      fontSize: 11, lineHeight: 1.5, whiteSpace: 'nowrap',
      pointerEvents: 'none', zIndex: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
    }}>
      <div style={{ fontWeight: 700 }}>{player.name}</div>
      {player.position && <div>{player.position}</div>}
      {player.club     && <div>{player.club}</div>}
      <div>Rating: {rating}</div>
      {/* tooltip arrow */}
      <div style={{
        position: 'absolute', top: '100%', left: '50%',
        transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: '5px solid rgba(22,22,22,0.95)',
      }} />
    </div>
  );
}

// ─── Player Token ─────────────────────────────────────────────────────────────
const PHOTO = 40;
const BADGE = 16;

function PlayerToken({ player, number, x, y, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);

  const shortName = (() => {
    if (!player?.name) return `#${number}`;
    const parts = player.name.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : parts[0];
  })();

  const ringStyle = isSelected
    ? { outline: '3px solid #f4c430', outlineOffset: 2, borderRadius: '50%' }
    : {};

  return (
    <div
      onClick={() => player && onClick(player)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: x - PHOTO / 2,
        top:  y - PHOTO / 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: PHOTO,
        cursor: player ? 'pointer' : 'default',
      }}
    >
      <div style={{ position: 'relative', width: PHOTO, height: PHOTO, ...ringStyle }}>
        {/* Hover tooltip */}
        {hovered && player && <Tooltip player={player} />}

        {player?.photo ? (
          <img
            src={player.photo}
            alt={player.name}
            style={{
              width: PHOTO, height: PHOTO,
              borderRadius: '50%', objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.9)',
              display: 'block',
            }}
          />
        ) : (
          <div style={{
            width: PHOTO, height: PHOTO, borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)',
            border: '2px solid rgba(255,255,255,0.9)',
          }} />
        )}
        <div style={{
          position: 'absolute', top: -3, right: -3,
          width: BADGE, height: BADGE, borderRadius: '50%',
          background: '#0f62fe', border: '1.5px solid #fff',
          color: '#fff', fontSize: 9, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {number}
        </div>
      </div>
      <span style={{
        marginTop: 3, fontSize: 9, fontWeight: 600,
        color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        textAlign: 'center', whiteSpace: 'nowrap',
        maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis',
        lineHeight: 1.2,
      }}>
        {shortName}
      </span>
    </div>
  );
}

// ─── Side Panel ───────────────────────────────────────────────────────────────
function PlayerPanel({ player, onClose }) {
  if (!player) return null;
  const rating = player.rating != null ? `${parseFloat(player.rating).toFixed(1)} / 10` : '—';
  const stats = [
    { label: 'Position',    value: player.position   ?? '—' },
    { label: 'Age',         value: player.age        ?? '—' },
    { label: 'Nationality', value: player.citizenship ?? '—' },
    { label: 'Club',        value: player.club        ?? '—' },
    { label: 'Rating',      value: rating },
  ];

  return (
    <Tile style={{ width: 220, flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#525252' }}>Player</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, color: '#525252' }}
          aria-label="Close panel"
        >×</button>
      </div>
      {player.photo && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <img src={player.photo} alt={player.name}
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }} />
        </div>
      )}
      <p style={{ fontWeight: 700, fontSize: '1rem', textAlign: 'center', margin: '0 0 12px' }}>{player.name}</p>
      <dl style={{ margin: 0 }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e0e0e0' }}>
            <dt style={{ fontSize: 12, color: '#525252' }}>{label}</dt>
            <dd style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{value}</dd>
          </div>
        ))}
      </dl>
    </Tile>
  );
}

// ─── Formation Selector ───────────────────────────────────────────────────────
function FormationSelector({ value, onChange }) {
  return (
    <Select
      id="formation-select"
      labelText="Formation"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ minWidth: 140 }}
    >
      {Object.entries(FORMATIONS).map(([key, f]) => (
        <SelectItem key={key} value={key} text={f.label} />
      ))}
    </Select>
  );
}

// ─── FormationBoard ───────────────────────────────────────────────────────────

/**
 * FormationBoard
 *
 * Props:
 *   players        {Player[]}  up to 11 player objects (ordered fwd→mid→def→gk)
 *   formation      {string}    key from FORMATIONS, default '4-4-2'
 *   onFormationChange {fn}     called when user picks a different formation
 */
function FormationBoard({ players = [], formation = '4-4-2', onFormationChange }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const isEmpty = !players || players.length === 0;
  const rows = FORMATIONS[formation]?.rows ?? FORMATIONS['4-4-2'].rows;

  function handleTokenClick(player) {
    setSelectedPlayer((prev) => (prev?.name === player.name ? null : player));
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
      {/* Field */}
      <div>
        {/* Formation selector above the pitch */}
        <div style={{ marginBottom: 12 }}>
          <FormationSelector value={formation} onChange={(val) => {
            onFormationChange?.(val);
            setSelectedPlayer(null);
          }} />
        </div>

        <div style={{
          position: 'relative',
          width: CW, height: CH,
          borderRadius: 12, overflow: 'hidden',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.25), 0 6px 24px rgba(0,0,0,0.5)',
          background: 'linear-gradient(180deg, #2d8a3e 0%, #3aab50 30%, #3db554 50%, #3aab50 70%, #2d8a3e 100%)',
          border: '3px solid rgba(255,255,255,0.15)',
        }}>
          <FieldMarkings />

          {isEmpty ? (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.75)', fontSize: 16, fontWeight: 500,
              textAlign: 'center', padding: '0 2rem', pointerEvents: 'none',
            }}>
              Click Generate Team to see the formation
            </div>
          ) : (
            rows.map((row) =>
              row.indices.map((squadIdx, colIdx) => {
                const player = players[squadIdx] ?? null;
                const number = row.numbers[colIdx];
                const count  = row.indices.length;
                const px = Math.round(fx(W * (colIdx + 1) / (count + 1)));
                const py = Math.round(fy(H * row.y));
                return (
                  <PlayerToken
                    key={squadIdx}
                    player={player}
                    number={number}
                    x={px}
                    y={py}
                    isSelected={selectedPlayer?.name === player?.name}
                    onClick={handleTokenClick}
                  />
                );
              })
            )
          )}
        </div>
      </div>

      {/* Side panel — only shown when a player is selected */}
      <PlayerPanel player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </div>
  );
}

export default FormationBoard;
