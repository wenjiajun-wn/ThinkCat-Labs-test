'use client';
import {useId, useState} from 'react';

const COLS = 64;
const ROWS = 32;

function surfaceHeight(x: number, y: number) {
  const ridgeA = Math.exp(-((x - 0.62 + y * 0.18) ** 2) / 0.035);
  const ridgeB = Math.exp(-((x - 0.24 + y * 0.1) ** 2) / 0.08) * 0.42;
  const signal = 0.72 + 0.2 * Math.cos(y * 7.2 - x * 5.4);
  const ripple = 0.055 * Math.sin(x * 26 + y * 13) + 0.035 * Math.cos(y * 31);
  return (ridgeA * signal + ridgeB * 0.7 + ripple + 0.08);
}

function project(x: number, y: number, height: number) {
  const px = 156 + x * 980 + y * 236;
  const py = 582 + y * 172 - height * 356 - x * 64;
  return [px, py] as const;
}

const fieldRows = Array.from({length: ROWS + 1}, (_, row) => {
  const y = row / ROWS;
  return Array.from({length: COLS + 1}, (_, col) => {
    const x = col / COLS;
    const height = surfaceHeight(x, y);
    const [px, py] = project(x, y, height);
    return {px, py, x, y, height};
  });
});

const fieldPolygons = fieldRows.slice(0, -1).map((row, index) => {
  const next = fieldRows[index + 1];
  return [...row, ...next.slice().reverse()].map(point => `${point.px.toFixed(1)},${point.py.toFixed(1)}`).join(' ');
});

const ticks = [0, 16, 32, 48, 64] as const;
const planePoint = (x: number, y: number) => project(x, y, 0).join(',');

export function NumericalField({label}:{label: string}) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  return <div className="numerical-field-wrap">
    <svg
      className="numerical-field"
      viewBox="106 145 1300 655"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={id + 'surface'} x1="0" y1="1" x2=".84" y2="0" gradientUnits="objectBoundingBox">
          <stop stopColor="#142219" />
          <stop offset=".4" stopColor="#2e4930" />
          <stop offset=".76" stopColor="#789d52" />
          <stop offset="1" stopColor="#d7f294" />
        </linearGradient>
        <linearGradient id={id + 'edge'} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#5e7c58" stopOpacity=".08" />
          <stop offset=".53" stopColor="#d9f397" stopOpacity=".83" />
          <stop offset="1" stopColor="#91ad7c" stopOpacity=".29" />
        </linearGradient>
        <radialGradient id={id + 'glow'}>
          <stop stopColor="#7a9d4e" stopOpacity=".38" />
          <stop offset="1" stopColor="#101810" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="830" cy="470" rx="560" ry="340" fill={`url(#${id}glow)`} />
      <g className="field-grid" fill="none">
        {Array.from({length: 17}, (_, index) => {
          const x = index / 16;
          return <path key={index} d={`M${planePoint(x, 0)} L${planePoint(x, 1)}`} />;
        })}
        {Array.from({length: 9}, (_, index) => {
          const y = index / 8;
          return <path key={index} d={`M${planePoint(0, y)} L${planePoint(1, y)}`} />;
        })}
      </g>
      <g className="field-mesh">
        {fieldPolygons.map((points, index) => <polygon
          key={`p-${index}`}
          points={points}
          fill={`url(#${id}surface)`}
          opacity={0.20 + index * 0.016}
        />)}
        {fieldRows.map((row, index) => <polyline
          key={`r-${index}`}
          points={row.map(point => `${point.px.toFixed(1)},${point.py.toFixed(1)}`).join(' ')}
          fill="none"
          stroke={`url(#${id}edge)`}
          strokeWidth={index % 4 === 0 ? 1.8 : 0.7}
          opacity={index % 4 === 0 ? 0.92 : 0.4}
        />)}
        {Array.from({length: 17}, (_, index) => <polyline
          key={`c-${index}`}
          points={fieldRows.map(row => {
            const point = row[index * 4];
            return `${point.px.toFixed(1)},${point.py.toFixed(1)}`;
          }).join(' ')}
          fill="none"
          stroke="#d9f397"
          strokeWidth=".55"
          opacity=".19"
        />)}
      </g>
      <g className="field-axis" aria-hidden="true">
        <path d={`M${planePoint(0, 1)} L${planePoint(1, 1)}`} stroke="#d9f397" strokeOpacity=".28" />
        {ticks.map(value => {
          const [x, y] = project(value / COLS, 1, 0);
          return <g key={value}>
            <path d={`M${x} ${y} v10`} stroke="#d9f397" strokeOpacity=".45" />
            <text x={x} y={y + 34} textAnchor="middle">{String(value).padStart(2, '0')}</text>
          </g>;
        })}
      </g>
    </svg>
  </div>;
}

const pairs = [
  {table: 'col_01', channel: 't-04', strength: 0.82},
  {table: 'col_03', channel: 't-02', strength: 0.66},
  {table: 'col_05', channel: 't-07', strength: 0.74},
  {table: 'col_06', channel: 't-01', strength: 0.52},
] as const;

export function RepresentationMap({
  label,
  tableLabel,
  seriesLabel,
  sharedLabel,
  instruction,
  caption,
}:{
  label: string;
  tableLabel: string;
  seriesLabel: string;
  sharedLabel: string;
  instruction: string;
  caption: string;
}) {
  const [active, setActive] = useState(-1);
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  return <div className="representation-outer">
    <p className="mono-label representation-instruction">{instruction}</p>
    <svg className="representation-map" viewBox="0 0 1100 580" role="img" aria-label={label}>
      <defs>
        <linearGradient id={id + 'left'} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#d9f397" stopOpacity=".2" />
          <stop offset="1" stopColor="#d9f397" stopOpacity=".02" />
        </linearGradient>
        <radialGradient id={id + 'core'}>
          <stop stopColor="#d9f397" stopOpacity=".45" />
          <stop offset="1" stopColor="#d9f397" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id + 'arc'} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#d9f397" stopOpacity=".1" />
          <stop offset=".5" stopColor="#d9f397" stopOpacity=".8" />
          <stop offset="1" stopColor="#d9f397" stopOpacity=".1" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1100" height="580" fill="#121b14" />
      <ellipse cx="550" cy="290" rx="310" ry="250" fill={`url(#${id}core)`} opacity=".45" />
      <g className="map-section-labels">
        <text x="62" y="46">{tableLabel.toUpperCase()}</text>
        <text x="550" y="46" textAnchor="middle">{sharedLabel.toUpperCase()}</text>
        <text x="1038" y="46" textAnchor="end">{seriesLabel.toUpperCase()}</text>
      </g>
      <g className="map-table" transform="translate(56 92)">
        <rect width="282" height="374" fill={`url(#${id}left)`} stroke="#d9f397" strokeOpacity=".18" />
        {Array.from({length: 6}, (_, col) => <g key={col}>
          <rect x={22 + col * 42} y="22" width="30" height="40" fill="#d9f397" fillOpacity={col === 0 ? .62 : .12 + col * .07} />
          {Array.from({length: 7}, (_, row) => <rect
            key={row}
            x={22 + col * 42}
            y={78 + row * 38}
            width="30"
            height="24"
            fill="#d9f397"
            fillOpacity={.08 + ((col * 7 + row) % 5) * .055}
          />)}
        </g>)}
        <text x="22" y="360" className="map-small">{tableLabel}</text>
      </g>
      <g className="map-channels" transform="translate(760 92)">
        {Array.from({length: 7}, (_, channel) => {
          const points = Array.from({length: 76}, (_, index) => {
            const x = 14 + index * 3.7;
            const y = 42 + channel * 46 + Math.sin(index * .22 + channel * 1.5) * 13 + Math.cos(index * .58) * 6;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(' ');
          return <polyline key={channel} points={points} fill="none" stroke="#d9f397" strokeOpacity={.18 + channel * .06} strokeWidth={channel === 2 ? 1.7 : .7} />;
        })}
        <rect width="282" height="374" fill="none" stroke="#d9f397" strokeOpacity=".18" />
        <text x="262" y="360" textAnchor="end" className="map-small">{seriesLabel}</text>
      </g>
      <g className="map-core" transform="translate(550 290)">
        <circle r="86" fill="none" stroke="#d9f397" strokeOpacity=".18" />
        <circle r="55" fill="none" stroke="#d9f397" strokeOpacity=".3" strokeDasharray="2 8" />
        {Array.from({length: 10}, (_, index) => {
          const angle = index * Math.PI / 5;
          return <circle key={index} cx={Math.cos(angle) * 38} cy={Math.sin(angle) * 30} r={index % 3 === 0 ? 3.5 : 2} fill="#d9f397" opacity={.5 + index * .04} />;
        })}
        <text y="3" textAnchor="middle" className="map-core-label">{sharedLabel}</text>
      </g>
      {pairs.map((pair, index) => {
        const leftY = 158 + index * 74;
        const rightY = 150 + index * 59;
        const isActive = active === index;
        return <g
          key={pair.table}
          className={`map-link${isActive ? ' is-active' : ''}`}
          tabIndex={0}
          role="button"
          aria-pressed={isActive}
          aria-label={`${pair.table} ↔ ${pair.channel} ${Math.round(pair.strength * 100)}%`}
          onPointerEnter={() => setActive(index)}
          onPointerLeave={() => setActive(-1)}
          onFocus={() => setActive(index)}
          onBlur={() => setActive(-1)}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setActive(isActive ? -1 : index);
            }
            if (event.key === 'Escape') setActive(-1);
          }}
        >
          <path
            d={`M338 ${leftY + 92} C 440 ${leftY + 92}, 430 290, 494 290`}
            fill="none"
            stroke={isActive ? '#d9f397' : `url(#${id}arc)`}
            strokeWidth={isActive ? 2 : 1}
            opacity={isActive ? 1 : .55}
          />
          <path
            d={`M606 290 C 690 290, 680 ${rightY + 92}, 760 ${rightY + 92}`}
            fill="none"
            stroke={isActive ? '#d9f397' : `url(#${id}arc)`}
            strokeWidth={isActive ? 2 : 1}
            opacity={isActive ? 1 : .55}
          />
          <circle cx="338" cy={leftY + 92} r={isActive ? 4 : 2.5} fill="#d9f397" />
          <circle cx="760" cy={rightY + 92} r={isActive ? 4 : 2.5} fill="#d9f397" />
          <text x="550" y={216 + index * 12} textAnchor="middle" className="map-link-label" opacity={isActive ? 1 : 0}>{pair.strength.toFixed(2)}</text>
        </g>;
      })}
      <text x="550" y="550" textAnchor="middle" className="map-caption">{caption}</text>
    </svg>
  </div>;
}
