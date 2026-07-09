---
name: ui-modern-design
description: >-
  Framework-agnostic modern UI design engine for AI coding agents.
  Enforces token-driven design, multi-theme system, motion semantics,
  and strict anti-patterns to eliminate AI template aesthetics.
  Use when creating, modifying, or reviewing any frontend UI code —
  regardless of framework (Vue, React, Svelte, vanilla CSS, Tailwind).
---

# UI Modern Design — Token-Driven Design Engine

Framework-agnostic rules. Agent maps to project's actual framework at execution time.

## Red Lines (Absolute Violations)

Any generated UI code violating these is REJECTED:

| Code | Rule | Fix |
|---|---|---|
| NO_NESTED_CARDS | Card inside card forbidden | `.card-section` with border-left / typography |
| NO_GENERIC_GRAY | No raw gray backgrounds | Semantic `surface`/`canvas` tokens |
| NO_DEFAULT_TEXT_HIERARCHY | Display font required for headings | `fonts.display` + explicit scale step |
| NO_TRIVIAL_ANIMATIONS | No spin/bounce/shake | Motion must serve UX purpose |
| NO_AI_TEMPLATE_LAYOUT | No "hero + 3 cards" cliché | Every layout must be intentional |
| NO_SYSTEM_FONT_STACK | Primary font from token | System stack only as fallback |
| NO_RANDOM_COLORS | All colors from theme token | Zero hardcoded hex/rgba |
| NO_FLAT_WITHOUT_DEPTH | Depth cues required | Blur, shadow, glow, or layer separation |
| NO_FRAMEWORK_DEFAULT | Override defaults | Never ship un-customized framework styles |
| NO_MISSING_STATES | All interactive elements need states | idle/hover/active/focus/disabled minimum |

## Token Architecture (Three-Layer)

```
primitive   →   semantic   →   component
blue-500        brand           button-bg-primary
gray-900        canvas          page-background
```

- **Primitive**: raw values (colors, sizes, curves). Never used directly in components.
- **Semantic**: intent-based mapping (brand, surface, danger). Theme-switchable layer.
- **Component**: specific binding (button-radius, card-shadow). Optional for simple projects.

All token values in [reference](reference/tokens-and-mapping.md).

## Type Scale

Fluid typography with `clamp()`. No fixed px for body text.

| Step | Role | Min → Max | Weight |
|---|---|---|---|
| `display-xl` | Hero headline | 48 → 72px | 700 |
| `display` | Section heading | 36 → 48px | 600 |
| `heading` | Card/block title | 24 → 32px | 600 |
| `subheading` | Subtitle / lead | 18 → 22px | 500 |
| `body` | Default text | 15 → 17px | 400 |
| `body-sm` | Secondary text | 13 → 14px | 400 |
| `caption` | Labels, hints | 11 → 12px | 500 |

Rules:
- Headings: `fonts.display` + tighter letter-spacing (`-0.02em`)
- Body: `fonts.sans` + relaxed line-height (`1.6`)
- Never skip more than 2 steps in visual hierarchy

## Color System

Each theme provides three tiers:

### Core (layout skeleton)
`canvas` · `surface` · `surface-alt` · `stroke` · `textPrimary` · `textMuted`

### Brand & States
`brand` · `brandGlow` · `success` · `warning` · `danger` · `info`

### Interaction Derivation (via `color-mix` or oklch shift)
```
hover   = color-mix(in oklch, {base} 85%, white)
active  = color-mix(in oklch, {base} 85%, black)
disabled = {base} at 40% opacity
focus   = {base} + 3px ring with brandGlow
```

Agent must generate interaction states using derivation formula — never hand-pick hover colors.

## Responsive System

| Token | Breakpoint | Typical device |
|---|---|---|
| `sm` | ≥ 640px | Large phone landscape |
| `md` | ≥ 768px | Tablet |
| `lg` | ≥ 1024px | Laptop |
| `xl` | ≥ 1280px | Desktop |
| `2xl` | ≥ 1536px | Wide monitor |

Rules:
- Mobile-first (`min-width` up)
- Use Container Queries (`@container`) for component-level responsiveness
- Touch targets ≥ 44×44px on mobile
- Fluid spacing: scale spacing tokens proportionally (not just font)

## Component Paradigms

Agent outputs **paradigm specs**, then maps to project's framework.

### Button
- Radius: `radius.md`+, Bg: `brand`, Text: `fonts.display` for CTA
- States: idle → hover (glow + rise -2px) → active (sink +1px) → focus (ring) → disabled (40% opacity)
- Loading: replace text with skeleton pulse, keep width stable
- Easing: `easing.snappy`

### Card
- Surface: `surface` token, Blur: `blur.glass` (optional), Border: `stroke`
- Shadow: `shadow.soft` default, `shadow.glow` for feature
- Hover: `translateY(-2px)` + enhanced glow
- **Single layer only** — subdivisions via typography/spacing/border-left
- Variants: `feature` | `compact` | `media` | `panel`
- Empty state: illustration + muted text, never blank

### Input
- Surface: semi-transparent `surface`, Border: `stroke` → `brand` on focus
- States: idle → focus (rise + glow ring) → error (`danger` border + hint) → disabled (muted bg)
- Label: always visible (float or static), never placeholder-only

### Modal
- Overlay: `canvas` at 60% + `blur.strong`
- Enter: scale(0.95→1) + opacity compound, Exit: reverse
- A11y: focus trap, ESC dismiss, `aria-modal`

### Skeleton / Loading
- Shimmer gradient: `surface` → `surface-alt` → `surface`
- Match exact layout shape of target content
- Duration: 1.5s loop, easing: linear

## Motion System

| Semantic | Behavior | Duration | Curve |
|---|---|---|---|
| ENTER | opacity(0→1) + translateY(24→0) + blur(4→0) | 400–600ms | `easing.stage` |
| HOVER | glow + translateY(-2px) | 200–300ms | `easing.snappy` |
| STAGGER | child delay(n × 60ms) | per-item | inherit parent |
| SCROLL | parallax + fade + rise (Intersection Observer) | 500–800ms | `easing.stage` |
| EXIT | reverse of ENTER, faster | 200–300ms | `easing.snappy` |
| FEEDBACK | checkmark draw / shake / pulse | 300–500ms | `easing.stage` |

Rules:
- `prefers-reduced-motion: reduce` → disable all transforms, keep opacity-only fade
- NEVER: spin, bounce, infinite loops without user trigger
- GPU hints: `will-change` only during animation, remove after

## Stage Layout (Global)

Every page needs a **Stage** — the global depth container at root:

| Layer | Purpose |
|---|---|
| Canvas | Base color (`canvas` token) |
| Spotlight | Radial gradient glow for hero/focus (subtle, ≤ 15% opacity) |
| Noise | Ultra-low-opacity texture (2-4%) to break flatness |
| Depth | Layered z-index (`layers.*` tokens) |

## Accessibility (Non-Negotiable)

| Rule | Requirement |
|---|---|
| Contrast | Text ≥ 4.5:1 (AA), Large text ≥ 3:1 |
| Focus | Visible ring on `:focus-visible`, never `outline: none` without replacement |
| Motion | `prefers-reduced-motion` check on every animation |
| Touch | Interactive targets ≥ 44×44px on touch devices |
| Semantics | Correct heading levels, landmarks, `aria-label` where needed |
| Color | Never convey info by color alone (add icon/text/pattern) |

## Modern CSS Strategy

Prefer these when project supports them:

| Feature | Use for |
|---|---|
| `oklch` | Perceptually uniform color manipulation, derive hover/active |
| `color-mix()` | State variant generation without extra tokens |
| Container Queries | Component-level responsiveness (card adapts to parent, not viewport) |
| `@layer` | Manage specificity: reset → tokens → components → utilities |
| View Transitions | Page/route transition choreography |
| Scroll-driven animations | Parallax, progress bars without JS |

Agent checks project's browserslist before using — provide fallback if needed.

## Execution Chain (Self-Review Before Output)

FAIL = must fix before output:

1. **Token check** — all visual properties reference tokens (zero hardcoded values)
2. **Card nesting check** — zero card-inside-card
3. **State check** — every interactive element has idle/hover/active/focus/disabled
4. **Motion check** — Enter is compound; reduced-motion fallback exists
5. **Theme check** — output works across all declared themes
6. **Responsive check** — layout tested at sm/md/lg mentally; no overflow
7. **A11y check** — contrast, focus ring, semantic HTML, touch targets
8. **Type hierarchy check** — clear visual steps, display font for headings
9. **Anti-template check** — layout is intentional, not AI cliché

## Project Analysis Mode

When receiving an existing project:

1. **Detect stack** — framework, styling solution, component library, browserslist
2. **Build mapping plan** — tokens → CSS vars / Tailwind extend / theme override
3. **Identify targets** — list files needing replacement/override
4. **Generate patches** — token injection, Stage, component overrides, motion utils
5. **Run execution chain** — self-review all patches
6. **Output** — `patches/` + migration README + `report.md`

**Principle**: gradual migration. Prefer theme override / wrapper components over full rewrite.

## Additional Resources

- Full token values, theme colors, type scale, responsive details, and framework mappings: [tokens-and-mapping.md](reference/tokens-and-mapping.md)
