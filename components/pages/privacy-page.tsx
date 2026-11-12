import Link from 'next/link';
import {PageHead} from '../pages/page-head';
import {privacyCopy} from '../../content/contact';
import {localized, type Locale} from '../../config/i18n';

export function PrivacyPage({locale}:{locale: Locale}) {
  const t = privacyCopy[locale];
  return <main id="main" className="subpage surface-privacy">
    <PageHead label={t.eyebrow} title={t.title} intro={t.intro} meta={t.meta} />
    <section className="privacy-page">
      <div className="privacy-rail">
        <span className="mono-label">{t.railLabel}</span>
        <nav aria-label={t.title}>
          {t.sections.map((section, index) => <a key={section.title} href={`#privacy-${index}`}>{section.title}</a>)}
        </nav>
      </div>
      <div className="privacy-content">
        {t.sections.map((section, index) => <section key={section.title} id={`privacy-${index}`}>
          <span className="mono-label">0{index + 1}</span>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>)}
        <Link className="text-link" href={localized(locale)}>{t.back} <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  </main>;
}
