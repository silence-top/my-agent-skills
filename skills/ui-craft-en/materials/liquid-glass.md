# Liquid Glass: more than a transparent background and blur

Liquid Glass = material + optics + behavior. Without any one of these, it is ordinary [frosted material](frosted.md). The foundation's Glassmorphism style describes an appearance; this file defines how a glass object exists and behaves in an interface.

## 1. When to use it

Use for identity-defining local surfaces: media players, dock-like persistent overlays, and controls over immersive content. It is part of the product, not a filter applied to arbitrary cards. Do not use it for forms, tables, alerts, confirmation dialogs, or other information that requires absolute readability.

## 2. Eleven dimensions

| Dimension | Definition | Web approximation | Symptom when missing |
|---|---|---|---|
| Material | Glass has thickness; it is not a transparent color | Carrying surface via `color-mix` plus inner border for thickness | Looks like a translucent rectangle |
| Blur | Lower content loses focus while color and motion remain perceptible | `backdrop-filter: blur(16–24px) saturate(1.2–1.4)` | Lower text bleeds through and destroys readability |
| Refraction | Lower content shifts or bends slightly at edges | Edge gradient mask plus subtle `backdrop-filter` variation; optional | Hard sticker-like edge |
| Transparency | Reveal amount follows information density | Controls use 70–85% fill; purely decorative layers may reveal more | Density is reversed: prose transparent, decoration opaque |
| Specular highlight | Thin bright line on the lit top edge | `inset 0 1px 0 rgb(255 255 255 / .35)` | No sense of volume |
| Edge light | Thin dark edge on bottom/backlit side, paired with highlight | `inset 0 -1px 0 rgb(0 0 0 / .12)` | Bright edge reads as a border |
| Depth | Glass clearly covers a solid layer | One outer `--ui-shadow-lg`; never glass on glass | Layer order is unreadable |
| Shadow | Explains elevation only; never decoration | Weaken in dark themes; rely on border and tint | Floating black block on dark backgrounds |
| Background interaction | Glass changes as content below scrolls or plays | Render real content below and let glass reveal it | Fixed color pretending to be glass |
| Dynamic tint | Revealed hue comes from real lower content | Avoid fixed tint; when thematic color is required, use low saturation rather than an overlay color | One “glass blue” across the product |
| Motion | Tracking and positional feedback follow platform norms; reduced motion becomes static frost | Transform + opacity; see [motion](../visual-dna/motion.md) | Glass teleports or bounces excessively |

Use one global light direction: highlights stay on the same side throughout the product.

## 3. Reusable core

```css
/* Add over .frosted: highlight + dark edge + one real shadow */
.liquid-glass {
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.35),
    inset 0 -1px 0 rgb(0 0 0 / 0.12),
    var(--ui-shadow-lg);
}
@media (prefers-reduced-motion: reduce) {
  .liquid-glass { transition: none; }   /* Degrade to static frost */
}
```

## 4. Hard constraints

- The background behind text must be calculable. Text over glass remains a separate manual-review item and never auto-passes.
- Keep glass scarce; one persistent overlay per screen is normal. Glass does not carry dense body copy.
- Large or scrolling blur has measurable performance cost; provide a solid fallback on lower-end devices.
- High-risk information such as dosages, money, and deletion confirmation always rests on [solid](solid.md).
- Native iOS/macOS materials are platform capabilities. A Web implementation is an approximation and must not claim equivalence; see [native review](../review/native-review.md).

## 5. Quick decision

1. What does the surface carry? High-risk information or dense prose → solid.
2. What is below it? Stable color → [translucent](translucent.md) is enough; dynamic media → at least frosted.
3. Is it part of the product's identity? No → return to frosted or solid.
4. How many of the eleven dimensions are real? If it lacks any of material + blur + highlight/dark edge + depth + dynamic tint, call it frosted rather than liquid glass.
