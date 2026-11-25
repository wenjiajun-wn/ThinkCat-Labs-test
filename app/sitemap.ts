import type {MetadataRoute} from 'next';
import {site} from '../config/site';
import {locales,pages,localized} from '../config/i18n';
import {docIds, docPath} from '../content/docs-navigation';
export const dynamic = 'force-static';
export default function sitemap():MetadataRoute.Sitemap {
  if (!site.origin) return [];
  const main = [undefined,...pages].flatMap(page => {
    const languages = {'zh-CN':site.origin+localized('zh',page), en:site.origin+localized('en',page)};
    return locales.map(locale => ({url:site.origin+localized(locale,page),alternates:{languages}}));
  });
  return [...main, ...docIds.filter(id => id !== 'overview').flatMap(id => {
    const languages = {'zh-CN':site.origin+docPath('zh',id), en:site.origin+docPath('en',id)};
    return locales.map(locale => ({url:site.origin+docPath(locale,id),alternates:{languages}}));
  })];
}
