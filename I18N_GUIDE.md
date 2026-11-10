# Internationalization guide V5.2

The site exports two complete static locales. There is no runtime language server and no automatic translation at request time.

## Route structure

```text
/zh/  /zh/products/  /zh/vision/  /zh/solutions/  /zh/docs/
      /zh/playground/  /zh/research/  /zh/contact/  /zh/privacy/
/en/  /en/products/  /en/vision/  /en/solutions/  /en/docs/
      /en/playground/  /en/research/  /en/contact/  /en/privacy/
```

`config/i18n.ts` holds the locale and page registries. `localized(locale, page)` is the single route helper. Do not hand-build a localized path in a component.

## Content ownership

| Content | File |
| --- | --- |
| Navigation, page titles, intros, shared status words | `content/i18n.ts` |
| Home narrative | `content/home.ts` |
| Product studies | `content/products.ts` |
| Industry studies | `content/solutions.ts` |
| Vision | `content/vision.ts` |
| Research | `content/research.ts` |
| Docs copy and samples | `content/docs.ts` |
| Playground labels and errors | `content/playground.ts` |
| Contact and privacy | `content/contact.ts` |

Model order and publication state are in `config/models.ts`. Bilingual model narratives are in `content/products.ts`. The two are intentionally separate, so a model can stay in `research` status while the copy is reviewed.

## Editing copy

1. Open the relevant content module.
2. Change both `zh` and `en`.
3. Read the Chinese as Chinese, not as a translation of English. Shorten where Chinese needs fewer characters.
4. Keep technical identifiers, code fields, model IDs and HTTP methods untranslated.
5. Do not add a product claim, metric, customer, benchmark, email or public URL that has not been verified.

## UI language rules

- Chinese uses `在线体验` for the Playground page. The visible word `Playground` must not appear on a Chinese page.
- English must not contain visible Han characters except the language-switch anchor `简体中文`, which is excluded by the export check.
- Chinese pages use the localized nav, labels, figure titles, button labels and page-level metadata.
- English pages use English titles, descriptions and `alt`/`aria` labels.
- Technical visual labels such as `POST`, `TypeScript`, `cURL` and model IDs remain as technical identifiers.

## Language selection

- `components/layout/language-switch.tsx` keeps the current slug and switches only the locale prefix.
- The choice is written to `localStorage` under `thinkcat-language`.
- `/` uses the saved choice, then the browser language, then English.
- A direct locale URL always wins.
- `hrefLang` and the HTML `lang` attribute are set for the alternate language.

## Adding a page in both languages

1. Add the slug to `pages` in `config/i18n.ts`.
2. Add `titles` and `intro` in both branches of `content/i18n.ts`.
3. Add page content to a content module.
4. Create the page view under `components/pages/`.
5. Add the switch in `app/[locale]/[page]/page.tsx`.
6. Add it to the header or footer if it is a primary destination.
7. Add the route to the QA script.
8. Run:

```sh
npm run typecheck
npm run lint
npm run build
node scripts/check-export.mjs
```

## Verification

`scripts/check-export.mjs` verifies:

- 18 localized HTML exports;
- `<html lang>` for both locales;
- that English visible text contains no Han characters;
- that Chinese pages contain `在线体验` and no visible `Playground`;
- every localized internal `href` resolves to a generated page;
- canonical, hreflang and sitemap behavior when `NEXT_PUBLIC_SITE_URL` is set;
- noindex and no canonical when the origin is absent.

For visual verification:

```sh
node scripts/visual-qa.mjs
```

That script checks both locales at 1440, 768 and 390 and writes screenshots to `screenshots/v5.2/after`.

## Metadata

`config/seo.ts` uses localized titles, descriptions and Open Graph locale. When a production origin exists it adds canonical and `hreflang` alternates for `zh-CN`, `en` and `x-default`. Without an origin, localized pages are intentionally `noindex`.

## Pending content

The following must remain visibly pending until verified:

- legal entity, ICP and police record fields;
- contact email;
- model version, GitHub and Hugging Face links;
- publication and authorship entries on Research;
- any benchmark or client result.

Empty values must not be replaced with plausible-looking placeholders.
