'use client';

import Link from 'next/link';
import {useEffect, useId, useState, type ReactNode} from 'react';
import type {Locale} from '../config/i18n';
import {docGroups, docPath, type DocId} from '../content/docs-navigation';
import {docLabels, documents, pending} from '../content/sdk-docs';
import {CodeBlock} from './docs/code-block';
import styles from './docs/sdk-guide.module.css';

const oldAnchors: Record<string, [DocId, string?]> = {
  overview: ['quickstart'], classification: ['quickstart', 'classification'], 'own-data': ['data'],
  params: ['http-api', 'parameters'], 'python-sdk': ['python-sdk'], 'client-config': ['python-sdk', 'client-config'],
  request: ['http-api'], errors: ['errors'],
};

function Disclosure({label, initialOpen = false, headingId, children}: {label: ReactNode; headingId?: string; initialOpen?: boolean; children: ReactNode}) {
  const [open, setOpen] = useState(initialOpen);
  const id = useId();
  const trigger = <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      {label}<span aria-hidden="true" className={styles.chevron}/>
    </button>;
  return <div>
    {headingId ? <h2 id={headingId}>{trigger}</h2> : trigger}
    <div id={id} className={styles.panel} data-open={open} inert={!open}>
      <div className={styles.clip}>{children}</div>
    </div>
  </div>;
}

export function DeveloperDocs({locale, topic}: {locale: Locale; topic: DocId}) {
  const page = documents[topic];
  const labels = docLabels[locale];
  const [current, setCurrent] = useState(page.sections[0].id);
  useEffect(() => {
    const headings = page.sections.map(s => document.getElementById(s.id)).filter(el => el !== null);
    const update = () => {
      const hash = location.hash.slice(1);
      if (topic === 'overview' && Object.hasOwn(oldAnchors, hash)) {
        const [id, section] = oldAnchors[hash];
        location.replace(docPath(locale, id) + location.search + (section ? '#' + section : ''));
        return;
      }
      const offset = (document.querySelector('.site-header')?.getBoundingClientRect().height ?? 68) + 24;
      let active = headings[0];
      for (const el of headings) {
        const top = el.getBoundingClientRect().top;
        if (el.id === hash && top >= offset - 20 && top < window.innerHeight) {
          active = el;
          break;
        }
        if (top <= offset) active = el;
      }
      if (active) setCurrent(active.id);
    };
    update();
    window.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update);
    window.addEventListener('hashchange', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('hashchange', update);
    };
  }, [page, locale, topic]);

  const name = (id: DocId) => id === 'overview' ? labels.overview : documents[id].title[locale];
  const pageLinks = (ids: DocId[]) => <ul className={styles.links}>{ids.map(id =>
    <li key={id}><Link href={docPath(locale,id)}>{name(id)} <span aria-hidden="true">→</span></Link></li>)}</ul>;
  const menu = <nav aria-label={labels.nav}>{docGroups.map(group =>
    <div className={styles.group} key={group.en}>
      <Disclosure label={group[locale]} initialOpen={group.pages.includes(topic)}>
      {group.pages.map(id => <Link key={id} href={docPath(locale,id)} aria-current={id === topic ? 'page' : undefined}>{name(id)}</Link>)}
      </Disclosure>
    </div>)}</nav>;

  return <div className={styles.layout}>
    <aside className={styles.sidebar}>{menu}</aside>
    <div className={styles.mobileMenu}><Disclosure label={labels.nav}>{menu}</Disclosure></div>
    <article className={styles.article}>
      <header><h1>{page.title[locale]}</h1><p>{page.intro[locale]}</p></header>
      {page.sections.map((s,i) => <section key={s.id} aria-labelledby={s.id}>
        {topic === 'quickstart' && s.id === 'next' && s.links ? <Disclosure headingId={s.id}
          label={<><span className={styles.step}>{i+1}</span>{s.title[locale]}</>}>
          {pageLinks(s.links)}
        </Disclosure> : <>
        <h2 id={s.id}>{topic === 'quickstart' && <span className={styles.step}>{i+1}</span>}{s.title[locale]}</h2>
        {s.text && <p>{s.text[locale]}</p>}
        {s.code && <CodeBlock code={s.code} language={s.language ?? 'Python'} label="" copyLabel={labels.copy} copiedLabel={labels.copied} failedLabel={labels.failed}/>}
        {s.table && s.table.rows.length > 0 && <div className={styles.tableScroll} tabIndex={0} role="region" aria-labelledby={s.id}>
          <table><thead><tr>{s.table.columns.map(c => <th key={c.en} scope="col">{c[locale]}</th>)}</tr></thead>
            <tbody>{s.table.rows.map((row,index) => <tr key={index}>{row.map((cell,col) => <td key={col}>{cell[locale]}</td>)}</tr>)}</tbody>
          </table></div>}
        {s.links && pageLinks(s.links)}
        {!s.text && !s.code && !s.links && !s.table?.rows.length && <p className={styles.pending}>{(s.placeholder ?? pending)[locale]}</p>}
        </>}
      </section>)}
    </article>
    <nav className={styles.toc} aria-label={labels.toc}><strong>{labels.toc}</strong>
      {page.sections.map(s => <a key={s.id} href={'#'+s.id} aria-current={current === s.id ? 'location' : undefined}>{s.title[locale]}</a>)}
    </nav>
  </div>;
}
