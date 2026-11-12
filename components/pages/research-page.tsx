import Link from 'next/link';
import {PageHead} from '../pages/page-head';
import {localized, type Locale} from '../../config/i18n';
import {researchCopy, researchDirections, researchOutputs} from '../../content/research';

export function ResearchPage({locale}:{locale: Locale}) {
  const t = researchCopy[locale];
  return <main id="main" className="subpage surface-research">
    <PageHead label={t.eyebrow} title={t.title} intro={t.intro} meta={t.meta} tone="dark" />
    <section className="research-ledger">
      <header className="research-ledger-head">
        <span className="mono-label">{t.directionsLabel}</span>
        <h2>{t.directions}</h2>
        <p>{t.aside}</p>
      </header>
      <ol>
        {researchDirections.map((direction, index) => <li key={direction.title.en}>
          <span className="mono-label">0{index + 1}</span>
          <h3>{direction.title[locale]}</h3>
          <p>{direction.detail[locale]}</p>
        </li>)}
      </ol>
    </section>
    <section className="research-outputs">
      <div className="research-outputs-head">
        <span className="mono-label">{t.outputsLabel}</span>
        <h2>{t.outputs}</h2>
        <p>{t.note}</p>
      </div>
      <div className="research-output-list">
        {researchOutputs.map((output, index) => <div key={output.title.en}>
          <span className="mono-label">0{index + 1}</span>
          <strong>{output.title[locale]}</strong>
          {output.status === 'verified' && output.url
            ? <a href={output.url}>{t.status.verified} <span aria-hidden="true">↗</span></a>
            : <span className="output-status">{t.status[output.status]}</span>}
        </div>)}
      </div>
      <p className="research-outputs-note">{t.outputsEmpty}</p>
    </section>
    <section className="research-close">
      <div><span className="mono-label">{t.directions}</span><h2>{t.closeTitle}</h2></div>
      <Link className="button button-ink" href={localized(locale, 'products')}>{t.back}<span className="button-icon" aria-hidden="true">↗</span></Link>
    </section>
  </main>;
}
