# Anti-generic: concrete signals of templated UI

Use this file by category after identifying a concrete problem; it is not a mandatory full checklist for every delivery. Each item gives symptom → reason → replacement. For an overall template check, see [anti-slop-review](../review/anti-slop-review.md); for typography, see [typography](typography.md); for motion, see [motion](motion.md).

## 1. The default face

These are template signals only when they lack a task-specific reason. Repeated table rows, comparable metrics, and media queues may remain consistent because their semantics justify repetition.

| Default pattern | Why it fails |
|---|---|
| Gradient hero without a task reason | Decoration displaces primary information |
| Sidebar + top bar + cards without information-architecture analysis | The shell dominates the task area and expresses no business priority |
| Three equal-width feature cards | The content rarely has a true three-way equal relationship |
| Full-screen glassmorphism with 24px corners | Readability drops and the result contradicts a professional tool |
| Every module is icon + title + two gray lines | Hierarchy is flattened and scan speed drops |
| Brand color covers 60% of the screen | Alert colors lose contrast territory |
| Invented hero statistics such as 99.99% or 1,234,567 | They look fake and consume valuable space |

## 2. Layout

| # | Symptom | Why it fails | Replacement |
|---|---|---|---|
| A1 | Repeated nested containers without semantic purpose | Boundary noise flattens hierarchy | Start with content, alignment, and whitespace; add tone or rules only when necessary |
| A2 | A row of three or four perfectly equal feature cards | The content is not truly equal | Size by content weight or use a list / description list |
| A3 | Every region is centered | Reading and action paths have no hierarchy | Align by content role; retain a stable scan axis in dense workflows |
| A4 | Business content is centered in an 800px column | Large screens are wasted and tables lose columns | Use available width for work UI; constrain long-form reading to about 42em |
| A5 | Header + Cards applied before task analysis | Shell precedes content | Choose a composition and anchor through [depth](depth.md) |
| A6 | Every module appears above the fold with equal weight | Users cannot tell where to look | One primary task per page; demote or collapse secondary information |
| A7 | A 12-column table is shown by default with horizontal scrolling | Primary keys and actions disappear | Define a default column set plus column settings; pin the primary key |

A2 exception: equal KPI cards are appropriate when comparability is the point. Ask: does equal width express comparison, or merely fill the row?

## 3. Visual treatment

| # | Symptom | Why it fails | Replacement |
|---|---|---|---|
| B1 | Gradient hero without a task reason | Decoration substitutes for focus | Create the anchor through task, typography, data, or media |
| B2 | Full-screen glassmorphism / frosted glass | Text backgrounds become uncertain and rendering is expensive | Keep blur off by default; real overlays may use it with a measurable carrying surface; see [frosted](../materials/frosted.md) |
| B3 | Gradient text for a large heading | It disrupts reading | Use a solid color and weight contrast |
| B4 | Meaningless glowing border or breathing halo | It steals attention from content | Express alerts with text and priority first; bound and degrade any light effect |
| B5 | Large, unvalidated areas of extreme light or dark | Reading fatigue or lost contrast | Use Canvas / Surface semantics and measure |
| B6 | Inconsistent radii for the same role, or every object forced into a rounded rectangle | Containers overpower information hierarchy | Standardize shape by role and allow justified exceptions |
| B7 | Large shadows everywhere plus 8px hover lift | Business UI does not need floating cards | Reserve shadows for real overlays; change border or background on hover |
| B8 | Mixed icon families: outline, filled, and emoji | Visual noise | Use one icon family and consistent stroke width |
| B9 | Brand color covers most of the page | Alerts lose contrast territory | Reserve brand color for primary actions and selection |

## 4. Content and data

| # | Symptom | Why it fails | Replacement |
|---|---|---|---|
| E1 | Placeholder people such as `John Doe`, customers such as `Acme Corp` | Immediately reads as placeholder content | Use plausible names and organizations and label them as sample data |
| E2 | Attractive invented numbers presented as business facts | Misleads decisions | Label simulated data, source, and methodology; irregular numbers are not automatically real |
| E3 | Filler language such as `Lorem ipsum`, `Elevate`, or `Seamless` | Signals unfinished work | Write product-specific copy |
| E4 | Empty state says only “No data” | The user has no next step | Use the three-part empty-state structure in [typography](typography.md) §8 |
| E5 | Tables made from divs or charts replaced with screenshots | Inaccessible and non-functional | Use semantic tables and a real chart library |
| E6 | Loading exists but error does not | Network failure leaves the user stranded | Implement loading / empty / error / denied states as applicable |
| E7 | Sequence numbers such as 01 / 02 / 03 on non-sequential content | Decoration masquerades as information | Number only actual steps or ordered sequences |

## 5. Decorative production tells

| # | Symptom | Replacement |
|---|---|---|
| F1 | Version badges such as `v0.6`, `BETA`, or `Build 0048` in page corners | Move them to About; remove from the main interface |
| F2 | Decorative status dots with no real state | Remove or bind to a real state |
| F3 | “Scroll down” / `↓ Scroll` prompt | Remove |
| F4 | Meaningless micro-labels such as `BRAND. MOTION. SPATIAL.` | Remove |
| F5 | Floating explanation at the top-right of every section | Merge into the heading or body |
| F6 | Decorative crosses or hairline grid overlays | Remove |
| F7 | Fake product screenshot in the header | Use a real interactive workspace or remove it |
| F8 | Decorative pills or badges over images | Remove |
| F9 | Weather, timezone, or city strip unrelated to the product | Remove |
| F10 | Both top and bottom borders on every long-list row | Keep only the bottom divider |
| F11 | Filled-track progress decoration that does not represent progress | Remove or bind to real progress |
| F12 | Emoji used as icons or inserted into headings | Use an icon library or SVG |

## 6. Engineering tells

| # | Symptom | Replacement |
|---|---|---|
| G1 | Interactive elements expose only a default state | Provide idle / hover / active / focus-visible / disabled |
| G2 | Placeholder substitutes for a label | Keep a persistent label above the input |
| G3 | Hard-coded colors or dimensions | Reference tokens |
| G4 | `!important` everywhere | Control specificity with `@layer` and scope |
| G5 | `z-index: 9999` | Use the `--ui-z-*` scale |
| G6 | The component library makes product decisions | Define composition first, then map semantics; preserve reasonable library defaults |

## 7. Quick source checks

```bash
# Keep matches low; exclude token files.
grep -rEn "#[0-9a-fA-F]{3,8}" src --include=*.vue --include=*.scss | grep -v tokens
grep -rEn "z-index\s*:\s*[0-9]{3,}" src --include=*.vue
grep -rn "!important" src --include=*.vue | wc -l
grep -rn "outline:\s*none" src --include=*.vue
grep -rEn "letter-spacing:\s*-" src --include=*.vue
grep -rn "addEventListener('scroll'" src
grep -rn "Lorem\|John Doe\|Jane Doe\|Acme" src
grep -rn "😀\|🚀\|✨\|✅" src
```

For a larger redesign, run [scan-project.mjs](../assets/tools/scan-project.mjs) for a read-only source audit.

## 8. Do not enforce mechanical repetition counts

Do not turn “four repeated elements” into a context-free ban. Tables, media queues, and comparable metrics need consistent structures. Fix the real problems: no primary task, every region has equal weight, gray-canvas/white-card monoculture, or excessive decorative boundaries. If a new or revised layout still feels templated, change structure and information allocation rather than merely changing colors.
