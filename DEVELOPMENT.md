# Development V5.4

## Environment

- Node.js 22 (the project declares `>=22 <23`).
- npm 10.
- No backend, database, GPU worker, FastAPI service or inference API is required.

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm run build
node scripts/check-export.mjs
node --experimental-strip-types --test scripts/i18n.test.mjs
npm run preview
```

`npm run dev` runs Next.js on its default port. `npm run preview` serves the exported `out/` directory at `http://127.0.0.1:3000`.

## Build pipeline

```text
next build
  -> out/ static HTML for /zh/ and /en/
  -> postbuild: scripts/static-rsc-aliases.mjs
       creates aliases for Next 16 dynamic-route prefetch payloads
  -> node scripts/check-export.mjs
```

The postbuild alias script is required for a clean browser network panel. It only writes to `out/`; it does not modify source files, API contracts or server configuration.

Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS origin for a production build. Without it, the preview is intentionally `noindex` and has no canonical origin.

## Source map

```text
app/[locale]/layout.tsx        shell, nav, footer, static params
app/[locale]/page.tsx          Home
app/[locale]/[page]/page.tsx  localized page switch
components/pages/              page-level views
components/home/               home interactive sections
components/playground/         workspace panels and chart
components/docs/               code and navigation primitives
components/visualizations/     all procedural graphics
content/                       bilingual content
config/                        locales, models, site, SEO
lib/                           local CSV and demo-model logic
app/globals.css                Localized stylesheet imports
app/styles/home.css            Homepage sections, study grid, and breakpoints
app/legacy.css                 old noindex route styles
```

Read `FRONTEND_ARCHITECTURE.md`, `COMPONENT_GUIDELINES.md`, `I18N_GUIDE.md` and `PLAYGROUND_GUIDE.md` before changing the relevant layer.

## Visual QA

`node scripts/visual-qa.mjs` launches headless Edge through the Chrome DevTools Protocol and writes real browser screenshots.

It captures:

- every localized page at 1440x900, 768x1024 and 390x844;
- full-page desktop captures for Home, Products, Playground, Docs, Solutions and Vision in both languages;
- full-page mobile captures for Home, Products, Playground and Docs in both languages;
- interaction states for the model index, product matrix, time series, representation map, Playground loading/success/error, docs code tabs, all five industry studies and mobile navigation.

Outputs:

```text
screenshots/v5.2/after/           V5.2 screenshots + qa-report.json
screenshots/v5.2/before/          V5.1 baseline, 40 real screenshots
screenshots/v5.2/downloads/       real downloaded demo CSV
screenshots/v5.2/after/zh-...     page/viewport names are self-describing
```

The QA run also checks:

- no horizontal overflow at any tested viewport;
- one H1 per page;
- English pages have no leaked Chinese;
- the mobile menu opens, closes with Escape and returns `aria-expanded` to false;
- a client-side navigation still resolves to the correct route and H1;
- copy-to-clipboard reports success;
- the Playground produces six result rows, a success state and a downloaded CSV;
- invalid CSV values produce the correct inline error;
- reduced motion switches smooth scrolling off and collapses entrance motion;
- no browser console errors, page exceptions or failed network requests.

## V5.2 visual QA result

- 54 page/viewport combinations across 9 localized pages, 2 languages and 3 viewports.
- 20 full-page captures.
- 17 interaction/state captures.
- No horizontal overflow.
- H1 measured 56px on Home desktop, 51.84px on page desktop, 52px on Home tablet and 36.66-37.44px on mobile.
- No console, page or network errors in the final run.
- Reduced-motion scroll behavior computed `auto`.
- Clipboard copy and CSV download passed in headless Edge.

A production-origin build was also checked with `NEXT_PUBLIC_SITE_URL=https://thinkcat-v52-check.invalid`. The 18-route check passed canonical, hreflang and sitemap assertions. The preview export was then rebuilt without an origin, so the local `out/` remains intentionally `noindex`.

## Visual QA caveats

- Headless Edge was used for screenshots. A physical iOS or Android device was not part of this pass.
- The local demo result is deterministic nearest-neighbour output. It is not a model evaluation.
- The API docs are a front-end draft. No live endpoint, token or schema verification exists.
- The contact email, legal entity fields, model versions and public model links remain pending.

## Assets and licensing

- No font files, images, videos, icon packs, analytics scripts or CDN assets were added.
- Typography uses local operating-system fonts.
- The brand mark, favicon and all charts are original SVG/CSS/code generated in this repository.
- The favicon is generated from the same original mark. No third-party icon is used.
- No production dependency was added in V5.2.

See `ASSET_LICENSES.md` and `THIRD_PARTY_LICENSES.md`.

## Deployment notes

Publish the complete `out/` directory, including:

- `zh/` and `en/` route directories;
- `_next/static/`;
- `icon.svg` and `favicon.ico`;
- `THIRD_PARTY_NOTICES.txt`;
- the RSC alias files created by `postbuild`.

Use the real HTTPS origin before the production build. Do not mix files from different builds. See `DEPLOY_CN.md`.

## V5.2 changelog

- Rebuilt the visual system around compact editorial type, stronger data graphics and a four-surface rhythm.
- New static numerical field as the hero data stage.
- Three distinct product studies: matrix table, draggable time horizon and interactive representation map.
- New Playground workspace with real file input, label selection, parameters, loading/error/success states, charts and CSV download.
- New developer docs with sidebar, right TOC, mobile contents, code tabs, copy, syntax highlighting, parameter tables and a visible draft boundary.
- Five distinct industry visual studies, each with its own interaction.
- Vision, Research, Contact and Privacy aligned to the same system.
- Added favicon, RSC prefetch aliases and the visual QA script.
- Updated all design and engineering documentation.

## V5.3 frontend polish

- `app/globals.css` loads tokens, layout, shared components, page styles and responsive overrides in cascade order. Edit the relevant file in `app/styles/`. Use `tokens.css` for shared sizes and colors. Legacy routes still load their own stylesheet.
- The homepage retains its title scale and split composition. Its SVG mesh, floor grid and tick marks use the same projection. Keep the bilingual figure legend in HTML.
- Playground starts with the synthetic sample. Data preview and advanced parameters are disclosures. The most recent file or sample choice wins if reads overlap. During a run, the label and model controls are disabled, and the results announce progress outside their busy region. CSV results come from the existing local algorithm.
- API Docs retains the Draft banner. The mobile contents stay within reach while scrolling, tables have named keyboard-scrollable regions, and mobile code wraps visually while copying the original text.
- Run `npm run typecheck`, `npm run lint`, `npm run build`, and `node scripts/check-export.mjs`. Run `node --experimental-strip-types --test scripts/i18n.test.mjs` for language preference tests.
- Serve `out/` on port 3100 as described above, then run `node scripts/visual-qa.mjs screenshots/v5.3/after`. The optional argument selects the evidence directory. Browser profiles and downloaded CSV files are temporary. The QA report records the download check and screenshot results.
- See [V5.3 acceptance](V5.3_ACCEPTANCE.md) and the [baseline](screenshots/v5.3/before) and [final](screenshots/v5.3/after) screenshots.

## V5.4 homepage redesign

The homepage starts with the Numerical Field, then pairs the model research and industry studies before Vision, developer links, research highlights and contact.

In `app/styles/home.css`, change `--home-study-columns` to tune the 45 / 55 split for both chapters, `--home-study-gap` to change their shared gap, and `--home-inset` to change the 1240px content measure. Keep both columns top-aligned and let captions determine panel height. The grid stacks at 920px. Each panel uses the same `.study-graphic` aspect ratio per breakpoint.

Run `npm run typecheck`, `npm run lint`, `npm run build`, and `node scripts/check-export.mjs`. In a Chromium preview, check model and industry selection with a mouse, keyboard and touch. Check both locales at 1440×900, 768×1024 and 390×844. See the [baseline](screenshots/v5.4/before) and [final screenshots](screenshots/v5.4/after).

### V5.4 verification

- TypeScript, ESLint, production build and the static export check passed. The export check covered all 18 localized routes.
- Edge captured both locales at all three viewport sizes. Both desktop study panels measured 650.3px wide, and both homepage headlines occupied two lines at each size. The study columns stacked without horizontal overflow at the tested tablet and mobile sizes.
- Pointer hover and touch selected all three models and all five industries in both languages. Keyboard Tab updated both selectors. The browser also verified model detail link targets, the locale switch, saved language preference, automatic Chinese locale detection, successful demo inference and rejection of invalid CSV.
- See the [browser report](screenshots/v5.4/after/qa-report.json) for measurements and error logs.

