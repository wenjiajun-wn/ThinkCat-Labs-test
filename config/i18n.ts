export const locales = ['zh', 'en'] as const;
export type Locale = typeof locales[number];
export const pages = ['products','docs','playground','research','contact','privacy'] as const;
export type Page = typeof pages[number];
export const languageKey = 'thinkcat-language';
export function localized(locale: Locale, page?: Page) {
  return page ? '/' + locale + '/' + page + '/' : '/' + locale + '/';
}
export function preferredLanguage(saved: string | null, browser: string): Locale {
  if (saved === 'zh' || saved === 'en') return saved;
  return /^zh(?:-|$)/i.test(browser) ? 'zh' : 'en';
}
export const fieldVisuals = ['finance','energy','health','retail','industry'] as const;
