# Frontend architecture V5.4

The site is a statically exported Next.js App Router application. It has no server runtime, GPU worker or inference-service implementation. Interface state runs in the browser, and the Playground calls the existing same-origin inference route supplied by deployment.

## Runtime and output

- Next.js 16.4.5, React 19.3.1, TypeScript 5.9.3.
- `output: 'export'` and `trailingSlash: true`.
- Node 22 and npm 10.
- `npm run build` writes the static site to `out/`.
- `app/[locale]` renders `/zh/` and `/en/`.
- `app/(legacy)` keeps the older standalone routes with `noindex`.
- The browser entry `/` redirects to the saved language and falls back to the browser language.

## Route tree

```text
app/
  (entry)/                 language redirect
  (legacy)/                old noindex pages
  [locale]/
    layout.tsx             HTML language, header, footer, static params
    page.tsx               Home
    [page]/page.tsx        localized page switch
  globals.css              Localized stylesheet imports
  styles/home.css          Homepage layout and responsive rules
  legacy.css               isolated styles for legacy routes
  icon.svg                 original brand icon
  robots.ts
  sitemap.ts
```

Localized routes:

```text
/zh/  /zh/products/  /zh/docs/
      /zh/playground/  /zh/research/  /zh/contact/  /zh/privacy/
/en/  ... the same page set
```

## Content layer

Content is separate from presentation. Components receive locale and render typed content.

| Module | Responsibility |
| --- | --- |
| `content/i18n.ts` | Navigation, page titles, intros, footer labels, shared status words |
| `content/home.ts` | Home hero, premise, model system, applications, research, developer and contact copy |
| `content/products.ts` | Product page labels, model narratives, interaction instructions and notes |
| `content/solutions.ts` | Five industry studies, labels, questions and reading guidance |
| `content/research.ts` | Research areas, output verification state and page copy |
| `content/docs.ts` | Documentation navigation, section copy, parameter tables, samples and code |
| `content/playground.ts` | Workspace labels, validation messages, states and download copy |
| `content/contact.ts` | Contact and privacy copy |
| `config/models.ts` | Model IDs, order, status and optional verified external URLs |
| `config/i18n.ts` | Locale registry, page registry and route helpers |
| `config/site.ts` | Site identity, contact fields and optional production origin |

`config/models.ts` deliberately leaves version, GitHub and Hugging Face values `null` until verified. Components render a visible pending state instead of an invented link.

## Presentation layer

```text
components/
  layout/          brand, header, mobile menu, language switch, footer
  pages/           page-level composed views
  home/            shared HomeStudy layout, model index, industry index
  playground/      source, run states, prediction table and result distribution
  docs/            code block and code tabs
  visualizations/  field, representation map, model arts, industry studies
  developer-docs.tsx
  playground.tsx
```

The route file `app/[locale]/[page]/page.tsx` only chooses a page view. It does not hold styling or content.

Server components render the page shell and static content. Client islands are limited to:

- the header mobile menu;
- the representation map focus/hover state;
- home model selection and industry selection;
- product matrix, time cursor and related study state;
- the Playground workspace;
- the docs sidebar, code tabs and copy button;
- the industry studies.

## Playground data flow

```text
lib/demo-data.ts    synthetic CSV sample
      |
      v
lib/csv.ts          parse, limits, original line numbers
      |
      v
components/playground.tsx     state owner (file, validation, run status and CSV export)
      |
      +--> source-panel.tsx   dropzone, file metadata, preview
      +--> result-panel.tsx   idle / loading / error / success
              |
              +--> result-chart.tsx
```

`lib/kumo-api.ts` validates the dataset and uses the existing same-origin `POST /api/kumo/predict` contract. The Playground auto-selects a unique common target header or asks for a selection, and sends features and labels only when Run Model is pressed.

The downloaded CSV appends the original line number, predicted class, predicted-class probability and class probability map.

The download note states that every prediction row is included regardless of table pagination. Prediction rows and distribution bars come from the validated model response, not generated display data.

## Documentation layer

The docs page is intentionally a front-end draft:

- left section navigation and right table of contents;
- mobile navigation in a native `details` element;
- language examples in cURL, TypeScript and Python;
- code copy with clipboard fallback;
- parameter, error and model tables;
- an explicit draft banner and repeated statement that no live service exists.

Code samples use `{API_HOST}` and `$THINKCAT_TOKEN` placeholders. There is no real endpoint, token or external API link.

## Internationalization

The locale is a route segment. `app/[locale]/layout.tsx` sets the HTML language at build time. The language switch keeps the current page slug and persists the choice in `localStorage`. Direct locale URLs win over the saved value.

English pages must not contain visible Chinese except the language-switch anchor, which is explicitly excluded by the export check. Chinese pages use `在线体验` and must not display the English word `Playground` in visible copy.

## Static export and RSC aliases

Next.js 16 writes dynamic-route RSC payloads into nested directories while client prefetch requests dotted filenames. `scripts/static-rsc-aliases.mjs` runs as `postbuild` and creates aliases in `out/` only. This removes prefetch 404s without changing the app runtime.

The postbuild step does not alter backend services, API contracts or hosted configuration.

## Build and verification pipeline

```text
npm run typecheck
npm run lint
npm run build        # next build + postbuild aliases
node scripts/check-export.mjs
node scripts/visual-qa.mjs
```

`scripts/check-export.mjs` checks 14 localized exports, language attributes, navigation targets, canonical/hreflang behavior when an origin is configured, sitemap and robots. `scripts/visual-qa.mjs` covers the general site, while `scripts/playground-results-qa.mjs` verifies the four result states and recovery interactions with controlled API fixtures.

## Constraints

- No backend, FastAPI, GPU worker, inference API or deployment service was added.
- No new production dependency was added.
- No external image, font or CDN asset is loaded.
- Synthetic illustrations and sample input are labelled; Playground prediction graphics derive from the actual model response.
- External model links and contact email remain pending until verified.

## Homepage structure

The localized homepage in `app/[locale]/page.tsx` renders the Numerical Field hero, brand marquee, developer entry points and model applications. The shared footer comes from the locale layout.

`HomeStudy` renders the section heading, controls and data panel. `ModelIndex` and `FieldIndex` each own selection and localized content. They pass the original model glyph or industry miniature into the panel and expose selection with `aria-pressed`. Only their selected plots animate. Homepage layout and responsive rules live in `app/styles/home.css`.

