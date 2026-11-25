import {DeveloperDocs} from '../developer-docs';
import type {Locale} from '../../config/i18n';

import type {DocId} from '../../content/docs-navigation';

export function DocsPage({locale, topic = 'overview'}:{locale: Locale; topic?: DocId}) {
  return <main id="main" className="subpage surface-docs"><DeveloperDocs key={topic} topic={topic} locale={locale} /></main>;
}
