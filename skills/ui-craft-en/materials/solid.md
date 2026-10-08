# Solid: the default material

Material answers “what does the content rest on?” It is a hierarchy tool, not a style quota. Local fixes retain the current material unless changing it solves the problem. The four material families increase in readability cost: solid → [translucent](translucent.md) → [frosted](frosted.md) → [liquid glass](liquid-glass.md).

## 1. When to use it

Use solid by default for body copy, tables, forms, and all high-risk information: medication dosages, money, deletion confirmation, permission explanations, and alerts. No style returned by the foundation changes this rule.

## 2. Construction

Use semantic background tokens (`--ui-canvas`, `--ui-surface`, `--ui-surface-elevated`) plus a necessary border or shadow. See [depth](../visual-dna/depth.md) §1 for surface roles.

```css
.solid-panel {
  background: var(--ui-surface);
  border: var(--ui-border-width) solid var(--ui-stroke);
}
.solid-floating {
  background: var(--ui-surface-floating);
  box-shadow: var(--ui-shadow-lg);   /* Shadows only for real overlays */
}
```

## 3. When not to change to it

- Do not replace a readable solid form with glass merely to create a “premium” feel; readability only declines.
- The inverse matters too: solid does not mean gray background plus white cards. Group with spacing and alignment before wrapping every segment in a solid box.

## 4. Dark theme

Shadows weaken on dark backgrounds. Distinguish solid layers through tonal differences and necessary boundaries, not borders on every surface. Verify text contrast separately in light and dark themes.

## 5. Quick decision

1. What does this surface carry? High-risk information or dense prose → solid; stop.
2. Is it part of the product's identity? No → solid.
3. Consider another material only for a persistent overlay, media context, or identity-defining surface.
