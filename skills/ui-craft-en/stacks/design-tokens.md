# Design Tokens: layering and interaction-state derivation

This is Web implementation guidance. It only explains how to integrate tokens into a project and introduces no new aesthetic direction. Token values come from [ui-tokens.css](../assets/ui-tokens.css). When a project already has a system, map semantics first; see [framework mapping](framework-mapping.md). Do not force replacement.

## 1. Three-layer token architecture

```text
primitive   →   semantic   →   component
raw value       intent map     component binding
```

| Layer | Content | Rule |
|---|---|---|
| primitive | Raw color scales, spacing, type sizes, curves | Referenced only by semantic tokens; components do not use them directly |
| semantic | Intent names such as `--ui-canvas`, `--ui-surface`, and `--ui-brand` | Theme-switching layer; `[data-theme]` changes only this layer |
| component | Component bindings such as `--button-radius` | Optional; omit in small projects and add for large component libraries |

Sections 1 (scale), 2 (palette), and 3 (interaction states) of [ui-tokens.css](../assets/ui-tokens.css) follow this layering. Keep new tokens in the correct layer, and let components reference only `var(--ui-*)` values (R02).

## 2. Interaction-state derivation

Do not hand-pick interaction colors. Derive them from semantic colors. These formulas match ui-tokens.css §3 and apply equally to brand / success / warning / danger / info:

```css
--ui-brand-hover: color-mix(in oklch, var(--ui-brand) 88%, white);
--ui-brand-active: color-mix(in oklch, var(--ui-brand) 88%, black);

/* Mix disabled text with canvas instead of alpha-stacking dirty colors. */
--ui-disabled-text: color-mix(in oklch, var(--ui-text-primary) 35%, var(--ui-canvas));

/* Use the predefined shadow token for focus rings. */
--ui-shadow-focus: 0 0 0 3px var(--ui-brand-glow);
```

Rules:

- “Mix white to lighten” may not hold in dark theme. Measure contrast after derivation; see [accessibility review](../review/accessibility-review.md): body 4.5:1 and large text 3:1. If it fails, use an explicit value in the theme palette and annotate the measured contrast.
- For target browsers without `color-mix` or `oklch`, check browserslist first, then add static `-hover` / `-active` values. Keep semantic token names so components stay unaware.
- State cannot rely on color alone (R10). Pair hover / active with shadow, border, or weight changes.
- Keep every state value in the token layer. Components consume `var(--ui-brand-hover)` and never write local `color-mix` expressions.

## 3. Modern CSS admission

| Feature | Use | Admission condition |
|---|---|---|
| `oklch` / `color-mix()` | Derive interaction states and variants without new tokens | Provide static fallback per §2 |
| `@layer` | Cascade order: `reset, tokens, base, components, utilities` | Token file is already in `@layer tokens`; preserve order |
| Container Queries | Components respond to containers rather than viewport | Progressive enhancement; unsupported browsers still lay out correctly |
| View Transitions | Route and page transition orchestration | Enhancement only; unsupported browsers switch immediately, without decorative fallback |
| Scroll-driven animations | Progress and parallax | Enhancement only; require a real narrative or feedback purpose under [motion](../visual-dna/motion.md) |

Admission principle: behavior remains correct when enhancement features are absent, while layout-critical features have fallbacks. Never introduce a feature only to use new CSS.

## 4. Boundaries with other domains and skills

- Motion timing, easing, and admission live in [motion](../visual-dna/motion.md); this file defines no new curves. Vue or React animation guidance defines API usage, while visual parameters come from tokens and motion.
- Material, blur, transparency, and glass live under [materials](../materials/solid.md); this file provides no glass recipes.
- Colors and fonts returned by the optional ui-ux-pro-max foundation are candidates. Map accepted candidates into the semantic layer in §1 before use; do not paste them directly into component styles.
