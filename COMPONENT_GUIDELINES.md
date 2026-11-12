# Component guidelines V5.4

Reuse the shared primitives before adding a new class or component. The visual system lives in `app/globals.css`; content lives in `content/`; a component should not hardcode bilingual copy.

## Page primitives

### `PageHead`

```tsx
<PageHead
  index="03"
  label={copy.eyebrow}
  title={copy.title}
  intro={copy.intro}
  meta={copy.meta}
  tone="dark"
/>
```

- Index is a section locator, not decoration.
- Title is one H1 only.
- Body sits under the title. Do not turn the page intro into a large type left column with a competing small right column.
- `tone="dark"` is used for research and contact.

### Header and footer

- `SiteHeader` is the only sticky navigation surface. It is solid paper, not a translucent glass bar. Desktop navigation uses the shared `15px` navigation token on every localized page, including the homepage.
- The mobile menu is a dialog: body scroll is locked, main and footer become inert, focus is trapped, Escape closes, and focus returns to the toggle.
- The homepage ecosystem list is static and wraps by breakpoint. Do not restore automatic marquee motion or duplicate brand groups.
- `SiteFooter` contains the index, legal links and the synthetic-data note. Do not add fake emails or social accounts.

### Shared classes

| Class | Use |
| --- | --- |
| `.mono-label` | Small uppercase metadata, coordinates, states |
| `.button` + `.button-accent` / `.button-ink` / `.button-outline` | Actions |
| `.text-link` | Secondary inline path |
| `.status-mark` | Research, preview or pending state |
| `.section-head` | Section title and supporting paragraph |
| `.figure-caption` | Figure label and synthetic-data note |
| `.home-section-rail` | Number + line + label orientation rail |

One primary action per context. Buttons need a visible focus ring and 44px minimum target size.

## Visualisation components

### `NumericalField`

- Hero field on the Home page.
- The field is a static data stage: contour mesh, axis marks and synthetic-data labels. It has no pointer probe or scanning animation.
- Keep the `aria-label` localized. The visual is decorative and informational; there is no interaction to announce.

### `RepresentationMap`

- Used by the Unified model study.
- Four mapping pairs are keyboard focusable. Enter/Space toggles the active pair; Escape clears it.
- Do not describe the arcs as discovered semantics. They are a testable correspondence hypothesis.

### `TabularMatrix`

- A real table with column and row headers.
- Roving focus: only the selected cell is in the tab order. Arrow keys move the selection.
- The readout is the visual value display; cell values are secondary.
- Keep the table caption available to assistive technology.

### `TimeSeriesStudy`

- The observed path, forecast path, uncertainty band and forecast origin are all labelled.
- The range input is the accessible control. The visual cursor follows it.
- The chart is synthetic, not model output.

### Industry studies

Each industry has its own data language:

| Industry | Interaction |
| --- | --- |
| Finance | Baseline / shifted distribution toggle and review threshold |
| Energy | Hour scrubber across a synthetic load curve |
| Healthcare | Indicator-pair switch over an association scatter |
| Retail | Week and hour scrubbers over a demand matrix |
| Industry | Time scrubber across three sensor channels and a deviation window |

Do not collapse these into one reusable card with a different accent. They are separate compositions on purpose.

### `ModelGlyph` and `IndustryMiniature`

These are compact index visuals, not alternate charts. Use them in previews where a full study would overwhelm the hierarchy.

## Playground components

### `components/playground.tsx`

Owns the parsed CSV and file name, selected target column, idle / running / error / success state, active-request guard and download handler. It does not own CSV parsing, response validation or model logic.

Retry must call the same run path with the current valid dataset. Back to Data preserves the CSV and focuses Run Model. File or target changes cancel the active run and invalidate stale reads.

### `SourcePanel`

- Drag and drop is an enhancement. The visible file button controls a real file input.
- Show the file name and row / column counts without repeating the page introduction.
- Keep Run Model primary, Upload CSV secondary and Restore sample tertiary. Restore also resets the current preview page.
- Keep format requirements in a lightweight disclosure and the sensitive-data notice visible.
- Run Model is disabled while running or invalid.

### `DataTable`

- Show six preview rows with real source line numbers. Preserve the featured sample lines 2–5 and 20–21 without changing request data.
- Use the shared 42px row token, tabular numerals, right-aligned numeric cells and restrained target-column highlighting.
- Keep pagination compact and at the bottom right. Wide datasets use a named, keyboard-focusable horizontal scroll region.
- Show target selection only when automatic detection is ambiguous.

### `ResultPanel` and `PredictionStatus`

- Keep a compact shared header with the current state, model and Back to Data action.
- Idle explains the next step without decorative metrics.
- Loading combines indeterminate native progress with shaped rows and never invents a percentage.
- Error is inline, names the actual failure and preserves a clear Retry / Back to Data recovery path.
- Use focus, `aria-busy`, the error alert and the success live region without duplicating announcements.

### `PredictionResults` and `PredictionTable`

- Success exposes only actual prediction and context-sample counts, not invented latency or model versions.
- The table includes global sample numbers, original CSV lines, every input feature, predicted class and predicted-class probability.
- Paginate ten rows while keeping global sample numbers stable. Export every prediction row.
- Wide tables stay inside a named, keyboard-focusable horizontal scroll region.

### `ResultChart`

- Uses only the actual predicted-class distribution.
- The data table remains the accessible source of exact values.
- Do not add decorative probability plots or call predicted-class probability "accuracy".

## Docs components

- `CodeBlock` highlights code without a syntax library, copies through the clipboard with a manual fallback and exposes a live status message.
- `CodeTabs` supports arrow-key tab navigation.
- `DeveloperDocs` owns active-section tracking through `IntersectionObserver`.
- The mobile navigation is a native `details` element. It closes after choosing a section.
- The draft banner is mandatory. Do not present the sample endpoint as a live API.

## Adding a new model

1. Add the model ID and verified status fields in `config/models.ts`.
2. Add bilingual copy in `content/products.ts` under `studies`.
3. Add the visual branch in `components/pages/products-page.tsx`, or a new study component if the data form is different.
4. Add the home preview only if it remains useful at small size.
5. Keep `version`, `github` and `huggingFace` null until verified.
6. Check the product page at 1440, 768 and 390, then update `scripts/check-export.mjs` if a route is added.

## Adding a page

1. Add the slug to `config/i18n.ts`.
2. Add title and intro copy to `content/i18n.ts`.
3. Add a page view under `components/pages/`.
4. Add the route switch in `app/[locale]/[page]/page.tsx`.
5. Add the page to `navigation` in `app/[locale]/layout.tsx` if it belongs in the main navigation.
6. Add it to the footer if useful.
7. Add it to `scripts/visual-qa.mjs` and run the full check.

## CSS rules

- Tokens first. Do not introduce a one-off colour.
- Prefer hairline rules, surface changes and spacing over card borders and shadows.
- Keep control radii at 4–8px, media frames at 0–4px and status labels at pill radius.
- Every interactive element needs hover, focus-visible and disabled/active states.
- Do not animate layout properties. Use `transform` and `opacity`.
- No `100vh`. Use `100svh` or `min-height`.
- Keep mobile table and code overflow inside a labelled scroll region.
- Avoid hidden text overflow; test Chinese and English independently.

## Content truth

- Every synthetic figure must say it is synthetic.
- The synthetic input sample must be identified as synthetic. Playground predictions must come from the validated remote response; generated fixtures belong only in browser QA, never in production results.
- The API reference must say `Draft` and `not a live service`.
- Pending models must show `Pending verification` or the Chinese equivalent.
- Never invent GitHub, Hugging Face, customer, benchmark or contact details.

## Maintaining homepage studies

- Add a model to `config/models.ts` and complete both locales in `content/products.ts`. Register its glyph in `components/visualizations/model-arts.tsx` and give it a matching Products section ID. The homepage list reads the model registry and derives the detail link from that ID.
- Add an industry ID and a complete record for both locales in `content/solutions.ts`. Add the homepage caption in `content/home.ts`, register the miniature in `components/visualizations/industry-miniatures.tsx` and keep the Solutions view in sync. Keep the scenario question and reading distinct, and label synthetic data explicitly.
- Keep numerical geometry in the visualization component and captions in localized content. Preserve each SVG viewBox and test the artwork within the shared plot area at 390px. When adding SVG paint servers, give their IDs instance scope to avoid collisions. Keep the Numerical Field projection and grid in sync when changing the terrain.

