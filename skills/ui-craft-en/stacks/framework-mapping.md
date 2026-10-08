# Framework Mapping: Tailwind and component-library themes

Map the semantic tokens in [ui-tokens.css](../assets/ui-tokens.css) into Tailwind and component libraries. Two principles apply:

1. Mapping tables may reference only `var(--ui-*)` values (R02); concrete colors exist only in the token file.
2. Theme switching changes only the token layer through `[data-theme]`; mappings and component code do not know the theme.

## 1. Tailwind

```js
// tailwind.config.js — reference tokens without copying values
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--ui-font-sans)'],
        display: ['var(--ui-font-display)'],
        serif: ['var(--ui-font-serif)'],
        mono: ['var(--ui-font-mono)'],
      },
      fontSize: {
        caption: ['var(--ui-text-caption)', { lineHeight: 'var(--ui-leading-tight)' }],
        sm: ['var(--ui-text-sm)', { lineHeight: 'var(--ui-leading-snug)' }],
        base: ['var(--ui-text-base)', { lineHeight: 'var(--ui-leading-normal)' }],
        lg: ['var(--ui-text-lg)', { lineHeight: 'var(--ui-leading-normal)' }],
        xl: ['var(--ui-text-xl)', { lineHeight: 'var(--ui-leading-snug)' }],
        '2xl': ['var(--ui-text-2xl)', { lineHeight: 'var(--ui-leading-tight)' }],
        '3xl': ['var(--ui-text-3xl)', { lineHeight: 'var(--ui-leading-tight)' }],
        '4xl': ['var(--ui-text-4xl)', { lineHeight: 'var(--ui-leading-tight)' }],
      },
      colors: {
        canvas: 'var(--ui-canvas)',
        surface: {
          DEFAULT: 'var(--ui-surface)',
          alt: 'var(--ui-surface-alt)',
          raised: 'var(--ui-surface-raised)',
        },
        stroke: { DEFAULT: 'var(--ui-stroke)', strong: 'var(--ui-stroke-strong)' },
        content: {
          primary: 'var(--ui-text-primary)',
          secondary: 'var(--ui-text-secondary)',
          muted: 'var(--ui-text-muted)',
          inverse: 'var(--ui-text-inverse)',
        },
        brand: { DEFAULT: 'var(--ui-brand)', subtle: 'var(--ui-brand-subtle)' },
        success: 'var(--ui-success)',
        warning: 'var(--ui-warning)',
        danger: 'var(--ui-danger)',
        info: 'var(--ui-info)',
      },
      borderRadius: {
        xs: 'var(--ui-radius-xs)',
        sm: 'var(--ui-radius-sm)',
        md: 'var(--ui-radius-md)',
        lg: 'var(--ui-radius-lg)',
        xl: 'var(--ui-radius-xl)',
        '2xl': 'var(--ui-radius-2xl)',
        full: 'var(--ui-radius-full)',
      },
      boxShadow: {
        xs: 'var(--ui-shadow-xs)',
        sm: 'var(--ui-shadow-sm)',
        md: 'var(--ui-shadow-md)',
        lg: 'var(--ui-shadow-lg)',
        focus: 'var(--ui-shadow-focus)',
      },
      transitionTimingFunction: {
        standard: 'var(--ui-ease-standard)',
        snappy: 'var(--ui-ease-snappy)',
        exit: 'var(--ui-ease-exit)',
      },
      zIndex: {
        sticky: 'var(--ui-z-sticky)',
        dropdown: 'var(--ui-z-dropdown)',
        overlay: 'var(--ui-z-overlay)',
        modal: 'var(--ui-z-modal)',
        drawer: 'var(--ui-z-drawer)',
        popover: 'var(--ui-z-popover)',
        toast: 'var(--ui-z-toast)',
      },
    },
  },
}
```

Notes:

- Chinese line height uses `--ui-leading-*` from ui-tokens.css, not line height generated from a Western type scale; see [typography](../visual-dna/typography.md).
- Size names align with `--ui-text-*`. Overriding Tailwind's default `sm` / `base` is intentional because Chinese body text starts at 14px. Add or remove non-default tiers such as `md` / `2xl` as needed.
- `zIndex` mappings keep magic numbers out of layout code. Add omitted tiers such as `--ui-z-loading` or `--ui-z-base` when required.

## 2. Naive UI

```js
const themeOverrides = {
  common: {
    primaryColor: 'var(--ui-brand)',
    primaryColorHover: 'var(--ui-brand-hover)',
    primaryColorPressed: 'var(--ui-brand-active)',
    successColor: 'var(--ui-success)',
    warningColor: 'var(--ui-warning)',
    errorColor: 'var(--ui-danger)',
    infoColor: 'var(--ui-info)',
    borderRadius: 'var(--ui-radius-md)',
    fontFamily: 'var(--ui-font-sans)',
    fontSize: 'var(--ui-text-base)',
  },
  Card: { borderRadius: 'var(--ui-radius-lg)', color: 'var(--ui-surface)' },
  Input: { borderRadius: 'var(--ui-radius-sm)' },
}
```

Known pitfall: Naive UI derives additional colors such as hover, active, and suppl in JavaScript, where a CSS-variable string cannot participate in color computation. If derived colors fail, override the rendered `--n-*` variables in CSS or pass concrete values from JSON generated from the token file.

## 3. Element Plus

Element Plus uses CSS-variable overrides and needs no config file:

```css
:root {
  --el-color-primary: var(--ui-brand);
  --el-color-success: var(--ui-success);
  --el-color-warning: var(--ui-warning);
  --el-color-danger: var(--ui-danger);
  --el-color-info: var(--ui-info);
  --el-border-radius-base: var(--ui-radius-md);
  --el-font-family: var(--ui-font-sans);
}
```

Element Plus creates hover and active scales by mixing its primary color with white or black, where light-N means N tenths white and dark-N means N tenths black. Preserve those proportions and replace only the base color:

```css
--el-color-primary-light-3: color-mix(in oklch, var(--ui-brand) 70%, white);
--el-color-primary-dark-2: color-mix(in oklch, var(--ui-brand) 80%, black);
```

## 4. Incremental migration for an existing project

When modernizing a project, follow the same order as “Modify an existing page” in SKILL.md §2:

1. **Detect the stack**: framework, styling solution, component library, and browserslist determine which mapping in §1–§3 applies.
2. **Plan mappings**: create a correspondence from current colors and dimensions to `--ui-*` semantic tokens. Mark values without a clear match instead of normalizing them immediately.
3. **Inject tokens**: include ui-tokens.css or map existing variables to semantic names. This step produces no visual change.
4. **Replace by component**: prefer theme overrides or wrapper components, then update style references. Do not rewrite everything.
5. **Accept the change**: use [visual review](../review/visual-review.md) on affected pages. Before a larger migration, run [scan-project.mjs](../assets/tools/scan-project.mjs) to locate hard-coded colors (R02).

Red lines:

- Migration does not change information structure or business behavior. Handle template-like issues separately through [anti-generic](../visual-dna/anti-generic.md) instead of hiding redesign inside migration.
- Do not automatically generate migration reports or patch directories. Follow SKILL.md §5: briefly state changes, verification, and untested boundaries.
