import type {MetadataRoute} from 'next';
import {site} from '../config/site';
import {locales,pages,localized} from '../config/i18n';
export const dynamic = 'force-static';
export default function sitemap():MetadataRoute.Sitemap {
  if (!site.origin) return [];
  return [undefined,...pages].flatMap(page => {
    const languages = {'zh-CN':site.origin+localized('zh',page), en:site.origin+localized('en',page)};
    return locales.map(locale => ({url:site.origin+localized(locale,page),alternates:{languages}}));
  });
}
