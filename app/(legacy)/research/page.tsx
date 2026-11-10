import Link from 'next/link';
import { DataScene } from '../../../components/visualizations/data-scene';
import { researchCopy, researchDirections, researchOutputs } from '../../../content/research';

export const metadata = {
  title: '研究 | Thinkcat Labs',
  description: 'Thinkcat Labs 的数值基础模型研究方向与待核实学术成果信息。',
};

export default function Research() {
  const t = researchCopy.zh;
  return <main id="main" className="subpage research-page">
    <section className="page-intro">
      <p className="eyebrow">Thinkcat Labs</p>
      <h1>数值智能研究</h1>
      <div className="page-intro-bottom"><p>研究数值数据如何被理解。让观点经得起实验与复现。</p></div>
    </section>
    <div className="research-banner"><DataScene kind="research"/></div>
    <section className="section research-manifesto">
      <h2>从假设出发，以证据推进。</h2>
      <p>我们关注表格、时间序列与时空数据中的结构性问题。持续评估模型表现和限制，是研究不可分割的一部分。</p>
    </section>
    <section className="section direction-section">
      <h2>{t.directions}</h2>
      <div className="direction-list">{researchDirections.map(({title,detail},index)=>
        <article key={title.en}><span aria-hidden="true">0{index+1}</span><h3>{title.zh}</h3><p>{detail.zh}</p></article>
      )}</div>
    </section>
    <section className="section publication-section">
      <div className="publication-intro"><h2>{t.outputs}</h2><p>{t.note}</p></div>
      <div className="publication-list">{researchOutputs.map(({title,status,url})=>
        <div key={title.en}>
          <strong>{status==='verified' && url ? <a href={url}>{title.zh}</a> : title.zh}</strong>
          <span>{t.status[status]}</span>
        </div>
      )}</div>
    </section>
    <section className="section next-step">
      <h2>让研究进入对话。</h2><Link className="button" href="/contact/">研究合作 ↗</Link>
    </section>
  </main>;
}
