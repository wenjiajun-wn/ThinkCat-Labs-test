# Component guidelines V5.4

Reuse the shared primitives before adding a new class or component. The visual system lives in `app/globals.css`; content lives in `content/`; a component should not hardcode bilingual copy.

## Page primitives

### `PageHead`

```tsx
<PageHead
  label={copy.eyebrow}
  title={copy.title}
  intro={copy.intro}
  meta={copy.meta}
  tone="dark"
/>
```

- Page intros omit decorative numbering.
- Title is one H1 only.
- Body sits under the title. Do not turn the page intro into a large type left column with a competing small right column.
- `tone="dark"` is used for research and contact.

### Header and footer

- `SiteHeader` is the only sticky navigation surface. It is solid paper, not a translucent glass bar. Desktop navigation uses the shared `15px` navigation token on every localized page, including the homepage.
- The mobile menu is a dialog: body scroll is locked, main and footer become inert, focus is trapped, Escape closes, and focus returns to the toggle.
- Preserve the homepage dark hero composition and continuously scrolling brand strip. Reduced motion uses a static list; do not add hero actions or change the layout.
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

## Playground 组件（2026-11-16）

保留当前单表布局、原始数据、配色和交互，不恢复旧版独立结果表或分页结构。

### `components/playground.tsx`

集中管理 CSV、目标列、`exampleId`、请求身份及 idle / running / error / success。上传后的 `exampleId` 必须为 null，不能通过文件名、内容或已有上下文标签启用评估。成功状态包含本次来源、预测及可选评估，不使用独立全局 accuracy 状态。

请求开始固定输入和评估版本快照；继续保留 AbortController、文件读取版本、60 秒超时及重复提交保护。上传、切换示例／目标、URL 更换示例、卸载使旧响应失效。重新运行或失败清除旧评估。

### `SourcePanel` / `DataTable` / `ScrollTable`

- 保留真实文件输入及拖放、切换示例、下载与仅看 query 筛选；运行模型是唯一主操作。
- 所有原始记录在受限滚动容器展示。数字与表头对齐；原始记录号不随筛选变化。
- 表格只在渲染层按原始零基 index 覆盖 query 的预测和概率，不能改变 `csv.rows`。
- 内置评估成功后仅在 query 单元格展示真实标签与正确／错误文字。不能只用颜色表示正误，概率名称必须明确。
- 上传模式不展示任何真实标签、正误状态或准确率。
- 鼠标拖动单元格空白处滚动；文字仍可选择复制；支持键盘和触屏。仅表格可以横向滚动。
- 目标选择器仅在自动检测不明确时展示，不恢复独立参数面板。

### `ResultPanel` / `ResultChart`

- 无结果时不渲染空卡片。运行中只显示真实等待状态，不编造进度。
- 请求错误显示原有错误类型和重试。有效预测对应的评估元数据出错时保留预测，单独说明评估不可用。
- 内置评估成功时使用紧凑摘要显示 `correctCount / totalCount` 与一位小数准确率，并说明它只是当前示例留出集的结果，不是完整 TabArena 基准。
- 上传模式完全不渲染评估区域，不留 N/A、0% 或空白占位。
- `ResultChart` 只显示真实响应的预测类别数量分布，不是混淆矩阵或准确率分布。
- 本次未添加或恢复 `PredictionResults` / `PredictionTable` / `PredictionStatus` 旧组件。

### 评估与导出边界

`lib/evaluation.ts` 是独立纯函数。完整验证数据集、版本、目标、query 集合、原始记录号、标签类别和一一对应关系后，才输出准确率和逐行对照。不能用 `averageProbability` 代替准确率，不能丢弃异常行后缩小分母。

`lib/playground-evaluation.ts` 用输入快照计算版本，并在预测完成后载入独立答案。`content/datasets/evaluation.json` 不进入请求构造器或 CSV 输入。

下载保留当前 `source_row` / `prediction` / `probability` / `probabilities` 字段、列名冲突处理与公式注入防护。只有有效内置评估才追加 `actual_label` / `is_correct`；上传下载不含这些字段。导出原目标仍为空，不将答案塞回原输入。

静态资源中的 Ground Truth 对浏览器可见，不构成标签保密；本轮保障的是答案不进入模型推理请求。数据来源与许可说明见 `/DATASET_NOTICES.txt`。

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

