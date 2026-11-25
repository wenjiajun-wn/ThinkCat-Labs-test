import Link from 'next/link';
import { site } from '../../../config/site';
import { DataScene } from '../../../components/visualizations/data-scene';
export const metadata={title:'联系 | Thinkcat Labs',description:'与 Thinkcat Labs 交流数值基础模型研究与潜在产业合作。'};
export default function Contact(){return <main id="main" className="subpage contact-page"><section className="page-intro"><h1>交流数值智能研究</h1><div className="page-intro-bottom"><p>关于数值基础模型、结构化数据<br/>和现实世界的问题，我们期待交流。</p></div></section><div className="contact-visual"><DataScene kind="time"/></div><section className="section contact-channels"><div><h2>产业合作</h2><p>围绕结构化数据的建模问题，探讨研究与应用的可能。</p></div><div><h2>研究交流</h2><p>交流表格、时间序列、异常检测及数值表征方面的研究问题。</p></div></section><section className="section contact-address"><p className="eyebrow">联系我们</p>{site.email?<><h2>从一封邮件开始。</h2><a className="contact-email" href={`mailto:${site.email}`}>{site.email} ↗</a></>:<><h2>联系邮箱暂未公布</h2></>}<Link className="text-link" href="/research/">了解研究方向 ↗</Link></section></main>}

