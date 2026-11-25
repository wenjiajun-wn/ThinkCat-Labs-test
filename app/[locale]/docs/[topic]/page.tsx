import {notFound} from 'next/navigation';
import {DocsPage} from '../../../../components/pages/docs-page';
import {docIds, docPath} from '../../../../content/docs-navigation';
import {documents} from '../../../../content/sdk-docs';
import {site} from '../../../../config/site';

type Props = {params: Promise<{locale: string; topic: string}>};
export const dynamicParams = false;
export function generateStaticParams() {
  return docIds.filter(id => id !== 'overview').map(topic => ({topic}));
}
async function resolvePage(params: Props['params']) {
  const {locale, topic} = await params;
  const id = docIds.find(item => item === topic && item !== 'overview');
  if (!id || (locale !== 'zh' && locale !== 'en')) notFound();
  return {id, locale} as const;
}
export async function generateMetadata({params}: Props) {
  const {id,locale} = await resolvePage(params);
  const page = documents[id];
  const zh = site.origin + docPath('zh',id);
  const en = site.origin + docPath('en',id);
  return {title: page.title[locale] + ' | ThinkCat Labs', description: page.intro[locale],
    alternates: {canonical: locale === 'zh' ? zh : en, languages: {'zh-CN':zh, en, 'x-default':en}}};
}
export default async function TopicPage({params}: Props) {
  const {id,locale} = await resolvePage(params);
  return <DocsPage locale={locale} topic={id}/>;
}
