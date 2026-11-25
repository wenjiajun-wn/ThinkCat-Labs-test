import Link from 'next/link';
import {Brand} from './brand';
import {localized, type Locale, type Page} from '../../config/i18n';
import {copy} from '../../content/i18n';
import {site} from '../../config/site';

const footerPages: readonly Page[] = ['products', 'docs', 'playground', 'contact'];

export function SiteFooter({locale}:{locale:Locale}) {
  const t = copy[locale];
  return <footer className="site-footer">
    <div className="footer-primary">
      <div className="footer-brand">
        <Brand locale={locale} />
      </div>
      <nav className="footer-index" aria-label={t.footer.index}>
        {footerPages.map(page => <Link key={page} href={localized(locale, page)}>{page === 'products' ? t.nav[1] : t.titles[page]}</Link>)}
      </nav>
      <div className="footer-meta">
        <Link href={localized(locale, 'privacy')}>{t.titles.privacy}</Link>
        {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
      </div>
    </div>
    <div className="footer-legal">
      <span>© {new Date().getFullYear()} Thinkcat Labs</span>
      {site.legalName && <span>{site.legalName}</span>}
      {site.icp && <a href="https://beian.miit.gov.cn/">{site.icp}</a>}
      {site.policeRecord && <span>{site.policeRecord}</span>}
    </div>
  </footer>;
}
