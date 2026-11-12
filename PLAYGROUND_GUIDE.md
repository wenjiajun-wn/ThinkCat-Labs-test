# Playground

The Chinese and English workbenches are available at `/zh/playground/` and `/en/playground/`. Both use the same upload, preview, inference and results components. A compact Data Input title bar places the model name and remote-inference mode opposite the title. The workbench has one column, a six-row preview and a compact action toolbar. Previous and Next navigate the preview without changing the full inference dataset. Uploading or restoring the sample resets the preview to its first page.

## CSV input

- Use a comma-separated file with a header row. The preview selects a target automatically when exactly one header matches `label`, `target`, `class`, `y`, `risk`, or `outcome`, ignoring case. When there is no unique match, choose a target in the preview.
- Leave the selected target column blank only on rows to predict. All other columns must contain finite numbers.
- Use 20–500 data rows, at least 10 labeled rows, 1–50 prediction rows, 1–30 feature columns and 2–10 distinct classes. The upload limit is 1 MiB.
- The built-in sample is identified as Sample data (synthetic) and uses the same explicit target column. It contains 24 rows and 6 prediction rows.

The browser parses and validates the file before enabling Run Model. Running the model sends the parsed features and labels to the existing same-origin `POST /api/kumo/predict` endpoint. Use non-sensitive data. Production must provide that route alongside the static export.

## Input workspace

- The input area uses spacing and hairlines rather than nested card containers. Its data measure is capped at 1040px inside the 1160px workspace so columns remain coordinated on wide screens.
- The default preview shows four labeled rows followed by two query rows, with real CSV lines 2–5 and 20–21. This featured ordering affects presentation only and never changes the data sent to the API.
- Shared tokens define 42px header/data rows and 44px controls. Numeric values use tabular figures and right alignment; the target column uses only a low-contrast background.
- Run Model is the only primary action and sizes to its label on desktop. Upload CSV is secondary, Restore sample is a text action, and mobile keeps the main controls full width.
- CSV requirements stay inside a lightweight disclosure. Drag-and-drop guidance and the sensitive-data notice remain visible without competing with the table.

## Results workspace

- Idle, loading, error and success use separate compact presentations on the light workspace surface. They do not share a large dark container.
- Loading uses an indeterminate native progress element and shaped rows. It never invents a percentage.
- Error copy maps the actual request error type. Retry submits the current valid dataset, the request guard prevents concurrent submissions, and Back to Data preserves the current CSV and moves focus to Run Model.
- Success shows only available execution facts: prediction count and context-sample count. It does not invent latency, model versions or benchmark metrics.
- The prediction table includes a global sample number, original CSV line, every input feature, predicted class and predicted-class probability. It paginates ten rows at a time and uses a named, keyboard-focusable horizontal scroll region on narrow screens.
- CSV export contains every prediction row, independent of table pagination. The class-distribution graphic is computed from the actual model response; there is no decorative probability chart.

## Implementation and verification

- `lib/demo-data.ts` defines the fixed sample target and synthetic sample. `lib/csv.ts` parses CSV and keeps source line numbers.
- `components/playground.tsx` owns file loading, validation, the request lifecycle and CSV export. `source-panel.tsx` renders drag-and-drop upload, action hierarchy, help and privacy guidance. `data-table.tsx` owns the six-row preview, real source-line mapping and input pagination.
- `result-panel.tsx` provides the shared result header. `prediction-status.tsx` renders idle, loading and error; `prediction-results.tsx` composes the success summary, table and distribution.
- `prediction-table.tsx` owns result pagination and accessible table markup. `result-chart.tsx` renders only the actual predicted-class distribution. Shared run-state types live in `result-types.ts`.
- `lib/kumo-api.ts` builds requests, validates responses and maps results to the original CSV lines. The results CSV appends `source_row`, `kumo_prediction`, `kumo_probability` and `kumo_probabilities` to the original columns.

For controlled browser acceptance, build and start the static preview, then run:

```sh
npm run build
npm run preview
node scripts/playground-results-qa.mjs artifacts/playground-workspace-qa/after
```

The acceptance script intercepts only `/api/kumo/predict` with deterministic browser-only fixtures. It does not call the live model service. It verifies both locales at 1440px, 768px and 390px, all four result states, typed errors, retry, double-submit prevention, CSV preservation and download, input and result pagination, file-picker and drag-and-drop uploads, custom target selection, sample restoration, control dimensions and horizontal overflow. Screenshots and `qa-report.json` are written to the selected output directory. Browser-injected third-party assistant UI is excluded from screenshot evidence and recorded in the report.

Use `THINKCAT_QA_CAPTURE_ONLY=1` with the same command and a different output directory to capture only the six workspace baselines. Current evidence is grouped in `artifacts/playground-workspace-qa/before`, `round1` and `after`.

For a manual smoke test against the existing remote service, use `npm run preview -- --kumo` and the built-in synthetic sample. To check target selection, upload a CSV without a unique common target header and confirm Run Model stays disabled until a target is selected.
