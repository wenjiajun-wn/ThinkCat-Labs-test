# Thinkcat Labs V5.4 design system

V5.4 applies the Numerical Terrain identity to a redesigned homepage. Linear informs the compact typography, and Runway informs the role of graphics in the page. The original numerical field, matrices, temporal plots, representation maps and industry studies carry the visual weight.

## Design read

- Page kind: research company website with product studies, a browser demo and developer documentation.
- Audience: researchers, technical decision makers and developers evaluating structured-data models.
- Language: warm paper, deep green-black, acid lime, hairlines, procedural data art, quiet motion.
- Rule: the hero is a numerical instrument, not a giant word.

## Colour tokens

The shared palette and type scale live in `app/styles/tokens.css`. The localized layout loads them through `app/globals.css`.

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#f3f2e9` | Main light surface and page background |
| `--paper-raised` | `#e9ebdf` | Secondary section surface |
| `--paper-deep` | `#dfe3d3` | Reserved for deeper light contrast |
| `--ink` | `#181d17` | Primary text, dark buttons and dark surfaces |
| `--ink-soft` | `#3f4a3c` | Secondary text on light surfaces |
| `--muted` | `#5e695a` | Metadata and helper text |
| `--line` | `#d3d8c6` | Default hairline |
| `--line-strong` | `#b7c0aa` | Definition-list and section rules |
| `--accent` | `#d9f58f` | Signal lime, primary actions, highlighted data |
| `--accent-strong` | `#c9ed71` | Focus signal and small active marks |
| `--atlas` | `#111a13` | Hero, research and data-canvas background |
| `--atlas-2` | `#18231a` | Chart field |
| `--atlas-3` | `#223025` | Dark skeleton and raised dark data |
| `--dark-line` | `rgba(217,245,143,.16)` | Hairline on dark surfaces |
| `--dark-muted` | `#b7c4ad` | Secondary text on dark surfaces |
| `--error` | `#a13b2e` | Validation errors only |
| `--warning` | `#8b641f` | Draft and unavailable states only |

There is one accent family. Lime is not used for body text on paper. Error and warning colours are functional only and do not become decorative accents.

## Typography

Fonts are system fonts. No font files are copied or distributed, so there is no new font licence surface and no external font request in mainland China.

```css
--font-sans: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI",
  "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
--font-mono: "Cascadia Code", "SFMono-Regular", Consolas,
  "Liberation Mono", monospace;
```

| Role | Desktop | Mobile (390px) | Notes |
| --- | --- | --- | --- |
| Home H1 | `56px` | `36.27px` | Two deliberate lines, never a full sentence in 100px+ type |
| Page H1 | `51.84px` | `36.66px` | Compact page identity |
| Section H2 | `27–36px` | `26–31px` | Sentence case, balanced wrapping |
| List / card heading | `18–24px` | responsive | Weight 500 |
| Body | `15.5px` | `15px` | 1.68 line height, 60–68 character measures |
| Lead | `17px` | `16px` | Intro paragraphs |
| Annotation | `12px` | same | Labels, captions, table headings and compact controls |
| Helper text and code | `13px` | same | Form guidance, chart notes and code examples |

Chinese typography uses looser line height and smaller negative tracking than English. `h1`, `h2` and `h3` use `text-wrap: balance`; body copy keeps a readable measure.

## Layout and rhythm

- Content width: `1320px`, with `--gutter` from `20px` to `72px`.
- Page intro: 140px rail plus main column. The intro body is under the title, not beside it as a competing headline.
- Home content shares a 1240px maximum width. Model research and industry applications both use a 45% / 55% split after a 40–60px gap. The intro and panel align at the top, and the list follows the intro. Below 920px both chapters stack in reading order.
- Section spacing: `64–112px` on desktop, `52–74px` on mobile.
- Hero: the header and hero together fill the first viewport. On narrow screens, copy and figure stack. The hero can grow beyond the viewport when the content needs more room.
- Home alternates paper, raised paper and dark atlas. Lime marks primary actions and active data. Dark sections use the same hairlines and label system, not a different design language.

Breakpoints: `1180px`, `1000px`, `860px`, `620px`. The navigation collapses at 1000px. Homepage columns stack at 920px, with compact phone rules at 540px. Editorial subpages keep their existing breakpoints.

## Components

- `PageHead`: page number, eyebrow label, H1, body and meta, with `paper` and `dark` tones.
- Buttons: one primary action per context, 48px minimum height, 30px nested icon, hover lift and press feedback.
- Text links: underline on a hairline, used for secondary paths.
- Status marks: small outline labels for `Research`, `Pending` and similar states.
- Section rails: hairline and label on the homepage, with numbers on editorial subpages where relevant. They orient without becoming decorative numbering.
- Definition lists and tables: hairline rows, mono labels, no generic bordered cards.
- Visual figures: always carry a readable caption and an explicit synthetic-data label.

## Data visualisation

Every visualization is drawn in this repository with deterministic procedural data.

- `NumericalField`: static SVG terrain with foreground and background contours over a grid drawn in the same projection. Axis ticks follow the projected plane. The bilingual synthetic-data legend is outside the SVG so it remains readable on narrow screens.
- `RepresentationMap`: table grid and temporal channels joined to a shared representation.
- `TabularMatrix`: a real table with roving focus, selectable cells and a local reading panel.
- `TimeSeriesStudy`: observed path, forecast interval and draggable forecast origin.
- `Industry studies`: five distinct forms, including distribution shift, load curve, indicator scatter, demand heatmap and multi-channel drift.
- `ModelGlyph` and `IndustryMiniature`: compact motifs for indexes and previews.

Rules:

1. Label synthetic illustrations as synthetic.
2. Never present an illustration as model output, benchmark performance or client data.
3. Use motion only to reveal state, comparison or an interaction result.
4. Keep chart legends readable at 390px. Wide tables scroll inside named regions. Code wraps on phones and retains its original whitespace when copied.

## Motion

- Easing: `cubic-bezier(.22,.61,.36,1)` and `cubic-bezier(.16,1,.3,1)`.
- Interface transitions: 160–300ms.
- Homepage entrances: 600–700ms for the hero, 220ms opacity transition for the selected plot.
- The numerical field is static; the only hero motion is the entrance fade and rise.
- No scroll listeners, no layout-triggering animation, no backdrop blur on scrolling content.
- `prefers-reduced-motion: reduce` disables animation and smooth scroll.

## Accessibility and content truth

- Focus rings are visible on light and dark surfaces.
- The mobile menu locks the page, traps focus, closes with Escape and returns focus to the toggle.
- Form controls use visible labels; the file picker is a real button controlling a file input.
- Interactive matrices support arrow keys.
- The docs sidebar and sticky mobile contents expose the same section links. The mobile contents show the active section and focus the heading after a jump.
- Playground uses a three-step sequence. The loaded file and label choice stay visible. The data preview and advanced parameters open on demand. Result summaries and percentage scales remain readable outside the chart SVG.
- Do not invent model versions, public weights, client results or contact channels. Keep pending fields visible as pending.
- All Playground output is marked `Demo` in the result panel, the status copy and the downloaded CSV.

## How to change the system

1. Change a shared value in `app/styles/tokens.css` before changing individual components.
2. Check both the light and dark parent surfaces.
3. Reuse `.mono-label`, `.button`, `.text-link`, `.status-mark` and `.section-head` rather than adding page-specific variants.
4. For a new page, use `PageHead` and the shared section grid.
5. Rebuild and run `node scripts/visual-qa.mjs` to verify all pages and viewports.

The legacy noindex routes retain their own stylesheet in `app/legacy.css`.
