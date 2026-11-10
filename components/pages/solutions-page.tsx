import Link from 'next/link';
import {PageHead} from '../pages/page-head';
import {solutionsCopy} from '../../content/solutions';
import {localized, type Locale} from '../../config/i18n';
import {IndustryStudyById} from '../visualizations/industry-studies';

export function SolutionsPage({locale}:{locale: Locale}) {
  const t = solutionsCopy[locale];
  return <main id="main" className="subpage surface-solutions">
    <PageHead index="03" label={t.eyebrow} title={t.title} intro={t.intro} meta={t.meta} tone="dark" />
    <nav className="industry-index" aria-label={t.indexLabel}>
      {t.studies.map(study => <a key={study.id} href={`#${study.id}`}>
        <span className="mono-label">{study.index}</span>
        <span>{study.name}</span>
        <small>{study.label}</small>
        <span aria-hidden="true">↓</span>
      </a>)}
    </nav>
    {t.studies.map((study, index) => <IndustryStudyById key={study.id} id={study.id} locale={locale} index={index} />)}
    <section className="atlas-disclaimer">
      <span className="mono-label">{t.labels.synthetic}</span>
      <p>{t.disclaimer}</p>
    </section>
    <section className="atlas-close">
      <div>
        <span className="mono-label">{t.indexLabel}</span>
        <h2>{t.close.title}</h2>
        <p>{t.close.body}</p>
      </div>
      <Link className="button button-ink" href={localized(locale, 'contact')}>{t.close.link}<span className="button-icon" aria-hidden="true">↗</span></Link>
    </section>
  </main>;
}
