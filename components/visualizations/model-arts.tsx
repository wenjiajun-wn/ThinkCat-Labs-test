'use client';
import {useId, useRef, useState} from 'react';
import type {ModelId} from '../../config/models';
import {RepresentationMap} from './numerical-field';

const COLUMNS = ['c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08', 'c09', 'c10'];
const ROWS = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08'];

function matrixValue(row: number, column: number) {
  const signal = Math.sin(row * 1.7 + column * .8) * .3 + Math.cos(column * 1.3) * .18 + .5;
  return Math.min(.98, Math.max(.04, signal + (column > 6 ? .16 : 0) + (row === 3 ? .08 : 0)));
}

function level(value: number) {
  return value > .82 ? 4 : value > .64 ? 3 : value > .46 ? 2 : value > .28 ? 1 : 0;
}

export function TabularMatrix({
  label,
  axisX,
  axisY,
  legend,
  selectedLabel,
  instruction,
  reading,
}:{
  label: string;
  axisX: string;
  axisY: string;
  legend: string;
  selectedLabel: string;
  instruction: string;
  reading: string;
}) {
  const [selected, setSelected] = useState({row: 3, column: 7});
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeValue = matrixValue(selected.row, selected.column);

  function focusCell(row: number, column: number) {
    const nextRow = Math.max(0, Math.min(ROWS.length - 1, row));
    const nextColumn = Math.max(0, Math.min(COLUMNS.length - 1, column));
    setSelected({row: nextRow, column: nextColumn});
    refs.current[nextRow * COLUMNS.length + nextColumn]?.focus();
  }

  return <div className="tabular-study">
    <div className="tabular-matrix-head">
      <div>
        <p className="mono-label">{label}</p>
        <p className="matrix-instruction">{instruction}</p>
      </div>
      <div className="matrix-readout" aria-live="polite">
        <span className="mono-label">{selectedLabel}</span>
        <strong>{ROWS[selected.row]}.{COLUMNS[selected.column]}</strong>
        <span className="matrix-value">{activeValue.toFixed(2)}</span>
        <span className="matrix-bar"><i style={{transform: `scaleX(${activeValue})`}} /></span>
      </div>
    </div>
    <div className="matrix-x-label mono-label">{axisX} →</div>
    <div className="matrix-shell">
      <div className="matrix-y-label mono-label">{axisY} ↓</div>
      <table className="tabular-table" onKeyDown={event => {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'ArrowUp') focusCell(selected.row - 1, selected.column);
        if (event.key === 'ArrowDown') focusCell(selected.row + 1, selected.column);
        if (event.key === 'ArrowLeft') focusCell(selected.row, selected.column - 1);
        if (event.key === 'ArrowRight') focusCell(selected.row, selected.column + 1);
      }}>
        <caption className="visually-hidden">{label}</caption>
        <thead><tr><th scope="col" aria-label={axisY} /><>{COLUMNS.map(column => <th key={column} scope="col">{column}</th>)}</></tr></thead>
        <tbody>{ROWS.map((row, rowIndex) => <tr key={row}>
          <th scope="row">{row}</th>
          {COLUMNS.map((column, columnIndex) => {
            const value = matrixValue(rowIndex, columnIndex);
            const isSelected = rowIndex === selected.row && columnIndex === selected.column;
            return <td key={column}>
              <button
                ref={element => { refs.current[rowIndex * COLUMNS.length + columnIndex] = element; }}
                type="button"
                className="matrix-cell"
                data-level={level(value)}
                data-selected={isSelected || undefined}
                tabIndex={isSelected ? 0 : -1}
                aria-label={`${row} ${column} ${value.toFixed(2)}`}
                aria-pressed={isSelected}
                onFocus={() => setSelected({row: rowIndex, column: columnIndex})}
                onClick={() => setSelected({row: rowIndex, column: columnIndex})}
              ><span>{value.toFixed(2)}</span></button>
            </td>;
          })}
        </tr>)}</tbody>
      </table>
    </div>
    <div className="matrix-foot">
      <div className="matrix-legend">
        <span>{legend}</span>
        <div aria-hidden="true">{[0, 1, 2, 3, 4].map(item => <i key={item} data-level={item} />)}</div>
      </div>
      <p>{reading}</p>
    </div>
  </div>;
}

const series = Array.from({length: 98}, (_, index) => {
  const trend = index * .26;
  const cycle = Math.sin(index * .22) * 30 + Math.cos(index * .57) * 12 + Math.sin(index * 1.1) * 4;
  return {index, value: 240 - trend - cycle};
});

export function TimeSeriesStudy({
  label,
  observedLabel,
  forecastLabel,
  intervalLabel,
  originLabel,
  scrubLabel,
  horizonLabel,
}:{
  label: string;
  observedLabel: string;
  forecastLabel: string;
  intervalLabel: string;
  originLabel: string;
  scrubLabel: string;
  horizonLabel: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [origin, setOrigin] = useState(62);
  const plot = (start: number, end: number) => series.slice(start, end).map(({index, value}) => `${22 + index * 10.2},${value.toFixed(1)}`).join(' ');
  const forecast = series.slice(origin);
  const band = [
    ...forecast.map(({index, value}, offset) => `${22 + index * 10.2},${(value - 12 - offset * 1.2).toFixed(1)}`),
    ...forecast.map(({index, value}, offset) => `${22 + index * 10.2},${(value + 12 + offset * 1.2).toFixed(1)}`).reverse(),
  ].join(' ');
  const originX = 22 + origin * 10.2;

  return <div className="time-study">
    <div className="time-legend">
      <span><i data-kind="observed" />{observedLabel}</span>
      <span><i data-kind="forecast" />{forecastLabel}</span>
      <span><i data-kind="band" />{intervalLabel}</span>
    </div>
    <svg className="time-plot" viewBox="0 0 1050 390" role="img" aria-label={label}>
      <defs>
        <linearGradient id={id + 'band'} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#d9f397" stopOpacity=".28" />
          <stop offset="1" stopColor="#d9f397" stopOpacity=".02" />
        </linearGradient>
        <linearGradient id={id + 'area'} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#d9f397" stopOpacity=".18" />
          <stop offset="1" stopColor="#d9f397" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1050" height="390" fill="#111a13" />
      <g className="time-grid">
        {[52, 116, 180, 244, 308].map(y => <line key={y} x1="22" x2="1028" y1={y} y2={y} />)}
        {[0, 24, 48, 72, 96].map(index => <line key={index} x1={22 + index * 10.2} x2={22 + index * 10.2} y1="40" y2="330" />)}
      </g>
      <path d={`M22 330 L${series.map(({index, value}) => `${22 + index * 10.2} ${value}`).join(' L')} L1028 330 Z`} fill={`url(#${id}area)`} />
      <polygon points={band} fill={`url(#${id}band)`} />
      <polyline points={plot(0, origin + 1)} fill="none" stroke="#d9f397" strokeWidth="2.4" />
      <polyline points={plot(origin, series.length)} fill="none" stroke="#d9f397" strokeWidth="2" strokeDasharray="5 6" opacity=".9" />
      <line x1={originX} x2={originX} y1="38" y2="330" stroke="#d9f397" strokeOpacity=".6" strokeDasharray="2 6" />
      <g className="time-origin" style={{transform: `translateX(${originX}px)`}}>
        <circle cx="0" cy="330" r="4" fill="#d9f397" />
        <rect x="-52" y="344" width="104" height="26" rx="2" fill="#d9f397" />
        <text x="0" y="361" textAnchor="middle">{originLabel} {String(origin).padStart(2, '0')}</text>
      </g>
      <g className="time-axis">
        {Array.from({length: 7}, (_, index) => <text key={index} x={22 + index * 168} y="382">{String(index * 16).padStart(2, '0')}</text>)}
      </g>
      {[52, 116, 180, 244, 308].map(y => <text key={y} x="1036" y={y + 4} textAnchor="end">{Math.round((330 - y) / 2.4)}</text>)}
    </svg>
    <div className="time-controls">
      <label>
        <span className="mono-label">{scrubLabel}</span>
        <input type="range" min="28" max="84" value={origin} onChange={event => setOrigin(Number(event.target.value))} />
      </label>
      <div className="time-meta">
        <span className="mono-label">{originLabel} <strong>{String(origin).padStart(2, '0')}</strong></span>
        <span className="mono-label">{horizonLabel} <strong>{String(series.length - origin).padStart(2, '0')}</strong></span>
      </div>
    </div>
  </div>;
}

export function UnifiedStudy({
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
  return <RepresentationMap
    label={label}
    tableLabel={tableLabel}
    seriesLabel={seriesLabel}
    sharedLabel={sharedLabel}
    instruction={instruction}
    caption={caption}
  />;
}

export function ModelGlyph({id}:{id: ModelId}) {
  const unique = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  if (id === 'tabular') {
    return <svg className="model-glyph" viewBox="0 0 320 190" aria-hidden="true">
      <defs><linearGradient id={unique + 't'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4f6b3f" /><stop offset="1" stopColor="#d9f397" /></linearGradient></defs>
      {Array.from({length: 48}, (_, index) => {
        const col = index % 8;
        const row = Math.floor(index / 8);
        const value = matrixValue(row, col);
        return <rect key={index} x={20 + col * 35} y={18 + row * 26} width="28" height="19" fill={`url(#${unique}t)`} opacity={.15 + value * .82} />;
      })}
      <path d="M302 10v170M10 170h292" stroke="#d9f397" strokeOpacity=".3" />
    </svg>;
  }
  if (id === 'time-series') {
    return <svg className="model-glyph" viewBox="0 0 320 190" aria-hidden="true">
      {Array.from({length: 5}, (_, row) => <polyline key={row} points={Array.from({length: 42}, (_, index) => `${18 + index * 7},${55 + row * 22 + Math.sin(index * .32 + row) * 13}`).join(' ')} fill="none" stroke="#d9f397" strokeOpacity={.16 + row * .11} strokeWidth={row === 2 ? 2 : .9} />)}
      <path d="M214 16v158M214 16h86v158h-86" fill="none" stroke="#d9f397" strokeOpacity=".4" strokeDasharray="3 5" />
    </svg>;
  }
  return <svg className="model-glyph" viewBox="0 0 320 190" aria-hidden="true">
    <g fill="none" stroke="#d9f397">
      {Array.from({length: 10}, (_, index) => <path key={index} d={`M36 ${33 + index * 13} C 120 ${18 + index * 8}, 170 ${160 - index * 9}, 282 ${40 + index * 12}`} opacity={.18 + index * .055} />)}
    </g>
    {[72, 160, 246].map((x, index) => <circle key={x} cx={x} cy={95 + Math.sin(index) * 22} r={index === 1 ? 9 : 5} fill="#d9f397" />)}
    <circle cx="160" cy="95" r="54" fill="none" stroke="#d9f397" strokeOpacity=".38" strokeDasharray="2 7" />
  </svg>;
}
