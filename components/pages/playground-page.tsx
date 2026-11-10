import {PageHead} from '../pages/page-head';
import {Playground} from '../playground';
import {playgroundCopy} from '../../content/playground';
import type {Locale} from '../../config/i18n';

export function PlaygroundPage({locale}:{locale: Locale}) {
  const t = playgroundCopy[locale];
  return <main id="main" className="subpage surface-playground">
    <PageHead index="05" label={t.eyebrow} title={t.title} intro={t.intro} meta={t.meta} />
    <Playground locale={locale} />
  </main>;
}
