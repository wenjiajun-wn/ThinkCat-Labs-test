import {Suspense} from 'react';
import {Playground, PlaygroundEntry} from '../playground';
import type {Locale} from '../../config/i18n';

export function PlaygroundPage({locale}:{locale: Locale}) {
  return <main id="main" className="subpage surface-playground">
    <Suspense fallback={<Playground locale={locale} />}>
      <PlaygroundEntry locale={locale} />
    </Suspense>
  </main>;
}
