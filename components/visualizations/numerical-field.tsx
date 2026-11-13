'use client';
import {useEffect, useRef, useId, useState} from 'react';

export function NumericalField({label}: {label: string}) {
  const terrain = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = terrain.current;
    if (!host) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    void import('./terrain-renderer').then(({mountTerrain}) => {
      if (!cancelled) dispose = mountTerrain(host);
    }).catch(() => {if (!cancelled) host.dataset.terrainState = 'fallback';});
    return () => {cancelled = true; dispose?.();};
  }, []);
  return <div className="numerical-field-wrap reference-artwork" role="img" aria-label={label}>
    <div className="reference-artwork-still" aria-hidden="true" />
    <div className="reference-artwork-text-mask" aria-hidden="true" />
    <div className="terrain-3d" ref={terrain} aria-hidden="true" />
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
    <div className="representation-scroll" tabIndex={0} role="region" aria-label={label}>
    <svg className="representation-map" viewBox="0 0 1100 580" role="group" aria-label={label}>
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
          return <circle key={index} cx={(Math.cos(angle) * 38).toFixed(4)} cy={(Math.sin(angle) * 30).toFixed(4)} r={index % 3 === 0 ? 3.5 : 2} fill="#d9f397" opacity={.5 + index * .04} />;
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
    </svg></div>
  </div>;
}
