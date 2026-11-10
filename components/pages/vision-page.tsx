import Link from 'next/link';
import {PageHead} from '../pages/page-head';
import {visionCopy} from '../../content/vision';
import {localized, type Locale} from '../../config/i18n';
import {RepresentationMap} from '../visualizations/numerical-field';

export function VisionPage({locale}:{locale: Locale}) {
  const t = visionCopy[locale];
  return <main id="main" className="subpage surface-vision">
    <PageHead index="02" label={t.eyebrow} title={t.title} intro={t.intro} meta={t.meta} tone="dark" />
    <section className="vision-statement">
      <div className="vision-statement-copy">
        <span className="mono-label">{t.statementLabel}</span>
        <h2>{t.statement}</h2>
        <p>{t.statementBody}</p>
      </div>
      <figure className="vision-map">
        <RepresentationMap
          label={t.map.label}
          tableLabel={t.map.table}
          seriesLabel={t.map.time}
          sharedLabel={t.map.shared}
          instruction={t.map.hint}
          caption={t.map.caption}
        />
        <figcaption className="figure-caption figure-caption-dark"><span>{t.map.caption}</span><span>{t.map.hint}</span></figcaption>
      </figure>
    </section>
    <section className="vision-principles">
      <header className="section-head">
        <span className="mono-label">{t.principlesLabel}</span>
        <h2>{t.principlesTitle}</h2>
      </header>
      <ol>
        {t.principles.map(principle => <li key={principle.title}>
          <span className="mono-label">{principle.index}</span>
          <span className="principle-label mono-label">{principle.label}</span>
          <h3>{principle.title}</h3>
          <p>{principle.body}</p>
        </li>)}
      </ol>
    </section>
    <section className="vision-beliefs">
      <div className="vision-beliefs-head">
        <span className="mono-label">{t.beliefsLabel}</span>
        <h2>{t.researchTitle}</h2>
        <p>{t.researchLead}</p>
      </div>
      <div className="vision-belief-list">
        {t.research.map((item, index) => <div key={item.title} className="vision-belief">
          <span className="mono-label">0{index + 1}</span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </div>)}
      </div>
    </section>
    <section className="vision-close">
      <div>
        <span className="mono-label">{t.nextLabel}</span>
        <h2>{t.close.title}</h2>
        <p>{t.close.body}</p>
      </div>
      <Link className="button button-accent" href={localized(locale, 'products')}>{t.close.linkLabel}<span className="button-icon" aria-hidden="true">↗</span></Link>
    </section>
  </main>;
}
