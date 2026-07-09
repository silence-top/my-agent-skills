# Reference: Design Tokens & Framework Mapping

Full token values and mapping examples. SKILL.md references this file for implementation details.

---

## Complete Token Definition

```json
{
  "fonts": {
    "display": "Clash Display, SF Pro Display, -apple-system, sans-serif",
    "sans": "Inter, SF Pro Text, system-ui, sans-serif"
  },
  "easing": {
    "designerIn": "cubic-bezier(0.16, 1, 0.3, 1)",
    "stage": "cubic-bezier(0.25, 1, 0.5, 1)"
  },
  "radius": { "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px" },
  "spacing": { "xs": "8px", "sm": "12px", "md": "20px", "lg": "32px", "xl": "48px" },
  "blur": { "soft": "20px", "strong": "40px", "glass": "12px" },
  "shadow": {
    "glow": "0 0 40px rgba(99,102,241,0.25)",
    "soft": "0 10px 40px rgba(0,0,0,0.25)",
    "neon": "0 0 20px rgba(255,0,200,0.6)"
  },
  "layers": { "bg": -1, "surface": 0, "content": 10, "overlay": 20, "modal": 30, "tooltip": 40 }
}
```

---

## Theme Palettes

| Token | dark | light | neon | cyber | soft |
|---|---|---|---|---|---|
| `canvas` | `#060608` | `#f8fafc` | `#050510` | `#0b0f0f` | `#faf7ff` |
| `surface` | `rgba(18,18,24,0.65)` | `rgba(255,255,255,0.75)` | `rgba(20,20,40,0.55)` | `rgba(30,30,40,0.6)` | `rgba(255,255,255,0.85)` |
| `brand` | `#6366f1` | `#4f46e5` | `#00f0ff` | `#00e0ff` | `#a06bff` |
| `brandGlow` | `rgba(99,102,241,0.25)` | `rgba(79,70,229,0.12)` | `rgba(0,240,255,0.35)` | `rgba(0,224,255,0.4)` | `rgba(160,107,255,0.25)` |
| `textPrimary` | `#f8fafc` | `#0f172a` | `#f0f0ff` | `#e0f0f0` | `#1a1025` |
| `textMuted` | `#64748b` | `#94a3b8` | `#7088a0` | `#6090a0` | `#8070a0` |

---

## CSS Variables Mapping

```css
:root {
  /* Fonts */
  --ui-font-display: Clash Display, SF Pro Display, -apple-system, sans-serif;
  --ui-font-sans: Inter, SF Pro Text, system-ui, sans-serif;

  /* Easing */
  --ui-ease-designer: cubic-bezier(0.16, 1, 0.3, 1);
  --ui-ease-stage: cubic-bezier(0.25, 1, 0.5, 1);

  /* Radius */
  --ui-radius-sm: 8px;
  --ui-radius-md: 16px;
  --ui-radius-lg: 24px;
  --ui-radius-xl: 32px;

  /* Spacing */
  --ui-space-xs: 8px;
  --ui-space-sm: 12px;
  --ui-space-md: 20px;
  --ui-space-lg: 32px;
  --ui-space-xl: 48px;

  /* Blur */
  --ui-blur-soft: 20px;
  --ui-blur-strong: 40px;
  --ui-blur-glass: 12px;

  /* Shadow */
  --ui-shadow-glow: 0 0 40px rgba(99,102,241,0.25);
  --ui-shadow-soft: 0 10px 40px rgba(0,0,0,0.25);
  --ui-shadow-neon: 0 0 20px rgba(255,0,200,0.6);

  /* Layers */
  --ui-layer-bg: -1;
  --ui-layer-surface: 0;
  --ui-layer-content: 10;
  --ui-layer-overlay: 20;
  --ui-layer-modal: 30;
  --ui-layer-tooltip: 40;
}

/* Dark theme (default) */
[data-theme="dark"] {
  --ui-canvas: #060608;
  --ui-surface: rgba(18,18,24,0.65);
  --ui-brand: #6366f1;
  --ui-brand-glow: rgba(99,102,241,0.25);
  --ui-text-primary: #f8fafc;
  --ui-text-muted: #64748b;
  --ui-stroke: rgba(255,255,255,0.08);
}

/* Light theme */
[data-theme="light"] {
  --ui-canvas: #f8fafc;
  --ui-surface: rgba(255,255,255,0.75);
  --ui-brand: #4f46e5;
  --ui-brand-glow: rgba(79,70,229,0.12);
  --ui-text-primary: #0f172a;
  --ui-text-muted: #94a3b8;
  --ui-stroke: rgba(0,0,0,0.06);
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
      colors: {
        canvas: 'var(--ui-canvas)',
        surface: 'var(--ui-surface)',
        brand: 'var(--ui-brand)',
        'brand-glow': 'var(--ui-brand-glow)',
        'text-primary': 'var(--ui-text-primary)',
        'text-muted': 'var(--ui-text-muted)',
        stroke: 'var(--ui-stroke)',
      },
      borderRadius: {
        sm: 'var(--ui-radius-sm)',
        md: 'var(--ui-radius-md)',
        lg: 'var(--ui-radius-lg)',
        xl: 'var(--ui-radius-xl)',
      },
      spacing: {
        xs: 'var(--ui-space-xs)',
        sm: 'var(--ui-space-sm)',
        md: 'var(--ui-space-md)',
        lg: 'var(--ui-space-lg)',
        xl: 'var(--ui-space-xl)',
      },
      boxShadow: {
        glow: 'var(--ui-shadow-glow)',
        soft: 'var(--ui-shadow-soft)',
        neon: 'var(--ui-shadow-neon)',
      },
      transitionTimingFunction: {
        designer: 'var(--ui-ease-designer)',
        stage: 'var(--ui-ease-stage)',
      },
    },
  },
}
```

---

## Component Library Theme Override (Example: Naive UI / Element Plus)

```js
// Pseudo theme override — adapt to actual library API
const themeOverrides = {
  common: {
    primaryColor: 'var(--ui-brand)',
    borderRadius: 'var(--ui-radius-md)',
    fontFamily: 'var(--ui-font-sans)',
  },
  Button: {
    borderRadiusMedium: 'var(--ui-radius-md)',
    colorPrimary: 'var(--ui-brand)',
    colorPrimaryHover: 'var(--ui-brand-glow)',
  },
  Card: {
    borderRadius: 'var(--ui-radius-lg)',
    color: 'var(--ui-surface)',
  },
}
```

---

## Motion Mapping Examples

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

.ui-stagger > *:nth-child(1) { animation-delay: 0ms; }
.ui-stagger > *:nth-child(2) { animation-delay: 60ms; }
.ui-stagger > *:nth-child(3) { animation-delay: 120ms; }
.ui-stagger > *:nth-child(4) { animation-delay: 180ms; }
```

### Framer Motion (React)
```jsx
const enterVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { ease: [0.25, 1, 0.5, 1], duration: 0.5 } }
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
</style>
```

---

## Card Example (Framework-Agnostic HTML)

```html
<!-- Card variant: feature -->
<div class="ui-card ui-card--feature" style="--stagger-index: 0">
  <div class="ui-card__content">
    <h3 class="ui-heading">Feature Title</h3>
    <p class="ui-body">Short description</p>
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
  transition: transform 0.4s var(--ui-ease-designer), box-shadow 0.4s var(--ui-ease-designer);
}
.ui-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--ui-shadow-glow);
}
```

---

## Report Template

Agent must output `report.md` after project analysis:

```markdown
# UI Migration Report

Project: <project-name>
Date: <date>
Stack: <detected frameworks>

## Summary
- Token injection: tokens/design-tokens.css
- Stage layout: src/layouts/StageLayout.*
- Component mapping: mappings/<framework>/*
- Lint rules: stylelint + eslint plugin

## Modified Files
- <file>: <reason>

## Execution Chain Results
- Token usage: PASS/FAIL
- Card nesting: PASS/FAIL
- Motion semantics: PASS/FAIL
- Theme compatibility: PASS/FAIL
- Accessibility: PASS/FAIL

## Developer Migration Steps
1. Pull patch branch
2. Run lint checks
3. Review Stage + mapping
4. Merge and deploy
```
