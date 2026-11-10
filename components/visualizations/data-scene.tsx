'use client';
import { useState } from 'react';

type VisualKind = 'table' | 'time' | 'unified' | 'anomaly' | 'finance' | 'energy' | 'health' | 'retail' | 'industry' | 'research';
const labels: Record<VisualKind,string> = {table:'表格特征关联',time:'时间序列预测区间',unified:'统一数值表征',anomaly:'异常信号检测',finance:'金融风险特征分布',energy:'能源负荷时序',health:'医疗指标关系',retail:'零售需求曲线',industry:'工业传感器异常',research:'研究问题的数值图谱'};
export function DataScene({kind,compact=false, text}:{kind:VisualKind;compact?:boolean;text?:{title:string;synthetic:string;update:string;chart:string}}) {
  const [focus,setFocus]=useState(0);
  const grid=Array.from({length:8},(_,row)=>Array.from({length:12},(_,col)=>({x:51+col*51,y:45+row*40,col,value:(row*13+col*17)%100})) ).flat();
  const series = Array.from({length:66},(_,i)=>({
    x:24+i*10, y:170-Math.sin(i*.22+focus*.3)*33-Math.cos(i*.68)*12-i*.35,
  }));
  const forecast = series.slice(42);
  const plot = (points: typeof series) => points.map(({x,y})=>x+','+y).join(' ');
  const band = [
    ...forecast.map(({x,y},i)=>({x,y:y-12-i*1.7})),
    ...forecast.map(({x,y},i)=>({x,y:y+12+i*1.7})).reverse(),
  ];
    return <div className={`data-scene data-${kind}${compact?' compact':''}`} onPointerMove={event=>{if(event.pointerType==='mouse')setFocus(Math.round(event.nativeEvent.offsetX/110))}} onPointerLeave={()=>setFocus(0)}>
    <div className="scene-meta"><span>{text?.title ?? labels[kind]}</span><span>{text?.synthetic ?? '合成数据示意'}</span></div>
    <svg viewBox="0 0 700 390" role="img" aria-label={text?.chart ?? labels[kind]}>
      {kind==='table' && <><g className="scene-grid">{grid.map((point,i)=><rect key={i} x={point.x} y={point.y} width="38" height="28" fill={point.col===8?'#a7c06c':point.value>65?'#d6ee96':'#52715b'} opacity={.23+point.value/180}/>)}</g><path d="M51 328H650 M452 42V320" fill="none" stroke="#557449" strokeWidth="1.4" strokeDasharray="4 6"/></>}
      {kind==='finance' && <><g fill="#b8d78e">{Array.from({length:15},(_,i)=><rect key={i} x={35+i*43} y={260-((i*19+focus*5)%180)} width="23" height={((i*19+focus*5)%180)+24} opacity={.3+i/45}/>)}</g><path d="M30 183 C 160 148, 250 205, 370 125 S 550 207, 672 85" stroke="#d6ee96" strokeWidth="3" fill="none"/><path d="M30 205H670" stroke="#8ea287" strokeDasharray="4 8"/></>}
      {kind==='health' && <><g stroke="#536e5a" opacity=".5">{[100,180,260].map(y=><path key={y} d={`M35 ${y}H670`}/>)}</g><g fill="#d6ee96">{Array.from({length:90},(_,i)=><circle key={i} cx={45+(i*73)%610} cy={50+((i*43+Math.floor(i/12)*11)%270)} r={2+(i%4)} opacity={.25+(i%7)/12}/>)}</g><path d="M55 275 Q 340 180 645 110" stroke="#d6ee96" fill="none" strokeWidth="2"/></>}
      {kind==='time' && <>
        <g stroke="#87a28a" opacity=".35">{[70,130,190,250,310].map(y=><path key={y} d={'M24 '+y+'H675'}/>)}</g>
        <polygon points={plot(band)} fill="#b9db87" opacity=".2"/>
        <polyline points={plot(series.slice(0,43))} fill="none" stroke="#d6ee96" strokeWidth="3"/>
        <polyline points={plot(forecast)} fill="none" stroke="#d6ee96" strokeWidth="2" strokeDasharray="5 6"/>
        <path d="M444 48V325" stroke="#b2cda3" strokeDasharray="2 6"/>
        <circle cx={forecast[0].x} cy={forecast[0].y} r="5" fill="#d6ee96"/>
      </>}
      {(kind==='energy'||kind==='retail') && <><g stroke="#60745f" opacity=".4">{[70,130,190,250,310].map(y=><path key={y} d={`M24 ${y}H675`}/>)}</g><path d="M450 90 L675 55 L675 285 L450 225Z" fill="#d6ee96" opacity=".18"/><polyline points={kind==='energy'?Array.from({length:66},(_,i)=>`${24+i*10},${185-Math.sin(i*.34)*52-Math.sin(i*.07)*25}`).join(' '):kind==='retail'?Array.from({length:66},(_,i)=>`${24+i*10},${200-Math.sin(i*.18)*25-((i%14)>10?55:0)-i*.35}`).join(' '):plot(series)} fill="none" stroke="#d6ee96" strokeWidth="3"/><path d="M450 35V335" stroke="#d6ee96" strokeDasharray="5 8"/></>}
      {(kind==='unified'||kind==='research') && <><g fill="none" stroke="#accb83">{Array.from({length:24},(_,r)=><path key={r} d={`M40 ${60+r*10} Q 215 ${-45+r*16} 350 ${160+r*2} T 680 ${130+r*9}`} opacity={.2+r/55}/>)}</g><g fill="#d6ee96">{[135,275,385,515,620].map((x,i)=><circle key={x} cx={x} cy={115+Math.sin(i*2)*50} r={i===focus%5?6:3}/>)}</g></>}
      {(kind==='anomaly'||kind==='industry') && <><g stroke="#68836b" opacity=".5">{[85,145,205,265].map(y=><path key={y} d={`M25 ${y}H675`}/>)}</g>{kind==='industry'&&[0,1,2].map(channel=><polyline key={channel} points={Array.from({length:80},(_,i)=>`${25+i*8},${110+channel*72+Math.sin(i*.22+channel)*11+(i>49&&i<54&&channel===1?-(i-49)*12:0)}`).join(' ')} fill="none" stroke={channel===1?'#d6ee96':'#759375'} strokeWidth="2"/>)}{kind==='anomaly'&&<polyline points={Array.from({length:80},(_,i)=>`${25+i*8},${185+Math.sin(i*.42)*16+(i===50?-105:0)+(i===51?-67:0)}`).join(' ')} fill="none" stroke="#d6ee96" strokeWidth="2"/>}<circle cx="425" cy={kind==='industry'?170:65} r="18" fill="none" stroke="#d6ee96"/><path d={`M425 ${kind==='industry'?189:84}V330`} stroke="#d6ee96" strokeDasharray="4 7"/></>}
    </svg>
    <div className="scene-foot"><span>{text?.chart ?? '数值数据图形'}</span>{['time','finance','unified','research'].includes(kind) && <button type="button" onClick={()=>setFocus(value=>value+1)} aria-label={text?.update ?? `更新${labels[kind]}示意视图`}>{text?.update ?? '刷新视角'} ↗</button>}</div>
  </div>;
}



