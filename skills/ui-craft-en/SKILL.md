---
name: ui-craft-en
description: >-
  UI design, implementation, and review guidance for web, mobile, and desktop interfaces. Covers visual hierarchy,
  Chinese typography, materials, responsive behavior, platform-native conventions, interaction states,
  accessibility, and design-token mapping. Use when creating or redesigning pages, fixing visual or interaction
  issues, reviewing frontend UI, or working on dashboards, healthcare, media, tools, and information-heavy products.
  Do not use for backend-only, infrastructure, or non-visual tasks.
---

# UI Craft

Understand the task → choose a structure → implement → verify the relevant risks. Solve content and actions before choosing components. Changing one button does not justify redesigning the product.

## 1. Responsibilities: the foundation searches; this skill decides and executes

```text
UI/UX Pro Max (optional sibling foundation: ui-ux-pro-max)
    Searches styles, palettes, font pairings, UX rules, and stack guidance;
    --design-system can generate MASTER.md and page overrides.
UI Craft's five domains (work independently or on top of the foundation)
├── visual-dna/   What feels intentional vs templated; Chinese typography, depth, composition, motion
├── materials/    Solid, translucent, frosted, and liquid glass: when to use each and when to fall back
├── platforms/    Business web, mobile, iOS, Android, macOS, Windows, Electron
├── stacks/       Web implementation: state derivation, Tailwind/library mapping, modern CSS
└── review/       Visual, mobile, responsive, accessibility, native, and anti-template reviews
```

The foundation answers “what styles and palettes are common for this product type?” This skill answers “how should the result become polished, platform-appropriate, and non-generic?” Treat foundation results as recommendations; validate them against Visual DNA, Chinese typography where relevant, and measured contrast.

Conflict order: **explicit user requirements > existing project conventions > this skill's safeguards (§4) > foundation search results**.

The foundation is optional: [ui-ux-pro-max](../ui-ux-pro-max/SKILL.md) is a vendored MIT dependency whose sync history is in [VENDORED.md](../ui-ux-pro-max/VENDORED.md). When search is useful, locate the installed `ui-ux-pro-max` directory, then run its `scripts/search.py` (Python 3, no external dependencies); never assume the working directory. For a new product or page, `--design-system` may establish direction, and a persisted `MASTER.md` becomes a project convention. If the foundation or Python is unavailable, skip search and complete the task with this skill alone. Upstream: [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).

## 2. Classify the task first

| Task | Minimum workflow |
|---|---|
| New page or major redesign | Identify the primary task and information → choose structure and visual focus → implement. Compare alternatives only when a real structural trade-off exists |
| Improve an existing page | Understand the stack, brand, fields, permissions, and current behavior → locate the main issue → improve within scope while preserving compatibility |
| Local fix or component adjustment | Inspect the component and adjacent effects directly; follow the current design. Do not reselect the page style or create a design dossier |
| Review or diagnosis | Use `review/` to report locatable issues, impact, and recommendations. Stay read-only without modification authorization |

Detect the stack from the project; do not impose a framework. Execute when requirements are clear and ask only about ambiguity that materially changes the result. For a new page, one sentence may state the primary task, layout reason, visual focus, and mobile trade-off. For a local fix, report only the issue and change.

## 3. Five-domain router: start with the 1–2 most relevant files

### visual-dna/ — Aesthetic decisions

| Question | Read |
|---|---|
| What feels polished; Avoid / Prefer; relation to foundation results | [premium-ui](visual-dna/premium-ui.md) |
| The page looks templated; diagnose concrete symptoms | [anti-generic](visual-dna/anti-generic.md) |
| Chinese font stacks, size and leading, punctuation, numbers, IME, interface copy | [typography](visual-dna/typography.md) |
| Surface roles, rhythm, scale, composition, desktop-to-mobile mapping | [depth](visual-dna/depth.md) |
| Motion admission, timing, easing, reduced motion, loading placeholders | [motion](visual-dna/motion.md) |

### materials/ — Surface materials

| Question | Read |
|---|---|
| Default surfaces and high-risk information | [solid](materials/solid.md) |
| Secondary layers over stable backgrounds, such as sticky bars | [translucent](materials/translucent.md) |
| System-level overlays such as menus, dialogs, and sheets | [frosted](materials/frosted.md) |
| Players, docks, and immersive controls; eleven dimensions; more than transparent blur | [liquid-glass](materials/liquid-glass.md) |

### platforms/ — Platform behavior

| Scenario | Read |
|---|---|
| Data platforms, admin UI, tables, forms, dialogs, wizards, trees, uploads | [web](platforms/web.md) |
| Mobile foundations: seven compositions, touch, safe areas, keyboards, navigation and modality | [mobile](platforms/mobile.md) |
| iOS: 44pt, Dynamic Type, sheets, system materials, back gestures | [ios](platforms/ios.md) |
| Android: 48dp, system back, Material 3, dynamic color | [android](platforms/android.md) |
| macOS: left-side traffic lights, vibrancy, menu bar, Command shortcuts | [macos](platforms/macos.md) |
| Windows: right-side caption controls, clear boundaries, Mica, Ctrl shortcuts | [windows](platforms/windows.md) |
| Electron / Tauri: thirteen native-feel checks and system integration | [electron](platforms/electron.md) |

### stacks/ — Web implementation

| Question | Read |
|---|---|
| Deriving interaction states, `@layer`, and admission rules for modern CSS | [design-tokens](stacks/design-tokens.md) |
| Tailwind / Naive UI / Element Plus mapping and incremental migration | [framework-mapping](stacks/framework-mapping.md) |

### review/ — Verification

| When | Read |
|---|---|
| Before any delivery | [visual-review](review/visual-review.md), R01–R15 plus visual review and concise handoff |
| Mobile interface | [mobile-review](review/mobile-review.md), M1–M12 |
| Viewports, zoom, and overflow | [responsive-review](review/responsive-review.md) |
| Contrast, keyboard, semantics, screen readers, and touch | [accessibility-review](review/accessibility-review.md) |
| Desktop shells or native implementations | [native-review](review/native-review.md) |
| After creating or restructuring a layout | [anti-slop-review](review/anti-slop-review.md), eleven questions |

Read the 1–2 files most relevant to the current decision. Expand only when a new decision appears; do not load every reference. If no route matches exactly, reason from the task rather than forcing a template. The directory is not a mandatory workflow.

## 4. Safeguards that preserve design freedom

- Reuse the project's brand, semantic tokens, and control behavior. Do not change frameworks, palettes, or directory structures merely to apply this skill.
- Prioritize the primary task and information hierarchy. When content, alignment, and spacing can group information, do not add redundant containers. Do not require heroes, cards, gradients, a fixed number of type sizes, or personality labels.
- Recompose essential information and actions for mobile; do not merely shrink desktop. A desktop shell is not a website inside a window.
- Materials serve hierarchy and readability. Glass is not “transparent background plus blur.” High-risk information always rests on a solid surface.
- Actions need real outcomes, required states, and recovery paths. Preserve input, focus, and data consistency. Label simulated data, AI suggestions, and unimplemented capabilities.
- Chinese body text uses no negative tracking. Text remains readable, focus visible, keyboard operation available, and reduced motion supported. Verify 4.5:1 / 3:1 contrast; HTML mobile targets are 48×48 CSS px and desktop targets at least 24×24; verify iOS at 44pt and Android at 48dp. Aesthetics never override usability.

Composition, personality, material, surface, and scale are problem-solving vocabulary, not fields every page must fill. Products share semantics and interaction behavior, not necessarily one page skeleton.

## 5. Verification and delivery

Run only the review checks relevant to the change. Real operations outrank class-name or attribute assertions. After a new page or major layout change, revisit hierarchy, density, and mobile reachability; fix discovered issues without forcing a second report. Untested, failed, and untestable states are never reported as passing.

The handoff states what changed, how it was verified, and what remains untested. Provide an interactive entry point when an HTML preview exists. Do not automatically create design dossiers, report files, screenshots, or images.

## 6. Optional assets, not prerequisites

- [ui-tokens.css](assets/ui-tokens.css): starting point when no design system exists; otherwise map the existing semantic system. Every `--ui-*` token used by the references is defined here.
- [scan-project.mjs](assets/tools/scan-project.mjs): read-only source audit for larger redesigns; it is not a design recommendation engine and is unnecessary for local edits.
- [Workbench demo](assets/demo/index.html): reference for layout and real interactions, not a universal shell. Other examples in the repository may cover mobile, media, and tools.
