# Playground guide V5.2

The Playground is a browser-only frontend demo. It is not connected to a GPU, FastAPI service, model endpoint or real inference API.

## What is implemented

- Model selector with the tabular local demo active.
- Time Series and Unified models shown as awaiting API and disabled.
- CSV drag and drop plus a real file-picker button.
- Numeric CSV parser with configurable label column.
- Data preview with the label column highlighted.
- Parameters: neighbours, Euclidean or Manhattan distance, feature normalisation.
- Run action with loading, error and success states.
- Class distribution and per-row agreement charts.
- Downloadable results CSV.

## Boundaries

- Every result is labelled `Demo` in Chinese and English.
- The result panel repeats the browser-only boundary.
- The downloaded file includes `demo_prediction`, `demo_agreement` and `demo_note`.
- No file, feature value or result leaves the browser.
- The model selector does not pretend the other models are available.
- No model weights, API host, token or server contract exists in this repository.

## Files

```text
lib/demo-data.ts                  synthetic CSV sample
lib/csv.ts                        parser, limits, label-column detection
lib/demo-model.ts                 dataset builder, kNN, metrics, result types
components/playground.tsx         state owner and file/download actions
components/playground/source-panel.tsx
components/playground/config-panel.tsx
components/playground/result-panel.tsx
components/playground/result-chart.tsx
components/playground/data-table.tsx
content/playground.ts             labels, validation messages and page copy
```

## CSV contract

- UTF-8 text, comma separated.
- First row is a header.
- 2–14 columns.
- Up to 200 data rows and 64 KiB.
- Quoted or unquoted fields are accepted by the parser, but quoted multiline cells are not supported.
- The chosen label column can be anywhere.
- A labeled row has a non-empty label and acts as context.
- An unlabeled row has an empty label and becomes a prediction row.
- Every other column must parse as a finite number.
- At least one context row and one query row are required.

Limits live in `lib/csv.ts` under `csvLimits`. If they change, update `content/playground.ts` and this guide.

## Replacing the demo data

Edit `lib/demo-data.ts`:

```ts
export const sampleCsv = `feature_a,feature_b,label
1.2,3.4,class_a
...`;

export const sampleFile = {
  name: 'your-demo.csv',
  description: '...',
};
```

The sample must keep at least one labeled row and one unlabeled row. The default `label` header is detected automatically; if no `label` header exists, the final column becomes the initial label column.

The sample is synthetic. Do not replace it with customer data, production extracts or sensitive records.

## Changing the local classifier

`lib/demo-model.ts` owns:

- `buildDataset(csv, labelIndex)`;
- `runLocalDemo(dataset, params)`;
- typed predictions, confidence/agreement, distance and distribution.

The current algorithm is nearest-neighbour classification. If the algorithm changes:

1. Keep the `DemoResult` shape used by the result panel, or update the panel types in the same change.
2. Keep agreement as a value from 0 to 1.
3. Keep the model output labelled as a local demo.
4. Add a deterministic synthetic sample that demonstrates the new behaviour.
5. Update `content/playground.ts` labels if the user-facing explanation changes.

## Replacing with a real API later

The intended boundary is:

```text
CSV/file state -> dataset adapter -> API client -> result adapter -> ResultPanel
```

Recommended sequence:

1. Add a client module under `lib/` with a typed request and response adapter.
2. Keep the CSV parsing and validation in the browser.
3. Post only the minimum necessary payload to a reviewed gateway.
4. Add authentication outside the public static bundle. Never ship a production token.
5. Keep the same result state machine: idle, running, error, success.
6. Replace the `demo` labels with a real status only after the service and model rights are verified.
7. Keep the local demo as a separate mode, not a fallback that silently calls a remote model.
8. Do not change the docs contract until the API is verified.

## Downloading results

`components/playground.tsx` builds the CSV in the browser:

```text
original feature cells + demo_prediction + demo_agreement + demo_note
```

The note is `DEMO: local nearest-neighbor, not model output`. Do not remove it while the result is simulated.

## Manual checks

- Drag a valid CSV onto the panel.
- Use the visible file button with a keyboard.
- Change the label column and confirm the preview highlight moves.
- Run with empty labels. Confirm the success state and six result rows for the sample.
- Upload a non-numeric feature. Confirm the inline error and disabled run button.
- Download the result and confirm the file name and demo columns.
- Resize to 390px and check the source, config and result panels stack without horizontal overflow.
- Test with `prefers-reduced-motion: reduce`.
