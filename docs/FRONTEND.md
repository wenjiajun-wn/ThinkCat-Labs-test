# Frontend maintenance

The current engineering guide is [FRONTEND_ARCHITECTURE.md](../FRONTEND_ARCHITECTURE.md). Component rules are in [COMPONENT_GUIDELINES.md](../COMPONENT_GUIDELINES.md), and the Playground pipeline is in [PLAYGROUND_GUIDE.md](../PLAYGROUND_GUIDE.md).

## Route changes

1. Add the slug to `pages` in `config/i18n.ts`.
2. Add title and intro copy to both branches of `content/i18n.ts`.
3. Create a page view under `components/pages/`.
4. Add the switch in `app/[locale]/[page]/page.tsx`.
5. Add the page to `app/[locale]/layout.tsx` navigation if it is primary.
6. Add it to `scripts/visual-qa.mjs`.
7. Run `npm run typecheck`, `npm run lint`, `npm run build` and `node scripts/check-export.mjs`.

## Model changes

Metadata lives in `config/models.ts`; bilingual narratives live in `content/products.ts`. Keep `version`, `github` and `huggingFace` null until verified. The product page renders a pending state rather than a false link.

Visualisations are local React/SVG components under `components/visualizations/`. Do not replace them with stock charts or model-generated data.
