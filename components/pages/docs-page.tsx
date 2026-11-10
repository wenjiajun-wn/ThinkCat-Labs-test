import {PageHead} from '../pages/page-head';
import {DeveloperDocs} from '../developer-docs';
import {docsCopy} from '../../content/docs';
import type {Locale} from '../../config/i18n';

export function DocsPage({locale}:{locale: Locale}) {
  const t = docsCopy[locale];
  return <main id="main" className="subpage surface-docs">
    <PageHead index="04" label={t.eyebrow} title={t.title} intro={t.intro} meta={t.meta} />
    <DeveloperDocs locale={locale} />
  </main>;
}
