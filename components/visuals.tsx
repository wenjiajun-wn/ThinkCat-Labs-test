'use client';
import Link from 'next/link';
import {useRef, useState} from 'react';
export function Terrain({mode=0,label="原创合成数值地形：多条时间序列构成连续的曲面"}:{mode?:number;label?:string}){return <svg className="terrain" viewBox="0 0 1000 560" role="img" aria-label={label}><g fill="none">{Array.from({length:44},(_,r)=>{const points=Array.from({length:120},(_,c)=>{const x=c*9;const wave=Math.sin(c*.052+r*.055+mode*.7)*Math.exp(-Math.pow((c-60)/35,2))*145+Math.sin(c*.11+r*.14)*26;return `${x},${110+r*8+wave}`}).join(' ');return <polyline key={r} points={points} stroke={r%7===0?'#d5ed98':'#77937d'} strokeOpacity={r%7===0?.9:.45} strokeWidth={r%7===0?1.4:.65}/>})}</g></svg>}
const industries=[['金融','信用风险与异常信号','观察特征关联与风险分布，探索小样本场景下的结构化学习。'],['能源','理解每一次负荷变化','从周期与波动中学习，探索负荷预测与不确定性估计。'],['医疗','从指标中发现关联','探索结构化医疗数据中的关联与辅助风险预测，不用于临床诊断。'],['零售','预见需求的节奏','结合销售变化与季节规律，探索需求预测与库存决策支持。'],['工业','捕捉细微的异常','理解传感器序列，探索设备状态变化与异常检测。']];
export function Applications(){const [active,setActive]=useState(1);return <div className="applications"><div><div className="tabs" role="group" aria-label="选择行业">{industries.map((v,i)=><button key={v[0]} aria-pressed={active===i} onClick={()=>setActive(i)}>{v[0]} <span>↗</span></button>)}</div><div className="app-copy" aria-live="polite"><h3>{industries[active][1]}</h3><p>{industries[active][2]}</p></div></div><div className="chart"><div className="chart-head"><span>{['CREDIT · FEATURE SPACE','ENERGY · LOAD FORECAST','HEALTH · INDICATOR RELATIONS','RETAIL · DEMAND FORECAST','INDUSTRY · SENSOR SIGNAL'][active]}</span><span>示意 / 非模型输出</span></div><svg viewBox="0 0 700 330" role="img" aria-label={`${industries[active][0]}合成数据示意曲线`}><g stroke="#d6d9ca" strokeWidth="1">{[60,120,180,240,300].map(y=><path key={y} d={`M20 ${y} H680`}/>)}</g><path d="M470 70 L680 40 L680 235 L470 170Z" fill="#dce7b9"/><polyline fill="none" stroke="#315c43" strokeWidth="3" points={Array.from({length:65},(_,i)=>`${20+i*10},${190-Math.sin(i*.23+active)*45-Math.cos(i*.65)*16-i*.9}`).join(' ')}/><path d="M470 25V305" stroke="#728368" strokeDasharray="4 6"/></svg><div className="chart-foot"><span>OBSERVED → EXPLORATORY</span><span>Synthetic Demo Data</span></div></div></div>}
const mobileLinks = [
  ['/technology/', '技术'],
  ['/zh/#model-applications', '应用'],
  ['/research/', '研究'],
  ['/about/', '关于'],
  ['/contact/', '联系'],
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  return <div className="mobile-nav" onKeyDown={event => {
    if (event.key !== 'Escape' || !open) return;
    setOpen(false);
    toggle.current?.focus();
  }}>
    <button ref={toggle} type="button" aria-expanded={open} aria-controls="legacy-mobile-nav" onClick={() => setOpen(value => !value)}>
      菜单 <span aria-hidden="true">{open ? '−' : '+'}</span>
    </button>
    <nav id="legacy-mobile-nav" aria-label="移动导航" hidden={!open}>
      {mobileLinks.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
    </nav>
  </div>;
}




