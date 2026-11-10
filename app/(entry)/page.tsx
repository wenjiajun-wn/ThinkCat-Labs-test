'use client';
import Link from 'next/link';
import {useEffect} from 'react';
import {languageKey, preferredLanguage, localized} from '../../config/i18n';
export default function Entry() {
  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem(languageKey); } catch {}
    location.replace(localized(preferredLanguage(saved, navigator.language)));
  }, []);
  return <main className="section"><h1>Thinkcat Labs</h1><p><Link href="/zh/" lang="zh-CN">简体中文</Link> · <Link href="/en/" lang="en">English</Link></p></main>;
}

