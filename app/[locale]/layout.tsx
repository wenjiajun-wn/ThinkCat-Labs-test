import type {Viewport} from 'next';
import '../globals.css';
import {notFound} from 'next/navigation';
import {locales, localized, type Page} from '../../config/i18n';
import {copy} from '../../content/i18n';
import {SiteFooter} from '../../components/layout/site-footer';
import {SiteHeader} from '../../components/layout/site-header';

export const dynamicParams = false;
export function generateStaticParams() { return locales.map(locale => ({locale})); }

export const viewport: Viewport = {
  themeColor: '#f3f2e9',
  colorScheme: 'light',
};

const navigation: readonly {page?: Page; key: string}[] = [
  {key: 'home'},
  {page: 'products', key: 'products'},
  {page: 'vision', key: 'vision'},
  {page: 'docs', key: 'docs'},
  {page: 'playground', key: 'playground'},
];

export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) {
  const {locale} = await params;
  if (locale !== 'zh' && locale !== 'en') notFound();
  const t = copy[locale];
  const nav = navigation.map((item, index) => ({
    key: item.key,
    label: t.nav[index],
    href: localized(locale, item.page),
  }));
  return <html lang={locale === 'zh' ? 'zh-CN' : 'en'}>
    <body>
      <SiteHeader
        locale={locale}
        nav={nav}
        menuLabel={t.menu}
        closeLabel={t.close}
        languageLabel={locale === 'zh' ? 'Switch to English' : '切换到简体中文'}
        skipLabel={t.skip}
      />
      {children}
      <SiteFooter locale={locale} />
    </body>
  </html>;
}
