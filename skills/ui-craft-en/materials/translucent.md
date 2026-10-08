# Translucent: only over a stable background

Translucent = semantic surface color + controlled opacity over a stable, predictable layer. It does not blur, so it is inexpensive and contrast can be calculated, but only when the content below is known.

## 1. When to use it

Use for secondary layers over a stable color: sticky bars, sidebar overlays, selected-row backgrounds, and Focus / Highlight semantic surfaces. When Canvas or Surface is below, calculate text contrast from the composited result.

## 2. Construction

```css
.translucent-bar {
  background: color-mix(in oklch, var(--ui-surface) 90%, transparent);
  border-bottom: var(--ui-border-width) solid var(--ui-stroke);
}
```

Opacity comes from a controlled semantic-color mix, not an arbitrary `rgba(255 255 255 / .5)`. Derive hover and active states from the same base; see the `color-mix` layer in [ui-tokens.css](../assets/ui-tokens.css).

## 3. When not to use it

- Avoid where the text background cannot be calculated: media, gradients, or scrolling content below will make contrast drift. Return to [solid](solid.md), or use [frosted](frosted.md) with a carrying surface.
- High-risk information never rests directly on a translucent surface.

## 4. Verification

Measure contrast after compositing base color × opacity × lower-layer color; do not infer it from color names or design-file values. Verify light and dark themes separately. Text over gradients, images, or translucent backgrounds with indeterminate color remains a manual-review item and never auto-passes.
