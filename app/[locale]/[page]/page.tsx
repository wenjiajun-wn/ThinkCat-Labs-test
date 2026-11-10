import {notFound} from 'next/navigation';
import {pages, type Page} from '../../../config/i18n';
import {localeMetadata} from '../../../config/seo';
import {ProductsPage} from '../../../components/pages/products-page';
import {DocsPage} from '../../../components/pages/docs-page';
import {PlaygroundPage} from '../../../components/pages/playground-page';
import {VisionPage} from '../../../components/pages/vision-page';
import {ResearchPage} from '../../../components/pages/research-page';
import {ContactPage} from '../../../components/pages/contact-page';
import {PrivacyPage} from '../../../components/pages/privacy-page';

type Props = {params: Promise<{locale: string; page: string}>};

export const dynamicParams = false;
export function generateStaticParams() { return pages.map(page => ({page})); }

export async function generateMetadata({params}: Props) {
  const {locale, page: slug} = await params;
  if ((locale !== 'zh' && locale !== 'en') || !pages.includes(slug as Page)) notFound();
  return localeMetadata(locale, slug as Page);
}

export default async function LocalizedPage({params}: Props) {
  const {locale, page: slug} = await params;
  if ((locale !== 'zh' && locale !== 'en') || !pages.includes(slug as Page)) notFound();
  const page = slug as Page;

  if (page === 'products') return <ProductsPage locale={locale} />;
  if (page === 'docs') return <DocsPage locale={locale} />;
  if (page === 'playground') return <PlaygroundPage locale={locale} />;
  if (page === 'vision') return <VisionPage locale={locale} />;
  if (page === 'research') return <ResearchPage locale={locale} />;
  if (page === 'contact') return <ContactPage locale={locale} />;
  return <PrivacyPage locale={locale} />;
}
