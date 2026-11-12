import Link from 'next/link';
import {PageHead} from '../pages/page-head';
import {contactCopy} from '../../content/contact';
import {site} from '../../config/site';
import {copy} from '../../content/i18n';
import {localized, type Locale} from '../../config/i18n';

export function ContactPage({locale}:{locale: Locale}) {
  const t = contactCopy[locale];
  const chrome = copy[locale];
  return <main id="main" className="subpage surface-contact">
    <PageHead label={t.eyebrow} title={t.title} intro={t.intro} meta={t.meta} tone="dark" />
    <section className="contact-page">
      <div className="contact-grid">
        {t.channels.map((channel, index) => <article key={channel.title} className="contact-channel">
          <span className="mono-label">0{index + 1} / {channel.label}</span>
          <h2>{channel.title}</h2>
          <p>{channel.body}</p>
        </article>)}
      </div>
      <div className="contact-email-block">
        <span className="mono-label">{t.emailLabel}</span>
        {site.email
          ? <a href={`mailto:${site.email}`}>{site.email}<span aria-hidden="true">↗</span></a>
          : <p>{t.emailPending}</p>}
        <p className="contact-note">{t.note}</p>
      </div>
    </section>
    <section className="contact-close">
      <div><span className="mono-label">{t.meta}</span><h2>{t.closeTitle}</h2></div>
      <Link className="button button-ink" href={localized(locale, 'products')}>{chrome.titles.products}<span className="button-icon" aria-hidden="true">↗</span></Link>
    </section>
  </main>;
}
