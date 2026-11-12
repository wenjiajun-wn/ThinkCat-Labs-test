import {Playground} from '../playground';
import type {Locale} from '../../config/i18n';

export function PlaygroundPage({locale}:{locale: Locale}) {
  return <main id="main" className="subpage surface-playground">
    <Playground locale={locale} />
  </main>;
}
