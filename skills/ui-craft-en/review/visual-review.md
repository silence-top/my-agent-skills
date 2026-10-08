# Visual Review: correctness and visual review before delivery

This is the shared delivery checklist. Select items relevant to the current change rather than turning every change into full acceptance. Not applicable does not mean verified. Specialized reviews explain methods and do not require duplicate reports.

## 1. Scope

| Change | Minimum verification |
|---|---|
| Copy, typography, style | Readability, long text, narrow view, and existing themes in affected regions; adjacent layout remains intact |
| Button, form, floating layer | Real operation, success/failure, preserved input, keyboard, focus, and states involved in the change |
| New page or layout restructuring | Primary-task loop, hierarchy, applicable states, target-device layout, and existing page capabilities |
| Global theme or shared component | Representative pages that actually use it; one isolated check is insufficient |
| Repository example or preview tool | Rebuild preview and run the corresponding regression; ordinary projects do not need this repository's scripts |

## 2. Correctness and usability

IDs are retained for source scanning and issue references; delivery does not need to copy every row.

| ID | Check |
|---|---|
| `R01` | Grouping has an information reason; prefer content, alignment, and spacing over duplicate container noise |
| `R02` | Colors and shared dimensions come from official project tokens; do not reference nonexistent tokens, and declare local variables explicitly |
| `R03` | Backgrounds express semantics such as Canvas and Surface rather than copying arbitrary gray values |
| `R04` | Components follow product structure and existing conventions without breaking reasonable defaults merely to redesign |
| `R05` | Controls have applicable idle / hover / active / focus-visible / disabled states, and actions produce real results |
| `R06` | Font fallback works; mixed Chinese, Latin, and numbers scan well; system fonts support offline use |
| `R07` | Chinese body text has no negative tracking; body and helper labels remain readable; density is not produced by shrinking type |
| `R08` | Motion explains state, hierarchy, or feedback; no decorative loop or global scaling |
| `R09` | Actually required loading / empty / error / denied states recover; local tools do not invent network or permission states |
| `R10` | State is not communicated by color alone; text, icon, or another visible cue is present |
| `R11` | Functional icons are recognizable and accessibly named; ambiguous Emoji are not substitutes |
| `R12` | Copy states actions, results, and limits; it does not assume success or fake live or AI diagnosis |
| `R13` | Examples and simulated data are labeled and contain no real patient information |
| `R14` | Focus is visible; modal isolates the background, loops Tab / Shift+Tab, closes with Escape, and restores focus |
| `R15` | System reduced-motion is supported; if a page motion switch exists, behavior remains correct when off |

Numeric baselines: ordinary text contrast ≥ 4.5:1 and large text ≥ 3:1. Treat uncertain media or gradient backgrounds separately, never as automatic passes. Mobile HTML targets default to 48×48 CSS px and desktop targets to ≥ 24×24 CSS px. Accept native iOS at 44pt and Android at 48dp. Typical Web body text is 14–16px; mobile body and inputs start at 16px. See [accessibility review](accessibility-review.md).

Verify real results: search and clear restore correctly; completion and deletion keep counts and lists consistent; forms validate, prevent duplicate submission, and retain input after failure; dangerous actions state consequences and confirm or provide reliable undo. Classes, attributes, or fixed waits alone do not prove success.

## 3. Visual review for new or restructured layouts

Review Typography, Scale, Composition, Density, Surface, Contrast, Border, Illustration, Iconography, Motion, Image treatment, Navigation, and Feedback, answering only dimensions relevant to the change:

- Can the primary task, main content, and action be recognized at first glance? Do navigation and introduction stay subordinate to the workspace?
- Does hierarchy remain after removing accent color? Is the anchor obscured by navigation or control surfaces? Does mobile need a different anchor?
- Do headings, body, and evidence have hierarchy? Equal weight comes from comparability, not a need to fill cards.
- Does mobile preserve necessary summary and reachable actions rather than stacking desktop? Do long text and zoom avoid covering controls?
- Do type, surfaces, scale, and feedback fit the content? Does the result hit the Avoid list in [premium UI](../visual-dna/premium-ui.md)? Compare overall template feel with [anti-slop review](anti-slop-review.md).
- No image, illustration, or animation can be an intentional decision rather than a defect.

When the result looks templated, change information organization or structure rather than recoloring or naming a personality. A forced second report is unnecessary; when no issue exists, do not change things to satisfy a round count. Card counts, metadata labels, and automated scores cannot replace visual judgment.

## 4. Concise delivery

State what changed, how it was verified, and what remains untested. Provide an entry point when interactive HTML exists. Do not create a separate report file or full design archive.

Automated checks prove only measured engineering facts. Failure, missing coverage, timeout, and pending cannot be reported as passing. Clearly disclose untested real-device safe areas, soft keyboards, native integration, and live services instead of presenting browser simulation as proof.

## 5. Specialized reviews

- Mobile: [mobile review](mobile-review.md)
- Viewport and zoom: [responsive review](responsive-review.md)
- Accessibility: [accessibility review](accessibility-review.md)
- Desktop shell and native feel: [native review](native-review.md)
- Template feel: [anti-slop review](anti-slop-review.md)
