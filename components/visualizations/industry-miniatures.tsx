import type {IndustryId} from '../../content/solutions';
import type {Locale} from '../../config/i18n';

export function IndustryMiniature({id, locale}:{id: IndustryId; locale: Locale}) {
  const zh = locale === 'zh';
  if (id === 'finance') {
    return <svg className="industry-mini" viewBox="0 0 680 430" aria-hidden="true">
      <g fill="#9fb87d">
        {[62, 78, 95, 122, 148, 177, 142, 126, 118, 84, 58, 38].map((height, index) => <rect key={index} x={62 + index * 47} y={360 - height} width="30" height={height} opacity={.45 + index * .035} />)}
      </g>
      <path d="M52 315 C 130 280, 175 300, 250 250 S 360 240, 440 210 S 555 205, 636 152" fill="none" stroke="#d9f397" strokeWidth="2.4" />
      <path d="M52 350H636" stroke="#d9f397" strokeOpacity=".3" strokeDasharray="3 7" />
      <path d="M478 72v286" stroke="#d9f397" strokeOpacity=".6" strokeDasharray="4 8" />
      <text x="484" y="92" className="mini-label">{zh ? '复核线' : 'REVIEW'}</text>
    </svg>;
  }
  if (id === 'energy') {
    return <svg className="industry-mini" viewBox="0 0 680 430" aria-hidden="true">
      {[0, 1, 2].map(layer => <path key={layer} d={Array.from({length: 80}, (_, index) => `${30 + index * 7.8},${230 - Math.sin(index * .23 + layer * .8) * (55 - layer * 12) - Math.cos(index * .07) * 30 - layer * 42}`).join(' L').replace(/^/, 'M')} fill="none" stroke="#d9f397" strokeOpacity={.25 + layer * .22} strokeWidth={layer === 2 ? 2.4 : 1.1} />)}
      <g stroke="#d9f397" strokeOpacity=".2">{[112, 186, 260, 334].map(y => <path key={y} d={`M30 ${y}H650`} />)}</g>
      <path d="M412 74v300" stroke="#d9f397" strokeDasharray="2 7" />
      <text x="420" y="92" className="mini-label">{zh ? '峰值' : 'PEAK'}</text>
    </svg>;
  }
  if (id === 'health') {
    return <svg className="industry-mini" viewBox="0 0 680 430" aria-hidden="true">
      <g stroke="#d9f397" strokeOpacity=".2">{[100, 210, 320].map(y => <path key={y} d={`M40 ${y}H640`} />)}{[180, 340, 500].map(x => <path key={x} d={`M${x} 58V370`} />)}</g>
      {Array.from({length: 48}, (_, index) => {
        const x = 74 + (index * 71) % 520;
        const y = 80 + (index * 47) % 255;
        return <circle key={index} cx={x} cy={y} r={2 + (index % 4)} fill="#d9f397" opacity={.25 + (index % 5) * .12} />;
      })}
      <ellipse cx="270" cy="238" rx="105" ry="62" fill="none" stroke="#d9f397" strokeOpacity=".45" strokeDasharray="3 6" />
      <ellipse cx="470" cy="162" rx="66" ry="38" fill="none" stroke="#d9f397" strokeOpacity=".28" strokeDasharray="3 6" />
    </svg>;
  }
  if (id === 'retail') {
    return <svg className="industry-mini" viewBox="0 0 680 430" aria-hidden="true">
      {Array.from({length: 42}, (_, index) => {
        const col = index % 7;
        const row = Math.floor(index / 7);
        const value = .12 + ((Math.sin(row * 1.2 + col * 1.4) + 1) / 2) * .78;
        return <rect key={index} x={46 + col * 84} y={44 + row * 49} width="68" height="36" fill="#d9f397" opacity={value} />;
      })}
      <text x="46" y="412" className="mini-label">{zh ? '第 01 周' : 'WEEK 01'}</text>
      <text x="640" y="412" textAnchor="end" className="mini-label">{zh ? '第 07 周' : 'WEEK 07'}</text>
    </svg>;
  }
  return <svg className="industry-mini" viewBox="0 0 680 430" aria-hidden="true">
    {[0, 1, 2].map(channel => <path key={channel} d={Array.from({length: 90}, (_, index) => {
      const drift = index > 50 && index < 58 ? (index - 50) * (channel === 1 ? 5.5 : .4) : 0;
      return `${28 + index * 7},${110 + channel * 92 + Math.sin(index * .23 + channel) * 9 - drift}`;
    }).join(' L').replace(/^/, 'M')} fill="none" stroke={channel === 1 ? '#d9f397' : '#7e9b72'} strokeWidth={channel === 1 ? 2.4 : 1.1} />)}
    <rect x="370" y="70" width="62" height="286" fill="#d9f397" opacity=".08" />
    <path d="M370 70v286M432 70v286" stroke="#d9f397" strokeOpacity=".5" strokeDasharray="3 6" />
    <text x="374" y="62" className="mini-label">{zh ? '偏移' : 'DEVIATION'}</text>
  </svg>;
}
