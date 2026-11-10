'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {languageKey, type Locale} from '../../config/i18n';

export function LanguageSwitch({locale, label}:{locale:Locale; label:string}) {
  const pathname = usePathname();
  const alternate = locale === 'zh' ? 'en' : 'zh';
  const href = pathname.replace(/^\/(zh|en)(?=\/|$)/, '/' + alternate) + (pathname.endsWith('/') ? '' : '/');
  return <Link
    className="language-switch"
    href={href}
    hrefLang={alternate}
    lang={alternate === 'zh' ? 'zh-CN' : 'en'}
    aria-label={label}
    onClick={() => {
      try { localStorage.setItem(languageKey, alternate); } catch {}
    }}
  >{alternate === 'zh' ? '中' : 'EN'}</Link>;
}
