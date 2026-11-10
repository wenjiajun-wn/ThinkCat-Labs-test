import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const pages = ['', 'products/', 'vision/', 'docs/', 'playground/', 'research/', 'contact/', 'privacy/'];
const locales = ['zh', 'en'];
const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const origin = configuredOrigin ? new URL(configuredOrigin).origin : '';
const sitemap = readFileSync('out/sitemap.xml', 'utf8');
const robots = readFileSync('out/robots.txt', 'utf8');
for (const locale of locales) {
  for (const page of pages) {
    const route = '/' + locale + '/' + page;
    const html = readFileSync('out' + route + 'index.html','utf8');
    assert.match(html, new RegExp('<html lang="' + (locale === 'zh' ? 'zh-CN' : 'en') + '"'));
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/g,'').replace(/<[^>]*\blang="zh-CN"[^>]*>中<\/a>/g,'');
    if(locale==='en') assert.doesNotMatch(visible, /\p{Script=Han}/u, route);
    else {
      assert.match(visible, /在线体验/, route);
      assert.doesNotMatch(visible, /\bPlayground\b/, route);
    }
    for (const [,href] of html.matchAll(/href="(\/(?:zh|en)\/[^"#]*)"/g)) assert(existsSync('out'+href+'index.html'), href);
    if (origin) {
      assert(html.includes('rel="canonical" href="'+origin+route+'"'), route);
      for (const [language, target] of Object.entries({
        'zh-CN': '/zh/' + page,
        en: '/en/' + page,
        'x-default': page ? '/en/' + page : '/',
      })) {
        assert(html.toLowerCase().includes(`rel="alternate" hreflang="${language.toLowerCase()}" href="${origin.toLowerCase()}${target}"`), `${route} ${language}`);
      }
      assert(sitemap.includes(`<loc>${origin}${route}</loc>`), route);
    } else {
      assert(html.includes('noindex'), route);
      assert(!html.includes('rel="canonical"'), route);
    }
  }
}
assert.equal((sitemap.match(/<loc>/g) ?? []).length, origin ? locales.length * pages.length : 0);
for (const route of ['solutions', 'zh/solutions', 'en/solutions']) {
  assert(!existsSync(`out/${route}/index.html`), route);
}
if (origin) assert(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
else assert(!robots.includes('Sitemap:'));
assert(existsSync('out/index.html'));
assert.deepEqual(readFileSync('out/THIRD_PARTY_NOTICES.txt'), readFileSync('public/THIRD_PARTY_NOTICES.txt'));
console.log(`PASS: ${locales.length * pages.length} localized exports, language, navigation targets, metadata and sitemap`);
