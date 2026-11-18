'use client';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {playgroundLanguageEvent} from '../../lib/playground-language-state';
import {languageKey, type Locale} from '../../config/i18n';

export function LanguageSwitch({locale, label}:{locale:Locale; label:string}) {
  const pathname = usePathname();
  const router = useRouter();
  const alternate = locale === 'zh' ? 'en' : 'zh';
  const href = pathname.replace(/^\/(zh|en)(?=\/|$)/, '/' + alternate) + (pathname.endsWith('/') ? '' : '/');
  return <Link
    className="language-switch"
    href={href}
    hrefLang={alternate}
    lang={alternate === 'zh' ? 'zh-CN' : 'en'}
    aria-label={label}
    onClick={event => {
      try { localStorage.setItem(languageKey, alternate); } catch {}
      const destination = href + window.location.search + window.location.hash;
      event.currentTarget.href = destination;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      window.dispatchEvent(new CustomEvent(playgroundLanguageEvent, {detail: destination.split('#')[0]}));
      router.push(destination);
    }}
  >{alternate === 'zh' ? '中' : 'EN'}</Link>;
}
