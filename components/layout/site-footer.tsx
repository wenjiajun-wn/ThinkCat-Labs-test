import Link from 'next/link';
import {BrandMark} from './brand';
import {localized, type Locale, type Page} from '../../config/i18n';
import {copy} from '../../content/i18n';
import {site} from '../../config/site';

const footerPages: readonly Page[] = ['products', 'research', 'docs', 'playground', 'contact'];

export function SiteFooter({locale}:{locale:Locale}) {
  const t = copy[locale];
  const legalPages: readonly Page[] = ['privacy', 'contact'];
  return <footer className="site-footer">
    <div className="footer-primary">
      <div className="footer-brand">
        <BrandMark />
        <p>Thinkcat Labs</p>
        <span>{t.mission}</span>
      </div>
      <nav className="footer-index" aria-label={t.footer.index}>
        <span className="mono-label">{t.footer.index}</span>
        {footerPages.map(page => <Link key={page} href={localized(locale, page)}>{t.titles[page]}</Link>)}
      </nav>
      <div className="footer-meta">
        <span className="mono-label">{t.footer.legal}</span>
        {legalPages.map(page => <Link key={page} href={localized(locale, page)}>{t.titles[page]}</Link>)}
        {site.email ? <a href={`mailto:${site.email}`}>{site.email}</a> : <span>{t.emailPending}</span>}
      </div>
    </div>
    <div className="footer-legal">
      <span>© {new Date().getFullYear()} Thinkcat Labs</span>
      {site.legalName && <span>{site.legalName}</span>}
      {site.icp && <a href="https://beian.miit.gov.cn/">{site.icp}</a>}
      {site.policeRecord && <span>{site.policeRecord}</span>}
      <span className="footer-note">{t.footer.note}</span>
      <a className="footer-top" href="#main">{locale === 'zh' ? '回到顶部 ↑' : 'Back to top ↑'}</a>
    </div>
  </footer>;
}
