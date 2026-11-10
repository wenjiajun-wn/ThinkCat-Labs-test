import Link from 'next/link';
import { DataScene } from '../../../components/visualizations/data-scene';
import { technologyTracks } from '../../../content/site-content';
export const metadata={title:'技术研究 | Thinkcat Labs',description:'了解 Thinkcat Labs 对表格、时间序列、统一数值表征和异常检测的研究方向。'};
export default function Technology(){return <main id="main" className="subpage tech-page">
  <section className="page-intro"><p className="eyebrow">Thinkcat Labs</p><h1>学习数值的语言</h1><div className="page-intro-bottom"><p>数值本身没有固定语义。<br/>上下文中的统计关系，决定了它意味着什么。</p><span>01 / 04 / 研究方向</span></div></section>
  <div className="intro-scene"><DataScene kind="unified"/></div>
  <section className="section page-lead"><p className="eyebrow">研究方法</p><div className="split"><h2>结构与变化，<br/>共同构成理解。</h2><p>我们探索数值基础模型如何学习变量之间的关系，以及这些关系如何随时间改变。目标是建立可迁移的表征，同时严谨评估它在不同任务中的适用边界。</p></div></section>
  <section className="track-list" aria-label="技术研究方向">{technologyTracks.map((track,index)=><article className="track" key={track.key} id={track.key}><div className="track-head"><span className="eyebrow">0{index+1} / 研究方向</span><h2>{track.name}</h2><p>{track.zh}</p></div><DataScene kind={track.key}/><div className="track-foot"><p>{track.description}</p><blockquote>{track.question}</blockquote></div></article>)}</section>
  <section className="section next-step"><p className="eyebrow">研究议题</p><h2>技术因问题而前进。</h2><Link className="button" href="/research/">查看研究方向 ↗</Link></section>
</main>}

