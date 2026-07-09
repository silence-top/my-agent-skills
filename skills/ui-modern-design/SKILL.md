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

| Code | Rule | What it means |
|---|---|---|
| NO_NESTED_CARDS | Card inside card forbidden | Use `.card-section` (border-left/typography) for inner divisions |
| NO_GENERIC_GRAY | No raw gray backgrounds | Must use semantic surface/canvas tokens |
| NO_DEFAULT_TEXT_HIERARCHY | Display font required for headings | Use `fonts.display` token + explicit size/weight |
| NO_TRIVIAL_ANIMATIONS | No spin/bounce/shake | Motion must serve UX purpose |
| NO_AI_TEMPLATE_LAYOUT | No "hero + 3 cards" cliché | Every layout must be intentional |
| NO_SYSTEM_FONT_STACK | Primary font from token | System stack only as fallback |
| NO_RANDOM_COLORS | All colors from theme token | Zero hardcoded hex/rgba |
| NO_FLAT_WITHOUT_DEPTH | Depth cues required | Blur, shadow, glow, or layer separation |
| NO_FRAMEWORK_DEFAULT | Override defaults | Never ship un-customized framework styles |

## Token System (Single Source of Truth)

All visual values MUST reference tokens. Never use literal hex, rgba, px shadow strings, or magic numbers.

Token categories (full values in [reference](reference/tokens-and-mapping.md)):

| Category | Keys | Purpose |
|---|---|---|
| `fonts` | `display`, `sans` | Typography hierarchy |
| `easing` | `designerIn`, `stage` | Motion curves |
| `radius` | `sm/md/lg/xl` | Border radius scale |
| `spacing` | `xs/sm/md/lg/xl` | Layout spacing scale |
| `blur` | `soft`, `strong`, `glass` | Backdrop/overlay blur |
| `shadow` | `glow`, `soft`, `neon` | Elevation system |
| `layers` | `bg/surface/content/overlay/modal/tooltip` | Z-index semantics |
| `themes` | `dark/light/neon/cyber/soft` | Color palettes |

Each theme provides: `canvas`, `surface`, `brand`, `brandGlow`, `textPrimary`, `textMuted`, `stroke`.

## Multi-Theme Rules

- Must support at minimum: `dark`, `light`, `neon`, `cyber`, `soft`
- All themes share identical token keys (only values differ)
- Theme switch must preserve hierarchy, motion, and accessibility
- Agent generates theme manifest with mapping instructions

## Component Paradigms

Agent outputs **paradigm specs**, then maps to project's framework.

### Button
- Radius: `radius.md`+, Background: `theme.brand`, Text: `fonts.display` for CTA
- Hover: `translateY(-2px)` + glow pulse, Easing: `easing.designerIn`
- A11y: visible focus ring using token color

### Card
- Surface: `theme.surface`, Blur: `blur.glass` (optional), Border: `stroke` token
- Shadow: `shadow.soft` (default) or `shadow.glow` (feature card)
- Hover: `translateY(-2px)` + enhanced glow
- **Single layer only** — internal sections use typography/spacing/border-left, never nested cards
- Variants: `feature` | `compact` | `media` | `panel`

### Input
- Surface: semi-transparent `surface` token, Border: `stroke` → `brand` on focus
- Motion: subtle rise or glow on focus

### Navbar
- Background: `canvas` + slight transparency + `blur.soft`
- Separator: `stroke` token, Layer: above content, below overlay

### Modal
- Overlay: semi-transparent + `blur.strong`
- Stage presence: center popup with compound enter motion
- A11y: focus trap, keyboard dismissible

## Motion System

All motion maps to semantic categories:

```
ENTER  = opacity(0→1) + translateY(24→0) + blur(4px→0)    compound required
HOVER  = glow + translateY(-2px)                           no layout shift
STAGGER = delay(n × 60ms)                                 for lists/grids
SCROLL  = parallax + fade + rise                           intersection-based
```

Rules:
- Duration: 400–600ms for enter, 200–300ms for hover
- Curve: `easing.designerIn` (snappy) or `easing.stage` (smooth)
- NEVER: spin, bounce, shake, or meaningless loop animations

## Stage Layout (Global)

Every page needs a **Stage** — the global depth container injected at root:

| Layer | Purpose |
|---|---|
| Canvas | Base color (`theme.canvas`) |
| Spotlight | Radial glow for hero/focus areas |
| Noise | Ultra-low-opacity texture to kill flat AI feel |
| Depth | Layered z-index system (`layers.*`) |

Agent must inject Stage component or equivalent CSS into root layout.

## Execution Chain (Self-Review Before Output)

Before outputting ANY UI code, run these checks. FAIL = must fix before output:

1. **Token check** — all visual properties use tokens (no hardcoded values)
2. **Card nesting check** — zero card-inside-card in modified files
3. **Motion check** — Enter is compound; Hover is glow+translate only
4. **Theme check** — modifications work across all declared themes
5. **Stage check** — global Stage exists or plan is stated
6. **A11y check** — focus, contrast, semantic HTML baseline
7. **Anti-template check** — layout is intentional, not cliché

## Project Analysis Mode

When receiving an existing project:

1. **Detect stack** — framework, styling solution, component library
2. **Build mapping plan** — tokens → CSS vars / Tailwind extend / theme override
3. **Identify targets** — list files needing replacement/override
4. **Generate patches** — token injection, Stage, component overrides, motion utils
5. **Run execution chain** — self-review all patches
6. **Output** — `patches/` + migration README + `report.md`

**Principle**: gradual migration, never force-replace framework.

## Migration Guidance

- Prioritize theme override / wrapper components over full rewrite
- Generate priority fix list (by impact × complexity)
- Include rollback steps in patches
- Version tokens: breaking changes = major version bump

## Additional Resources

- For full token values, theme colors, and framework mapping examples, see [tokens-and-mapping.md](reference/tokens-and-mapping.md)
