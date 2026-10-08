# Frosted: for system-level overlays

Frosted = `backdrop-filter` blur + translucent fill + fallback carrying surface. It visually belongs to the content below while blurring that content until simultaneous reading is unnecessary.

## 1. When to use it

Use for system-level overlays such as menus, dialogs, sheets, mini-players, and bottom toolbars when the content underneath does not need to remain readable. One frosted overlay per screen is normal; do not stack glass on glass.

## 2. Construction

```css
/* Frosted overlay: measurable carrying surface plus fallback */
.frosted {
  background: color-mix(in oklch, var(--ui-surface) 82%, transparent);
  backdrop-filter: blur(16px) saturate(1.2);
  border: var(--ui-border-width) solid var(--ui-stroke-strong);
  box-shadow: var(--ui-shadow-lg);
}
@supports not (backdrop-filter: blur(1px)) {
  .frosted { background: var(--ui-surface); }
}
```

- Carrying surface: the `color-mix` result is the measurable contrast surface. Calculate text contrast against that solid result; blur is enhancement only.
- Fallback: `@supports not (backdrop-filter)` provides a solid surface.
- Boundary: shadows weaken in dark themes, so frosted layers rely more on a border.

## 3. When not to use it

- Long-form reading, dense tables, or forms: background blur adds noise rather than information.
- Performance-constrained devices: large or scrolling blur has measurable cost; provide a solid fallback for lower-end devices.
- Information requiring absolute clarity: place alert or confirmation copy and actions on a solid inner surface; frost may remain the outer container.

## 4. Hard constraints

- Blur is off by default. When enabled, state which spatial relationship it explains.
- Frosted surfaces do not carry dense body copy. Dosages, money, and deletion confirmation always rest on [solid](solid.md).
- Native platform materials such as iOS/macOS vibrancy are real platform capabilities. Web implementations only approximate them and must not claim equivalence. Use native materials in desktop shells when available; see [macOS](../platforms/macos.md).
- Upgrade to [liquid glass](liquid-glass.md) only when refraction highlights, dynamic tint, and responsive behavior are required.
