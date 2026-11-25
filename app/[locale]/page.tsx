import {donationPayload} from '../../content/developer-examples';
import {DeveloperCard} from '../../components/home/developer-card';
import styles from '../../components/home/developer.module.css';
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

  const sample = donationPayload.rows.slice(-4);
  return <main id="main" className="home">
    <div className="home-first-screen">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <h1 id="home-title"><span>{t.hero[0]}</span>{' '}<span>{t.hero[1]}</span></h1>
        </div>
        <figure className="hero-figure">
          <NumericalField label={h.hero.fieldLabel} />
        </figure>
      </section>

      <BrandMarquee locale={locale} />
    </div>

    <section className={styles.section} aria-labelledby="developer-title">
      <div>
        <h2 id="developer-title">{h.developer.title}</h2>
        <div className={styles.links}>
          <Link href={localized(locale, 'docs')}>{h.developer.docs}<span aria-hidden="true">→</span></Link>
          <Link href={localized(locale, 'playground')}>{h.developer.playground}<span aria-hidden="true">→</span></Link>
        </div>
        <div className={styles.preview}>
          <div className={styles.previewTitle}><h3>{h.developer.preview}</h3><span>{sample.length} / {donationPayload.rows.length} {h.developer.total}</span></div>
          <table aria-label={h.developer.preview}>
            <thead><tr>{h.developer.columns.map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
            <tbody>{sample.map((row, i) => <tr key={i}><td>{row.months}</td><td>{row.donations}</td><td>{row.returned ?? <em>{h.developer.pending}</em>}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <DeveloperCard locale={locale} />
    </section>

    <ModelApplications locale={locale} />
  </main>;
}
