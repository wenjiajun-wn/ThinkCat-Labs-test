import type {Metadata} from 'next';
import {site} from '../config/site';
import {localized, type Locale, type Page} from '../config/i18n';
import {copy} from '../content/i18n';

export function localeMetadata(locale:Locale, page?:Page):Metadata {
  const t = copy[locale];
  const title = page ? t.titles[page] + ' | Thinkcat Labs' : 'Thinkcat Labs | ' + t.hero.join(' ');
  const description = page ? t.intro[page] : t.mission;
  return {
    title, description, robots:{index:!!site.origin, follow:true},
    openGraph:{title,description,locale:locale === 'zh' ? 'zh_CN' : 'en_US',siteName:'Thinkcat Labs'},
    ...(site.origin && {alternates:{canonical:site.origin+localized(locale,page), languages:{
      'zh-CN':site.origin+localized('zh',page), en:site.origin+localized('en',page),
      'x-default':site.origin+(page ? localized('en',page) : '/'),
    }}}),
  };
}
