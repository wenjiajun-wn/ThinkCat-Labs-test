import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ModelApplications} from '../../components/home/model-applications';
import {BrandMarquee} from '../../components/home/model-marquee';
import {NumericalField} from '../../components/visualizations/numerical-field';
import {localized} from '../../config/i18n';
import {localeMetadata} from '../../config/seo';
import {copy} from '../../content/i18n';
import {homeCopy} from '../../content/home';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props) {
  const {locale} = await params;
  if (locale !== 'zh' && locale !== 'en') notFound();
  return localeMetadata(locale);
}

export default async function Home({params}: Props) {
  const {locale} = await params;
  if (locale !== 'zh' && locale !== 'en') notFound();
  const t = copy[locale];
  const h = homeCopy[locale];

  return <main id="main" className="home">
    <div className="home-first-screen">
      <section className="home-hero">
        <div className="hero-copy">
          <h1><span>{t.hero[0]}</span>{' '}<span>{t.hero[1]}</span></h1>
          <p className="hero-support">{t.heroSupport}</p>
        </div>
        <figure className="hero-figure">
          <NumericalField label={h.hero.fieldLabel} />
        </figure>
      </section>

      <BrandMarquee locale={locale} />
    </div>

    <section className="home-developer">
      <div className="home-section-rail">
        <span className="rail-line" aria-hidden="true" />
        <span className="mono-label">{h.developer.label}</span>
      </div>
      <div className="developer-main">
        <div className="developer-intro">
          <span className="status-mark">{h.developer.badge}</span>
          <h2>{h.developer.title}</h2>
          <p>{h.developer.body}</p>
        </div>
        <div className="developer-code" aria-label={h.developer.terminalLabel}>
          <div className="code-top"><span className="mono-label">{h.developer.terminalLabel}</span><span className="mono-label">{h.developer.draftLabel}</span></div>
          <pre><code>{h.developer.code}</code></pre>
        </div>
        <div className="developer-entries">
          <Link href={localized(locale, 'docs')}>
            <span className="mono-label">{h.developer.docs}</span>
            <strong>{h.developer.docsDetail}</strong>
            <span className="entry-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link href={localized(locale, 'playground')}>
            <span className="mono-label">{h.developer.playground}</span>
            <strong>{h.developer.playgroundDetail}</strong>
            <span className="entry-arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>

    <ModelApplications locale={locale} />
  </main>;
}
