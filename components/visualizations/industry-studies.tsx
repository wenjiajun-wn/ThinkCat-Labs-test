'use client';
import {useState, type ReactElement} from 'react';
import {solutionsCopy, type IndustryId} from '../../content/solutions';
import type {Locale} from '../../config/i18n';

type Common = {locale: Locale; studyIndex: number};

function StudyMeta({locale, index, title}:{locale: Locale; index: number; title: string}) {
  const t = solutionsCopy[locale];
  return <div className="industry-meta">
    <span className="mono-label">0{index + 1} / {t.studies[index].name}</span>
    <span className="mono-label">{t.studies[index].label} / {t.labels.synthetic}</span>
    <h2>{title}</h2>
  </div>;
}

function StudyCopy({locale, index}:{locale: Locale; index: number}) {
  const t = solutionsCopy[locale];
  const study = t.studies[index];
  return <div className="industry-copy">
    <p className="industry-summary">{study.summary}</p>
    <dl>
      <div><dt>{t.labels.question}</dt><dd>{study.question}</dd></div>
      <div><dt>{t.labels.reading}</dt><dd>{study.reading}</dd></div>
      <div><dt>{t.labels.signals}</dt><dd>{study.signals.join(' / ')}</dd></div>
    </dl>
    <p className="industry-note">{study.note}</p>
  </div>;
}

const baselineBars = [26, 34, 48, 70, 96, 128, 168, 212, 250, 274, 268, 248, 216, 180, 142, 108, 80, 58];
const shiftedBars = [22, 28, 38, 54, 76, 108, 148, 196, 240, 272, 280, 278, 262, 238, 208, 176, 148, 124];
const thresholdIndex = 11;

export function FinanceStudy({locale, studyIndex}: Common) {
  const t = solutionsCopy[locale];
  const [mode, setMode] = useState<'baseline' | 'shifted'>('baseline');
  const bars = mode === 'baseline' ? baselineBars : shiftedBars;
  const max = 300;
  const total = bars.reduce((sum, value) => sum + value, 0);
  const above = bars.slice(thresholdIndex).reduce((sum, value) => sum + value, 0) / total;
  const baselineAbove = baselineBars.slice(thresholdIndex).reduce((sum, value) => sum + value, 0) / baselineBars.reduce((sum, value) => sum + value, 0);
  const line = bars.map((value, index) => `${46 + index * 35},${330 - value * .86}`).join(' ');

  return <article className="industry-study industry-finance" id="finance">
    <StudyMeta locale={locale} index={studyIndex} title={t.studies[studyIndex].title} />
    <div className="industry-finance-grid">
      <StudyCopy locale={locale} index={studyIndex} />
      <figure className="industry-figure industry-finance-figure">
        <div className="industry-figure-top">
          <div className="toggle-group" role="group" aria-label={t.labels.baseline}>
            <button type="button" aria-pressed={mode === 'baseline'} onClick={() => setMode('baseline')}>{t.labels.baseline}</button>
            <button type="button" aria-pressed={mode === 'shifted'} onClick={() => setMode('shifted')}>{t.labels.shifted}</button>
          </div>
          <span className="mono-label">{t.labels.synthetic}</span>
        </div>
        <svg viewBox="0 0 700 390" role="img" aria-label={t.studies[studyIndex].title}>
          <g className="finance-grid">
            {[70, 140, 210, 280].map(y => <line key={y} x1="38" x2="670" y1={y} y2={y} />)}
          </g>
          {bars.map((value, index) => {
            const height = value * .86;
            const isAbove = index >= thresholdIndex;
            return <rect
              key={index}
              className="finance-bar"
              x={46 + index * 35}
              y={330 - max * .86}
              width="22"
              height={max * .86}
              fill={isAbove ? '#d9f397' : '#708a62'}
              opacity={isAbove ? .86 : .52}
              style={{transform: `scaleY(${height / (max * .86)})`}}
            />;
          })}
          <polyline points={line} fill="none" stroke="#d9f397" strokeWidth="2" />
          <line x1={46 + thresholdIndex * 35} x2={46 + thresholdIndex * 35} y1="44" y2="336" stroke="#d9f397" strokeDasharray="4 7" strokeOpacity=".7" />
          <text x={46 + thresholdIndex * 35 + (thresholdIndex > 9 ? -8 : 8)} y="62" textAnchor={thresholdIndex > 9 ? 'end' : 'start'} className="chart-small">{t.labels.threshold}</text>
          <line x1="38" x2="670" y1="330" y2="330" stroke="currentColor" strokeOpacity=".35" />
          <text x="46" y="370" className="chart-small">{t.labels.baselineShort}</text>
          <text x="670" y="370" textAnchor="end" className="chart-small">{t.labels.tail}</text>
        </svg>
        <div className="finance-readout" aria-live="polite">
          <span className="mono-label">{t.labels.threshold}</span>
          <strong>{Math.round(above * 100)}%</strong>
          <span className="finance-delta">+{Math.max(0, Math.round((above - baselineAbove) * 100))}pt / {mode === 'baseline' ? t.labels.baseline : t.labels.shifted}</span>
        </div>
        <figcaption><span>{t.studies[studyIndex].note}</span><span>{t.labels.synthetic}</span></figcaption>
      </figure>
    </div>
  </article>;
}

function energyValue(hour: number) {
  return .38 + .26 * Math.sin((hour - 5.8) / 24 * Math.PI * 2) + .11 * Math.sin((hour - 2) / 12 * Math.PI * 2) + .05 * Math.cos(hour * .8);
}

export function EnergyStudy({locale, studyIndex}: Common) {
  const t = solutionsCopy[locale];
  const [hour, setHour] = useState(9);
  const points = Array.from({length: 25}, (_, index) => ({hour: index, value: energyValue(index % 24)}));
  const path = points.map((point, index) => `${44 + index * 25},${300 - point.value * 260}`).join(' ');
  const area = `M44 300 L${path.replaceAll(' ', ' L')} L644 300 Z`;
  const value = energyValue(hour);
  const markerX = 44 + hour * 25;
  const markerY = 300 - value * 260;

  return <article className="industry-study industry-energy" id="energy">
    <StudyMeta locale={locale} index={studyIndex} title={t.studies[studyIndex].title} />
    <div className="industry-energy-grid">
      <StudyCopy locale={locale} index={studyIndex} />
      <figure className="industry-figure industry-energy-figure">
        <div className="industry-figure-top">
          <span className="mono-label">{t.studies[studyIndex].label}</span>
          <span className="energy-readout" aria-live="polite"><span className="mono-label">{t.labels.selected}</span><strong>{String(hour).padStart(2, '0')}:00 / {(value * 100).toFixed(0)}</strong></span>
        </div>
        <svg viewBox="0 0 700 360" role="img" aria-label={t.studies[studyIndex].title}>
          <defs><linearGradient id="energy-area" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#d9f397" stopOpacity=".25" /><stop offset="1" stopColor="#d9f397" stopOpacity="0" /></linearGradient></defs>
          <rect width="700" height="360" fill="transparent" />
          <g className="energy-bands">
            <rect x="44" y="28" width="250" height="260" fill="#d9f397" opacity=".035" />
            <rect x="419" y="28" width="225" height="260" fill="#d9f397" opacity=".05" />
          </g>
          <g className="energy-grid">{[66, 124, 182, 240, 298].map(y => <line key={y} x1="44" x2="644" y1={y} y2={y} />)}{[0, 6, 12, 18, 24].map(index => <line key={index} x1={44 + index * 25} x2={44 + index * 25} y1="28" y2="300" />)}</g>
          <path d={area} fill="url(#energy-area)" />
          <polyline points={path} fill="none" stroke="#d9f397" strokeWidth="2.2" />
          <line x1={markerX} x2={markerX} y1="28" y2="300" stroke="#d9f397" strokeOpacity=".6" strokeDasharray="3 6" />
          <circle cx={markerX} cy={markerY} r="6" fill="#d9f397" />
          <circle cx={markerX} cy={markerY} r="13" fill="none" stroke="#d9f397" opacity=".45" />
          {[0, 6, 12, 18, 24].map(index => <text key={index} x={44 + index * 25} y="328" textAnchor="middle" className="chart-small">{String(index).padStart(2, '0')}</text>)}
        </svg>
        <label className="chart-slider">
          <span className="mono-label">{t.labels.scrub}</span>
          <input type="range" min="0" max="23" value={hour} onChange={event => setHour(Number(event.target.value))} />
        </label>
        <figcaption><span>{t.studies[studyIndex].note}</span><span>{t.labels.synthetic}</span></figcaption>
      </figure>
    </div>
  </article>;
}

const healthPairs = [
  {points: Array.from({length: 38}, (_, index) => ({x: 72 + (index * 79) % 500, y: 80 + ((index * 47) % 240)})), ellipses: [{cx: 260, cy: 200, rx: 110, ry: 58}, {cx: 470, cy: 130, rx: 62, ry: 38}]},
  {points: Array.from({length: 38}, (_, index) => ({x: 72 + ((index * 61) % 500), y: 64 + ((index * 83) % 262)})), ellipses: [{cx: 280, cy: 150, rx: 100, ry: 72}, {cx: 420, cy: 260, rx: 70, ry: 48}]},
];

export function HealthStudy({locale, studyIndex}: Common) {
  const t = solutionsCopy[locale];
  const [pair, setPair] = useState(0);
  const data = healthPairs[pair];
  return <article className="industry-study industry-health" id="health">
    <StudyMeta locale={locale} index={studyIndex} title={t.studies[studyIndex].title} />
    <div className="industry-health-grid">
      <figure className="industry-figure industry-health-figure">
        <div className="industry-figure-top">
          <div className="toggle-group" role="group" aria-label={t.labels.pair}>
            <button type="button" aria-pressed={pair === 0} onClick={() => setPair(0)}>A / B</button>
            <button type="button" aria-pressed={pair === 1} onClick={() => setPair(1)}>C / D</button>
          </div>
          <span className="mono-label">{t.labels.synthetic}</span>
        </div>
        <svg viewBox="0 0 660 350" role="img" aria-label={t.studies[studyIndex].title}>
          <g className="health-grid">{[70, 140, 210, 280].map(y => <line key={y} x1="42" x2="630" y1={y} y2={y} />)}{[90, 210, 330, 450, 570].map(x => <line key={x} x1={x} x2={x} y1="48" y2="290" />)}</g>
          {data.ellipses.map((ellipse, index) => <ellipse key={index} cx={ellipse.cx} cy={ellipse.cy} rx={ellipse.rx} ry={ellipse.ry} fill="none" stroke="#d9f397" strokeOpacity=".5" strokeDasharray="3 6" />)}
          {data.points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={3.5 + (index % 3)} fill="#d9f397" opacity={.45 + (index % 5) * .11} />)}
          <line x1="42" x2="630" y1="290" y2="290" stroke="currentColor" strokeOpacity=".35" />
          <line x1="42" x2="42" y1="48" y2="290" stroke="currentColor" strokeOpacity=".35" />
          <text x="42" y="326" className="chart-small">{t.labels.indicatorA} →</text>
          <text x="42" y="27" className="chart-small">{t.labels.indicatorB}</text>
        </svg>
        <figcaption><span>{t.studies[studyIndex].note}</span><span>{t.labels.synthetic}</span></figcaption>
      </figure>
      <StudyCopy locale={locale} index={studyIndex} />
    </div>
  </article>;
}

function demandValue(week: number, hour: number) {
  return Math.min(1, .18 + .52 * Math.exp(-((hour - 8.2 + Math.sin(week) * 1.4) ** 2) / 7) + .16 * Math.cos(week * .8 + hour * .6) + (week > 4 ? .12 : 0));
}

export function RetailStudy({locale, studyIndex}: Common) {
  const t = solutionsCopy[locale];
  const [cell, setCell] = useState({week: 2, hour: 8});
  const value = demandValue(cell.week, cell.hour);
  return <article className="industry-study industry-retail" id="retail">
    <StudyMeta locale={locale} index={studyIndex} title={t.studies[studyIndex].title} />
    <div className="industry-retail-grid">
      <StudyCopy locale={locale} index={studyIndex} />
      <figure className="industry-figure industry-retail-figure">
        <div className="industry-figure-top">
          <span className="mono-label">{t.labels.demandIndex}</span>
          <span className="mono-label">{t.studies[studyIndex].label}</span>
        </div>
        <svg viewBox="0 0 660 380" role="img" aria-label={t.studies[studyIndex].title}>
          {Array.from({length: 7}, (_, week) => Array.from({length: 12}, (_, hour) => {
            const active = week === cell.week && hour === cell.hour;
            return <rect
              key={`${week}-${hour}`}
              x={56 + hour * 48}
              y={34 + week * 42}
              width="42"
              height="34"
              fill="#d9f397"
              opacity={demandValue(week, hour)}
              stroke={active ? '#20251f' : 'transparent'}
              strokeWidth={active ? 2 : 0}
              onPointerEnter={() => setCell({week, hour})}
              onClick={() => setCell({week, hour})}
            />;
          }))}
          {['01', '02', '03', '04', '05', '06', '07'].map((week, index) => <text key={week} x="48" y={56 + index * 42} textAnchor="end" className="chart-small">{week}</text>)}
          {['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'].map((hour, index) => <text key={hour} x={56 + index * 48} y="346" textAnchor="middle" className="chart-small">{hour}</text>)}
          <text x="56" y="370" className="chart-small">{t.labels.hour} →</text>
        </svg>
        <div className="retail-controls">
          <label><span className="mono-label">{t.labels.week}</span><input type="range" min="0" max="6" value={cell.week} onChange={event => setCell({...cell, week: Number(event.target.value)})} /></label>
          <label><span className="mono-label">{t.labels.hour}</span><input type="range" min="0" max="11" value={cell.hour} onChange={event => setCell({...cell, hour: Number(event.target.value)})} /></label>
          <div className="retail-readout" aria-live="polite"><span className="mono-label">W{String(cell.week + 1).padStart(2, '0')} / H{String(cell.hour * 2).padStart(2, '0')}</span><strong>{Math.round(value * 100)}</strong></div>
        </div>
        <figcaption><span>{t.studies[studyIndex].note}</span><span>{t.labels.synthetic}</span></figcaption>
      </figure>
    </div>
  </article>;
}

function channelValue(channel: number, index: number) {
  const base = 110 + channel * 72 + Math.sin(index * .19 + channel * 1.7) * 14 + Math.cos(index * .06) * 18;
  const drift = index > 56 && index < 66 ? (index - 56) * (channel === 1 ? 4.7 : .5) : 0;
  return base - drift;
}

export function IndustryStudy({locale, studyIndex}: Common) {
  const t = solutionsCopy[locale];
  const [time, setTime] = useState(48);
  const channels = [0, 1, 2].map(channel => Array.from({length: 100}, (_, index) => `${32 + index * 6.2},${channelValue(channel, index)}`).join(' '));
  return <article className="industry-study industry-industry" id="industry">
    <StudyMeta locale={locale} index={studyIndex} title={t.studies[studyIndex].title} />
    <div className="industry-industry-grid">
      <StudyCopy locale={locale} index={studyIndex} />
      <figure className="industry-figure industry-industry-figure">
        <div className="industry-figure-top">
          <div className="channel-legend">
            {[0, 1, 2].map(channel => <span key={channel}><i data-channel={channel} />{t.labels.channel} 0{channel + 1}</span>)}
          </div>
          <span className="mono-label">{t.labels.deviation}</span>
        </div>
        <svg viewBox="0 0 700 350" role="img" aria-label={t.studies[studyIndex].title}>
          <g className="industry-grid">{[80, 155, 230, 305].map(y => <line key={y} x1="32" x2="660" y1={y} y2={y} />)}{[0, 20, 40, 60, 80, 100].map(index => <line key={index} x1={32 + index * 62} x2={32 + index * 62} y1="40" y2="305" />)}</g>
          <rect x="379" y="40" width="62" height="265" fill="#d9f397" opacity=".08" />
          <line x1="379" x2="379" y1="40" y2="305" stroke="#d9f397" strokeOpacity=".36" strokeDasharray="3 6" />
          <line x1="441" x2="441" y1="40" y2="305" stroke="#d9f397" strokeOpacity=".36" strokeDasharray="3 6" />
          {channels.map((points, channel) => <polyline key={channel} points={points} fill="none" stroke={channel === 1 ? '#d9f397' : '#78936c'} strokeWidth={channel === 1 ? 2.1 : 1.1} />)}
          <line x1={32 + time * 6.2} x2={32 + time * 6.2} y1="40" y2="305" stroke="#d9f397" strokeOpacity=".8" />
          <circle cx={32 + time * 6.2} cy={channelValue(0, time)} r="3.5" fill="#d9f397" />
          <circle cx={32 + time * 6.2} cy={channelValue(1, time)} r="3.5" fill="#d9f397" />
          <circle cx={32 + time * 6.2} cy={channelValue(2, time)} r="3.5" fill="#d9f397" />
          <text x="379" y="28" className="chart-small">{t.labels.normal}</text>
          <text x="32" y="330" className="chart-small">00</text>
          <text x="660" y="330" textAnchor="end" className="chart-small">100</text>
        </svg>
        <label className="chart-slider">
          <span className="mono-label">{t.labels.scrub}</span>
          <input type="range" min="0" max="99" value={time} onChange={event => setTime(Number(event.target.value))} />
        </label>
        <div className="channel-readout" aria-live="polite">
          {[0, 1, 2].map(channel => <span key={channel}><span className="mono-label">CH 0{channel + 1}</span><strong>{Math.round(channelValue(channel, time))}</strong></span>)}
        </div>
        <figcaption><span>{t.studies[studyIndex].note}</span><span>{t.labels.synthetic}</span></figcaption>
      </figure>
    </div>
  </article>;
}

const studyComponents: Record<IndustryId, (props: Common) => ReactElement> = {
  finance: FinanceStudy,
  energy: EnergyStudy,
  health: HealthStudy,
  retail: RetailStudy,
  industry: IndustryStudy,
};

export function IndustryStudyById({id, locale, index}:{id: IndustryId; locale: Locale; index: number}) {
  const Component = studyComponents[id];
  return <Component locale={locale} studyIndex={index} />;
}
