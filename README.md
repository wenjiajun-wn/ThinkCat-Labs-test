# Thinkcat Labs

Thinkcat Labs is a bilingual research website for numerical foundation models. The site is a static Next.js App Router export with original procedural data visualizations, a Playground frontend for the existing remote Kumo inference route and draft developer documentation.

V5.2 rebuilds the frontend around the numerical field, three distinct model studies, a professional Playground workspace, developer docs, five industry data studies and a compact editorial design system.

## Run

Use Node.js 22 and npm 10.

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

`npm run build` writes the static export to `out/` and runs the postbuild RSC alias step. `npm run preview` serves the export at `http://127.0.0.1:3000`.

Set `NEXT_PUBLIC_SITE_URL` to the production HTTPS origin before building. Without it, localized pages are intentionally `noindex`.

## Structure

- `app/[locale]` renders both languages from shared page components.
- `app/(legacy)` retains the earlier standalone routes with `noindex`.
- `app/globals.css` contains the V5.2 design tokens and localized site styles.
- `components/pages` composes page-level views.
- `components/visualizations` contains the original SVG data art.
- `components/playground` separates data source, run states, prediction tables and result presentation.
- `content` contains bilingual content modules.
- `config` contains locale, model, site and SEO configuration.
- `lib` contains local CSV parsing, synthetic input data and the existing Kumo API client.

## Documentation

- [Design system](DESIGN_SYSTEM.md)
- [Frontend architecture](FRONTEND_ARCHITECTURE.md)
- [Component guidelines](COMPONENT_GUIDELINES.md)
- [Internationalization](I18N_GUIDE.md)
- [Playground guide](PLAYGROUND_GUIDE.md)
- [Development and visual QA](DEVELOPMENT.md)
- [V5.2 acceptance](V5.2_ACCEPTANCE.md)
- [Project handover](HANDOVER.md)
- [Deployment in mainland China](DEPLOY_CN.md)
- [Termius / Linux deploy scripts](deploy/README.md)
- [Screenshot evidence](screenshots/v5.2/README.md)

## Boundaries

The repository contains no backend, FastAPI service, GPU model worker or production contact details. The Playground calls the existing same-origin `POST /api/kumo/predict` contract, which deployment must provide; controlled browser QA uses local fixtures instead. Synthetic illustrations and the sample CSV are labelled, while prediction tables and distribution graphics map the actual inference response. API documentation is a front-end draft, not a specification of the running service.
