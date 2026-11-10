'use client';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {docsCode, docsCopy} from '../content/docs';
import {localized, type Locale} from '../config/i18n';
import {CodeBlock} from './docs/code-block';
import {CodeTabs} from './docs/code-tabs';

export function DeveloperDocs({locale}:{locale: Locale}) {
  const t = docsCopy[locale];
  const [active, setActive] = useState('overview');
  const mobileNav = useRef<HTMLDetailsElement>(null);
  const article = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = Array.from(article.current?.querySelectorAll('section[id]') ?? []);
    if (!sections.length || !('IntersectionObserver' in window)) return;
    let observer: IntersectionObserver;
    function observe() {
      observer?.disconnect();
      const top = Math.min(150, Math.round(window.innerHeight * .22));
      const bottom = Math.max(0, window.innerHeight - top - 24);
      const visible = new Set<Element>();
      observer = new IntersectionObserver(entries => {
        for (const {target, isIntersecting} of entries) {
          if (isIntersecting) visible.add(target);
          else visible.delete(target);
        }
        const current = sections.find(section => visible.has(section));
        if (current) setActive(current.id);
      }, {rootMargin: `-${top}px 0px -${bottom}px 0px`});
      sections.forEach(section => observer.observe(section));
    }
    observe();
    window.addEventListener('resize', observe);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', observe);
    };
  }, []);

  const allItems = t.groups.flatMap(group => group.items);
  const activeItem = allItems.find(item => item.id === active);
  const copyLabels = {copyLabel: t.labels.copy, copiedLabel: t.labels.copied, failedLabel: t.labels.failed};
  const tabs = [
    {id: 'curl', label: t.request.tabs.curl, language: 'cURL', code: docsCode.tabs.curl},
    {id: 'typescript', label: t.request.tabs.typescript, language: 'TypeScript', code: docsCode.tabs.typescript},
    {id: 'python', label: t.request.tabs.python, language: 'Python', code: docsCode.tabs.python},
  ];

  return <div className="docs-shell">
    <div className="draft-banner" role="note">
      <span className="draft-badge">{t.draftBadge}</span>
      <div><strong>{t.draftTitle}</strong><p>{t.draftBody}</p></div>
    </div>

    <details className="docs-mobile-nav" ref={mobileNav}>
      <summary><span>{t.mobileNav}</span><span className="docs-mobile-current">{activeItem?.label}</span></summary>
      <nav aria-label={t.sidebarLabel}>
        {t.groups.map(group => <div key={group.title}>
          <span className="mono-label">{group.title}</span>
          {group.items.map(item => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined} onClick={() => {
            setActive(item.id);
            if (mobileNav.current) mobileNav.current.open = false;
            requestAnimationFrame(() => {
              article.current?.querySelector<HTMLElement>(`#${item.id} h2`)?.focus({preventScroll: true});
            });
          }}>{item.label}</a>)}
        </div>)}
      </nav>
    </details>

    <div className="docs-layout">
      <aside className="docs-sidebar">
        <span className="mono-label">{t.sidebarLabel}</span>
        <nav aria-label={t.sidebarLabel}>
          {t.groups.map(group => <div key={group.title} className="docs-nav-group">
            <span className="mono-label">{group.title}</span>
            {group.items.map(item => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'true' : undefined}>{item.label}</a>)}
          </div>)}
        </nav>
      </aside>

      <article className="docs-article" ref={article}>
        <section id="overview">
          <h2 tabIndex={-1}>{t.overview.title}</h2>
          <p className="docs-lede">{t.overview.body}</p>
          <div className="docs-overview-note">
            <span className="mono-label">{t.labels.next}</span>
            <p>{t.overview.note}</p>
          </div>
        </section>

        <section id="status">
          <h2 tabIndex={-1}>{t.status.title}</h2>
          <p>{t.status.body}</p>
          <dl className="status-facts">
            {t.status.facts.map(fact => <div key={fact.label} data-tone={fact.tone}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>)}
          </dl>
        </section>

        <section id="authentication">
          <h2 tabIndex={-1}>{t.auth.title}</h2>
          <p>{t.auth.body}</p>
          <div className="docs-callout docs-callout-warning"><span className="mono-label">!</span><p>{t.auth.note}</p></div>
        </section>

        <section id="request">
          <h2 tabIndex={-1}>{t.request.title}</h2>
          <p>{t.request.body}</p>
          <div className="endpoint-bar">
            <span className="endpoint-method">POST</span>
            <code>/v1/predict</code>
            <span className="mono-label">{t.labels.endpoint}</span>
          </div>
          <CodeTabs tabs={tabs} label={t.labels.request} {...copyLabels} />
        </section>

        <section id="parameters">
          <h2 tabIndex={-1}>{t.params.title}</h2>
          <p>{t.params.body}</p>
          <p className="doc-table-hint" id="params-table-hint">{t.labels.tableHint}</p>
          <div className="doc-table-wrap" tabIndex={0} role="region" aria-label={t.params.title} aria-describedby="params-table-hint">
            <table className="doc-table">
              <caption className="visually-hidden">{t.params.title}</caption>
              <thead><tr>{t.params.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
              <tbody>{t.params.rows.map(row => <tr key={row.name}>
                <th scope="row"><code>{row.name}</code></th>
                <td><code>{row.type}</code></td>
                <td><span className="required-tag">{row.required}</span></td>
                <td>{row.description}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>

        <section id="response">
          <h2 tabIndex={-1}>{t.response.title}</h2>
          <p>{t.response.body}</p>
          <CodeBlock code={docsCode.responseJson} language="JSON" label={t.labels.response} {...copyLabels} />
          <p className="docs-note">{t.response.note}</p>
        </section>

        <section id="errors">
          <h2 tabIndex={-1}>{t.errors.title}</h2>
          <p>{t.errors.body}</p>
          <p className="doc-table-hint" id="errors-table-hint">{t.labels.tableHint}</p>
          <div className="doc-table-wrap" tabIndex={0} role="region" aria-label={t.errors.title} aria-describedby="errors-table-hint">
            <table className="doc-table doc-table-compact">
              <caption className="visually-hidden">{t.errors.title}</caption>
              <thead><tr>{t.errors.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
              <tbody>{t.errors.rows.map(row => <tr key={row.name}>
                <td><code>{row.name}</code></td>
                <td><code>{row.type}</code></td>
                <td>{row.required}<span className="doc-table-detail">{row.description}</span></td>
              </tr>)}</tbody>
            </table>
          </div>
          <CodeBlock code={docsCode.errorJson} language="JSON" label={t.labels.example} {...copyLabels} />
        </section>

        <section id="models">
          <h2 tabIndex={-1}>{t.models.title}</h2>
          <p>{t.models.body}</p>
          <p className="doc-table-hint" id="models-table-hint">{t.labels.tableHint}</p>
          <div className="doc-table-wrap" tabIndex={0} role="region" aria-label={t.models.title} aria-describedby="models-table-hint">
            <table className="doc-table doc-table-compact">
              <caption className="visually-hidden">{t.models.title}</caption>
              <thead><tr>{t.models.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
              <tbody>{t.models.rows.map(row => <tr key={row.name}>
                <td><code>{row.name}</code></td>
                <td>{row.type}</td>
                <td><span className="status-mark">{row.required}</span></td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>

        <section id="next">
          <h2 tabIndex={-1}>{t.next.title}</h2>
          <p>{t.next.body}</p>
          <ul className="docs-checklist">
            {t.next.items.map(item => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
          </ul>
          <div className="docs-next-links">
            <Link href={localized(locale, 'playground')}>{t.labels.openPlayground}<span aria-hidden="true">↗</span></Link>
            <Link href={localized(locale, 'products')}>{t.labels.openModels}<span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </article>

      <aside className="docs-toc">
        <span className="mono-label">{t.tocLabel}</span>
        <nav aria-label={t.tocLabel}>
          {allItems.map(item => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'true' : undefined}>{item.label}</a>)}
        </nav>
      </aside>
    </div>
  </div>;
}
