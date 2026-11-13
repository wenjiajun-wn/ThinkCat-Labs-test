# Thinkcat Labs V5.4 design system

V5.4 applies the Numerical Terrain identity to a redesigned homepage. Runway informs the pacing between media and reading sections. The homepage combines the headline and numerical terrain in one dark hero. The original numerical field, matrices, temporal plots, representation maps and industry studies carry the visual weight.

## Design read

- Page kind: research company website with product studies, a remote-inference workspace and developer documentation.
- Audience: researchers, technical decision makers and developers evaluating structured-data models.
- Language: warm paper, deep green-black, acid lime, hairlines, procedural data art, quiet motion.
- Rule: the hero is a numerical instrument, not a giant word.

## Colour tokens

The shared palette and type scale live in `app/styles/tokens.css`. Both the localized and legacy layouts load the shared tokens. The legacy stylesheet maps its existing surface aliases to those tokens.

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#f3f2e9` | Main light surface and page background |
| `--paper-raised` | `#e9ebdf` | Secondary section surface |
| `--paper-deep` | `#dfe3d3` | Reserved for deeper light contrast |
| `--ink` | `#181d17` | Primary text, dark buttons and dark surfaces |
| `--ink-soft` | `#3f4a3c` | Secondary text on light surfaces |
| `--muted` | `#54604f` | Metadata and helper text |
| `--line` | `rgb(77 93 60 / .19)` | Default hairline |
| `--line-strong` | `#b7c0aa` | Definition-list and section rules |
| `--accent` | `#d9f58f` | Signal lime, primary actions, highlighted data |
| `--accent-strong` | `#c9ed71` | Focus signal and small active marks |
| `--atlas` | `#111a13` | Hero, research and data-canvas background |
| `--atlas-2` | `#18231a` | Chart field |
| `--atlas-3` | `#223025` | Dark skeleton and raised dark data |
| `--dark-line` | `rgba(217,245,143,.16)` | Hairline on dark surfaces |
| `--dark-muted` | `#c2cfb8` | Secondary text on dark surfaces |
| `--error` | `#a13b2e` | Validation errors only |
| `--warning` | `#8b641f` | Draft and unavailable states only |

There is one accent family. Lime is not used for body text on paper. Error and warning colours are functional only and do not become decorative accents.

## Typography

Geist Variable and Geist Mono Variable are bundled through the existing Fontsource dependencies. System, PingFang SC and Noto Sans SC fallbacks preserve readability without an external font request.

```css
--font-sans: "Geist Variable", system-ui, -apple-system,
  "PingFang SC", "Noto Sans SC", sans-serif;
--font-mono: "Geist Mono Variable", ui-monospace, monospace;
```

| Role | Desktop | Mobile (390px) | Notes |
| --- | --- | --- | --- |
| Home H1 | `38–54px` | `32–40px` | Two deliberate lines, weight 560 |
| Page H1 | `34–46px` | `32–38px` | Compact page identity |
| Section H2 | `26–32px` | `26–30px` | Sentence case, balanced wrapping |
| List / card heading | `18–20px` | responsive | Weight 500 |
| Body | `16px` | `16px` | 1.68 line height, up to 64ch for English reading copy and 38em for Chinese |
| Lead | `17px` | `16px` | Intro paragraphs |
| Navigation | `15px` | `15px` | One shared size across localized and legacy pages |
| Annotation | `12px` | same | Labels, captions and table headings |
| Helper text and code | `13px` | same | Form guidance, chart notes and code examples |

Chinese typography uses looser line height and smaller negative tracking than English. The shared reading measure and anchor offset account for locale and header height. `h1`, `h2` and `h3` use `text-wrap: balance`; paragraphs use `text-wrap: pretty` where supported and keep a readable measure.

## Layout and rhythm

- Shared content width: `1280px`, with `--gutter` from `20px` to `72px`. The header, homepage and editorial pages resolve to the same grid.
- Page intros share a 32–64px inset at the top. A sentence-case section label, heading and description align on the same left edge.
- Application studies alternate figure and narrative on ruled rows and stack below 700px.
- Section spacing: `64–112px` on editorial pages and `56–88px` on homepage chapters; mobile uses `52–74px`.
- Shared spacing tokens follow a 4/8px rhythm. Card padding is `20–28px`, application grid gaps are `20–28px`, and control height is at least `44px`.
- Hero: a full-width dark panel within the shared grid. The text sits above the numerical field and the hero plus ecosystem strip fill at least the first viewport below the header.
- The ecosystem brand strip loops horizontally. With reduced motion enabled, it becomes a static list.
- Home alternates paper, raised paper and dark atlas. Lime marks primary actions and active data. Dark sections use the same hairlines and label system, not a different design language.

Breakpoints: `1180px`, `1000px`, `860px`, `620px`. The navigation collapses at 1000px. Homepage columns stack at 920px, with compact phone rules at 540px. Editorial subpages keep their existing breakpoints. Coarse-pointer rules independently increase touch targets to `44px`.

## Components

- `PageHead`: section label, H1, description and page metadata, with `paper` and `dark` tones.
- Buttons: one primary action per context, 48px primary height and 44px compact control height, 30px nested icon, color and border feedback on hover and press.
- Text links: underline on a hairline, used for secondary paths with a 44px minimum target.
- Status marks: small outline labels for `Research`, `Pending` and similar states.
- Section labels explain the content type. Decorative numbering is omitted in shared page intros. Tables and form errors use dedicated light surfaces so they are easy to distinguish.
- Definition lists and tables: hairline rows, mono labels, no generic bordered cards.
- Visual figures: always carry a readable caption and an explicit synthetic-data label.

## Data visualisation

Every visualization is drawn in this repository with deterministic procedural data.

- `NumericalField`: static SVG terrain with foreground and background contours over a grid drawn in the same projection. Axis ticks follow the projected plane. The bilingual synthetic-data legend is outside the SVG so it remains readable on narrow screens.
- `RepresentationMap`: table grid and temporal channels joined to a shared representation.
- `TabularMatrix`: a real table with roving focus, selectable cells and a local reading panel. Small screens scroll the named table region instead of shrinking cells; coarse pointers receive 44px rows.
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
- Shared interface durations: `--duration-fast: 160ms`, `--duration-base: 200ms` and `--duration-slow: 280ms`; the selected homepage plot uses a 220ms opacity transition.
- The numerical field is static. The ecosystem strip uses a continuous linear animation that is disabled for reduced motion.
- No scroll listeners, no layout-triggering animation, no backdrop blur on scrolling content.
- `prefers-reduced-motion: reduce` disables animation, smooth scroll and hover displacement.

## Accessibility and content truth

- Focus rings are visible on light and dark surfaces.
- The mobile menu locks the page, traps focus, closes with Escape and returns focus to the toggle.
- Form controls use visible labels; the file picker is a real button controlling a file input.
- Interactive matrices support arrow keys.
- The docs sidebar and sticky mobile contents expose the same section links. The mobile contents show the active section and focus the heading after a jump.
- Playground uses a single-column workbench with a compact Data Input header. The input table is the primary visual element, with 42px rows, real CSV lines, restrained target highlighting and no nested card frame. Run Model is content-width on desktop and full width on mobile; Upload CSV is secondary and Restore sample is tertiary. Format help stays in a disclosure and the privacy notice remains visible.
- Do not invent model versions, public weights, client results or contact channels. Keep pending fields visible as pending.
- The light results workspace shares the input table's 42px density and secondary-action styling. Success prioritizes the real prediction table with compact sample / CSV line pairs, input features and probabilities; only the actual class distribution is charted. Errors stay compact and preserve the current CSV for retry. The synthetic sample is identified in the file area.

## How to change the system

1. Change a shared value in `app/styles/tokens.css` before changing individual components.
2. Check both the light and dark parent surfaces.
3. Reuse `.mono-label`, `.button`, `.text-link`, `.status-mark` and `.section-head` rather than adding page-specific variants.
4. For a new page, use `PageHead` and the shared section grid.
5. Rebuild and run `node scripts/visual-qa.mjs` to verify all pages and viewports.

The legacy noindex routes retain their own stylesheet in `app/legacy.css`.
