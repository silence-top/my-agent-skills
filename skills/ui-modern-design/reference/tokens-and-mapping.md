# Reference: Design Tokens & Framework Mapping

Full token values and mapping examples. SKILL.md references this file for implementation details.

---

## Three-Layer Token Architecture

### Primitive Tokens (raw values, never used directly)

```json
{
  "color": {
    "blue-500": "#6366f1",
    "blue-400": "#818cf8",
    "blue-600": "#4f46e5",
    "green-500": "#10b981",
    "amber-500": "#f59e0b",
    "red-500": "#ef4444",
    "cyan-500": "#06b6d4",
    "purple-500": "#a06bff",
    "gray-50": "#f8fafc",
    "gray-900": "#0f172a"
  },
  "size": {
    "0": "0", "1": "4px", "2": "8px", "3": "12px",
    "4": "16px", "5": "20px", "6": "24px", "8": "32px",
    "10": "40px", "12": "48px", "16": "64px"
  },
  "radius-raw": { "4": "4px", "8": "8px", "16": "16px", "24": "24px", "32": "32px", "full": "9999px" }
}
```

### Semantic Tokens (intent-based, theme-switchable)

```json
{
  "fonts": {
    "display": "Clash Display, SF Pro Display, -apple-system, sans-serif",
    "sans": "Inter, SF Pro Text, system-ui, sans-serif"
  },
  "easing": {
    "snappy": "cubic-bezier(0.16, 1, 0.3, 1)",
    "stage": "cubic-bezier(0.25, 1, 0.5, 1)"
  },
  "radius": { "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px" },
  "spacing": { "xs": "8px", "sm": "12px", "md": "20px", "lg": "32px", "xl": "48px" },
  "blur": { "soft": "20px", "strong": "40px", "glass": "12px" },
  "shadow": {
    "glow": "0 0 40px oklch(65% 0.15 270 / 0.25)",
    "soft": "0 10px 40px oklch(0% 0 0 / 0.25)",
    "neon": "0 0 20px oklch(70% 0.25 330 / 0.6)"
  },
  "layers": { "bg": -1, "surface": 0, "content": 10, "overlay": 20, "modal": 30, "tooltip": 40 }
}
```

---

## Type Scale (Fluid)

```css
:root {
  --type-display-xl: clamp(3rem, 2.5rem + 2.5vw, 4.5rem);      /* 48→72px */
  --type-display:    clamp(2.25rem, 1.875rem + 1.875vw, 3rem);  /* 36→48px */
  --type-heading:    clamp(1.5rem, 1.25rem + 1.25vw, 2rem);     /* 24→32px */
  --type-subheading: clamp(1.125rem, 1rem + 0.625vw, 1.375rem); /* 18→22px */
  --type-body:       clamp(0.9375rem, 0.875rem + 0.3125vw, 1.0625rem); /* 15→17px */
  --type-body-sm:    clamp(0.8125rem, 0.8rem + 0.0625vw, 0.875rem);    /* 13→14px */
  --type-caption:    clamp(0.6875rem, 0.675rem + 0.0625vw, 0.75rem);   /* 11→12px */
}
```

Pairing:
- `display-xl`, `display`: weight 600–700, letter-spacing `-0.02em`, line-height 1.1
- `heading`, `subheading`: weight 500–600, letter-spacing `-0.01em`, line-height 1.3
- `body`, `body-sm`: weight 400, letter-spacing `0`, line-height 1.6
- `caption`: weight 500, letter-spacing `0.02em` (uppercase labels), line-height 1.4

---

## Theme Palettes (Expanded)

| Token | dark | light | neon | cyber | soft |
|---|---|---|---|---|---|
| `canvas` | `#060608` | `#f8fafc` | `#050510` | `#0b0f0f` | `#faf7ff` |
| `surface` | `oklch(15% 0.01 270 / 0.65)` | `oklch(100% 0 0 / 0.75)` | `oklch(12% 0.02 270 / 0.55)` | `oklch(14% 0.01 200 / 0.6)` | `oklch(98% 0.01 300 / 0.85)` |
| `surface-alt` | `oklch(18% 0.01 270 / 0.5)` | `oklch(96% 0 0 / 0.6)` | `oklch(15% 0.02 270 / 0.4)` | `oklch(17% 0.01 200 / 0.5)` | `oklch(95% 0.01 300 / 0.7)` |
| `brand` | `#6366f1` | `#4f46e5` | `#00f0ff` | `#00e0ff` | `#a06bff` |
| `brandGlow` | `oklch(65% 0.15 270 / 0.25)` | `oklch(55% 0.15 270 / 0.12)` | `oklch(80% 0.15 195 / 0.35)` | `oklch(78% 0.15 200 / 0.4)` | `oklch(60% 0.15 300 / 0.25)` |
| `textPrimary` | `#f8fafc` | `#0f172a` | `#f0f0ff` | `#e0f0f0` | `#1a1025` |
| `textMuted` | `#64748b` | `#94a3b8` | `#7088a0` | `#6090a0` | `#8070a0` |
| `stroke` | `oklch(100% 0 0 / 0.08)` | `oklch(0% 0 0 / 0.06)` | `oklch(80% 0.1 200 / 0.12)` | `oklch(75% 0.1 195 / 0.1)` | `oklch(50% 0.05 300 / 0.08)` |
| `success` | `#10b981` | `#059669` | `#00ffa0` | `#00e890` | `#34d399` |
| `warning` | `#f59e0b` | `#d97706` | `#ffe000` | `#ffd000` | `#fbbf24` |
| `danger` | `#ef4444` | `#dc2626` | `#ff3366` | `#ff2040` | `#f87171` |
| `info` | `#06b6d4` | `#0891b2` | `#00d4ff` | `#00c8ff` | `#67e8f9` |

### Interaction State Derivation

```css
/* oklch-based — perceptually uniform */
--state-hover: color-mix(in oklch, var(--ui-brand) 85%, white);
--state-active: color-mix(in oklch, var(--ui-brand) 85%, black);
--state-disabled: oklch(from var(--ui-brand) l c h / 0.4);
--state-focus-ring: 0 0 0 3px var(--ui-brand-glow);
```

---

## Responsive Breakpoints

```css
:root {
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
  --bp-2xl: 1536px;
}

/* Container query setup */
.ui-container { container-type: inline-size; }

@container (min-width: 640px) { /* component-level sm */ }
@container (min-width: 768px) { /* component-level md */ }
```

Fluid spacing (scale with viewport):
```css
--ui-space-xs: clamp(6px, 0.5vw + 4px, 8px);
--ui-space-sm: clamp(8px, 0.75vw + 6px, 12px);
--ui-space-md: clamp(14px, 1.25vw + 10px, 20px);
--ui-space-lg: clamp(24px, 2vw + 16px, 32px);
--ui-space-xl: clamp(36px, 3vw + 24px, 48px);
```

---

## CSS Variables (Full Mapping)

```css
:root {
  /* Fonts */
  --ui-font-display: Clash Display, SF Pro Display, -apple-system, sans-serif;
  --ui-font-sans: Inter, SF Pro Text, system-ui, sans-serif;

  /* Easing */
  --ui-ease-snappy: cubic-bezier(0.16, 1, 0.3, 1);
  --ui-ease-stage: cubic-bezier(0.25, 1, 0.5, 1);

  /* Radius */
  --ui-radius-sm: 8px;
  --ui-radius-md: 16px;
  --ui-radius-lg: 24px;
  --ui-radius-xl: 32px;

  /* Blur */
  --ui-blur-soft: 20px;
  --ui-blur-strong: 40px;
  --ui-blur-glass: 12px;

  /* Shadow */
  --ui-shadow-glow: 0 0 40px oklch(65% 0.15 270 / 0.25);
  --ui-shadow-soft: 0 10px 40px oklch(0% 0 0 / 0.25);
  --ui-shadow-neon: 0 0 20px oklch(70% 0.25 330 / 0.6);

  /* Layers */
  --ui-layer-bg: -1;
  --ui-layer-surface: 0;
  --ui-layer-content: 10;
  --ui-layer-overlay: 20;
  --ui-layer-modal: 30;
  --ui-layer-tooltip: 40;
}

/* Dark theme */
[data-theme="dark"] {
  --ui-canvas: #060608;
  --ui-surface: oklch(15% 0.01 270 / 0.65);
  --ui-surface-alt: oklch(18% 0.01 270 / 0.5);
  --ui-brand: #6366f1;
  --ui-brand-glow: oklch(65% 0.15 270 / 0.25);
  --ui-text-primary: #f8fafc;
  --ui-text-muted: #64748b;
  --ui-stroke: oklch(100% 0 0 / 0.08);
  --ui-success: #10b981;
  --ui-warning: #f59e0b;
  --ui-danger: #ef4444;
  --ui-info: #06b6d4;
}

/* Light theme */
[data-theme="light"] {
  --ui-canvas: #f8fafc;
  --ui-surface: oklch(100% 0 0 / 0.75);
  --ui-surface-alt: oklch(96% 0 0 / 0.6);
  --ui-brand: #4f46e5;
  --ui-brand-glow: oklch(55% 0.15 270 / 0.12);
  --ui-text-primary: #0f172a;
  --ui-text-muted: #94a3b8;
  --ui-stroke: oklch(0% 0 0 / 0.06);
  --ui-success: #059669;
  --ui-warning: #d97706;
  --ui-danger: #dc2626;
  --ui-info: #0891b2;
}
```

---

## Tailwind Mapping

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Clash Display', 'SF Pro Display', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'SF Pro Text', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['var(--type-display-xl)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['var(--type-display)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading': ['var(--type-heading)', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'subheading': ['var(--type-subheading)', { lineHeight: '1.3' }],
        'body': ['var(--type-body)', { lineHeight: '1.6' }],
        'body-sm': ['var(--type-body-sm)', { lineHeight: '1.6' }],
        'caption': ['var(--type-caption)', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
      colors: {
        canvas: 'var(--ui-canvas)',
        surface: 'var(--ui-surface)',
        'surface-alt': 'var(--ui-surface-alt)',
        brand: 'var(--ui-brand)',
        'brand-glow': 'var(--ui-brand-glow)',
        'text-primary': 'var(--ui-text-primary)',
        'text-muted': 'var(--ui-text-muted)',
        stroke: 'var(--ui-stroke)',
        success: 'var(--ui-success)',
        warning: 'var(--ui-warning)',
        danger: 'var(--ui-danger)',
        info: 'var(--ui-info)',
      },
      borderRadius: {
        sm: 'var(--ui-radius-sm)',
        md: 'var(--ui-radius-md)',
        lg: 'var(--ui-radius-lg)',
        xl: 'var(--ui-radius-xl)',
      },
      boxShadow: {
        glow: 'var(--ui-shadow-glow)',
        soft: 'var(--ui-shadow-soft)',
        neon: 'var(--ui-shadow-neon)',
      },
      transitionTimingFunction: {
        snappy: 'var(--ui-ease-snappy)',
        stage: 'var(--ui-ease-stage)',
      },
    },
  },
}
```

---

## Component Library Theme Override (Naive UI / Element Plus)

```js
const themeOverrides = {
  common: {
    primaryColor: 'var(--ui-brand)',
    successColor: 'var(--ui-success)',
    warningColor: 'var(--ui-warning)',
    errorColor: 'var(--ui-danger)',
    infoColor: 'var(--ui-info)',
    borderRadius: 'var(--ui-radius-md)',
    fontFamily: 'var(--ui-font-sans)',
    fontSize: 'var(--type-body)',
  },
  Button: {
    borderRadiusMedium: 'var(--ui-radius-md)',
    colorPrimary: 'var(--ui-brand)',
    colorPrimaryHover: 'color-mix(in oklch, var(--ui-brand) 85%, white)',
    colorPrimaryPressed: 'color-mix(in oklch, var(--ui-brand) 85%, black)',
  },
  Card: {
    borderRadius: 'var(--ui-radius-lg)',
    color: 'var(--ui-surface)',
  },
  Input: {
    borderRadius: 'var(--ui-radius-sm)',
    borderFocus: 'var(--ui-brand)',
    boxShadowFocus: 'var(--ui-brand-glow)',
  },
}
```

---

## Motion Mapping

### CSS Keyframes

```css
@keyframes ui-enter {
  from {
    opacity: 0;
    transform: translateY(24px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.ui-enter {
  animation: ui-enter 0.5s var(--ui-ease-stage) both;
}

/* Stagger */
.ui-stagger > * { animation: ui-enter 0.5s var(--ui-ease-stage) both; }
.ui-stagger > *:nth-child(1) { animation-delay: 0ms; }
.ui-stagger > *:nth-child(2) { animation-delay: 60ms; }
.ui-stagger > *:nth-child(3) { animation-delay: 120ms; }
.ui-stagger > *:nth-child(4) { animation-delay: 180ms; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ui-enter, .ui-stagger > * {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }
}

/* Shimmer (loading skeleton) */
@keyframes ui-shimmer {
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
}
.ui-skeleton {
  background: linear-gradient(90deg, var(--ui-surface) 25%, var(--ui-surface-alt) 50%, var(--ui-surface) 75%);
  background-size: 200% 100%;
  animation: ui-shimmer 1.5s linear infinite;
  border-radius: var(--ui-radius-sm);
}
```

### Framer Motion (React)

```jsx
const enterVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { ease: [0.25, 1, 0.5, 1], duration: 0.5 }
  }
}

// Stagger container
const staggerContainer = {
  visible: { transition: { staggerChildren: 0.06 } }
}
```

### Vue Transition

```vue
<template>
  <Transition name="ui-enter">
    <slot />
  </Transition>
</template>

<style>
.ui-enter-enter-active { transition: all 0.5s var(--ui-ease-stage); }
.ui-enter-enter-from { opacity: 0; transform: translateY(24px); filter: blur(4px); }
.ui-enter-leave-active { transition: all 0.25s var(--ui-ease-snappy); }
.ui-enter-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
```

---

## Card Example (Framework-Agnostic)

```html
<div class="ui-card ui-card--feature ui-enter" style="--stagger-index: 0">
  <div class="ui-card__content">
    <h3 class="ui-heading">Feature Title</h3>
    <p class="ui-body">Short description with muted secondary detail.</p>
  </div>
</div>
```

```css
.ui-card {
  position: relative;
  padding: var(--ui-space-md);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface);
  border: 1px solid var(--ui-stroke);
  backdrop-filter: blur(var(--ui-blur-glass));
  box-shadow: var(--ui-shadow-soft);
  transition: transform 0.4s var(--ui-ease-snappy), box-shadow 0.4s var(--ui-ease-snappy);
}
.ui-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--ui-shadow-glow);
}
/* States */
.ui-card--empty {
  display: flex; align-items: center; justify-content: center;
  min-height: 200px; color: var(--ui-text-muted);
}
.ui-card--loading { /* Apply .ui-skeleton class to child placeholders */ }
```

---

## CSS Layer Order

```css
@layer reset, tokens, base, components, utilities;

@layer reset { /* normalize / reset */ }
@layer tokens { /* :root variables, [data-theme] */ }
@layer base { /* typography, global styles */ }
@layer components { /* .ui-card, .ui-button, etc */ }
@layer utilities { /* overrides, Tailwind @apply */ }
```

---

## Report Template

Agent outputs `report.md` after project analysis:

```markdown
# UI Migration Report

Project: <project-name>
Date: <date>
Stack: <detected frameworks>
Browser support: <browserslist summary>

## Summary
- Token injection: tokens/design-tokens.css
- Stage layout: src/layouts/StageLayout.*
- Component mapping: mappings/<framework>/*
- Type scale: tokens/type-scale.css
- Motion utils: utils/motion.*

## Modified Files
| File | Change | Impact |
|---|---|---|
| <file> | <what changed> | <visual impact> |

## Execution Chain Results
| Check | Status | Notes |
|---|---|---|
| Token usage | PASS/FAIL | |
| Card nesting | PASS/FAIL | |
| State coverage | PASS/FAIL | |
| Motion + reduced-motion | PASS/FAIL | |
| Theme compatibility | PASS/FAIL | |
| Responsive | PASS/FAIL | |
| Accessibility | PASS/FAIL | |
| Type hierarchy | PASS/FAIL | |

## Priority Fix List
| # | Item | Impact | Complexity | Files |
|---|---|---|---|---|
| 1 | <highest impact> | HIGH | LOW | <files> |

## Developer Migration Steps
1. Pull patch branch
2. Install fonts (Clash Display + Inter)
3. Run lint checks
4. Review Stage + token injection
5. Verify reduced-motion behavior
6. Merge and deploy
```
