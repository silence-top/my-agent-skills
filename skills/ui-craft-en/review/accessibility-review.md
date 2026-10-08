# Accessibility Review: non-negotiable baselines

Accessibility is not an add-on; it determines whether an interface can be used. This matters especially in healthcare, government, and finance, where users may be older, have color-vision differences, or rely entirely on a keyboard. The foundation's UX Guidelines cover general principles. This document defines this skill's measurable standards and Chinese-language pitfalls.

## 1. Contrast

| Content | Minimum | Target |
|---|---:|---:|
| Body text | 4.5:1 | 7:1 |
| Large text, ≥ 18.66px bold or ≥ 24px | 3:1 | 4.5:1 |
| Information-bearing icons | 3:1 | 4.5:1 |
| Border or divider | 3:1 when it is the control's only boundary | — |
| Disabled text | Exempt | Still distinguishable; ≥ 3:1 is friendlier |
| Focus ring | 3:1 against adjacent colors | — |

Measure rather than judge by eye. Common pitfalls:
- Muted text is still ordinary text and is not exempt from 4.5:1. Verify official muted tokens against every background where they are used.
- Button text uses a semantic foreground token. A light brand color may not support white text, and hover/active states need separate tests.
- Status contrast depends on the actual background and alpha compositing. Do not pass it based on a color name or a hard-coded sample ratio. See [translucent material](../materials/translucent.md) for text-bearing translucent and frosted surfaces.
- Placeholder text also needs 4.5:1; many mockups provide only around 2.5:1.
- Test dark theme independently instead of reusing light-theme conclusions.

## 2. Keyboard access

| Requirement | Detail |
|---|---|
| Every function works by keyboard alone | Tab / Shift+Tab / Enter / Space / arrows / Escape |
| Focus order matches visual order | Do not reorder with positive `tabindex` |
| `:focus-visible` has a visible ring | See below |
| Skip to main content | Long-navigation pages provide `Skip to main content` |
| Dialog focus is trapped | Focus enters on open, Escape closes, focus returns to trigger |
| No hover dependency | Critical actions revealed on hover must also appear on focus |
| Table keyboard behavior | Controls inside a semantic table use Tab / Space / Enter; only a true ARIA grid adds an arrow-key model |

```css
:focus-visible {
  outline: 2px solid var(--ui-brand);
  outline-offset: 2px;
  border-radius: inherit;
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--ui-shadow-focus);
}
```

Never use `outline: none` without an equivalent replacement.

## 3. Semantics and structure

```html
<header>Patient management</header>
<nav aria-label="Primary navigation">Patient-related destinations</nav>
<main>
  <h1>Patient list</h1>
  <section aria-labelledby="filter-title">
    <h2 id="filter-title">Filters</h2>
  </section>
  <section aria-labelledby="result-title">
    <h2 id="result-title">Results</h2>
    <table aria-label="Patient search results"></table>
  </section>
</main>
```

- Do not skip heading levels. Use one `h1` per page and never choose `h4` only for its size.
- Use `button` for actions and `a` for links, not `div` plus a click handler.
- Use `<table>` with `<th scope>` for data tables, not a grid of `div` elements unless implementing the full ARIA grid pattern.
- Every form control has `<label for>`. Connect help and errors with `aria-describedby`.
- Icon buttons have accessible names: `<button aria-label="Delete this record"><svg aria-hidden="true"></svg></button>`.
- Decorative icons and images use `aria-hidden="true"` or `alt=""`.

## 4. Color is not the only carrier

| Scenario | Required supplement |
|---|---|
| Status | Icon + text, not only a colored dot |
| Form error | Error text + border color + optional icon |
| Chart groups | Direct labels, different shapes, or pattern fills |
| Highlighted table row | Highlight + leading marker |
| Required field | `*` + explanatory text |
| Link | Underline or another explicit style |

Test color-vision differences by operating the rendered HTML under temporary grayscale or color-vision simulation. Text, icons, or shapes must still communicate state.

## 5. Touch and pointer

| Item | Requirement |
|---|---|
| Touch target | HTML defaults to ≥ 48×48 CSS px; native iOS ≥ 44pt and Android ≥ 48dp, without mixing units. Desktop ≥ 24×24 CSS px with ≥ 8px spacing by default |
| Icon button | The icon may be 16px, but the hit area meets both dimensions and does not overlap neighbors |
| Gesture | Do not depend on a custom gesture; swipe-to-delete also has a button |
| Hover | Hover help never contains the only critical information |

## 6. Dynamic content and screen readers

```html
<div aria-live="polite" class="sr-only">{{ statusText }}</div>
<div role="status" aria-live="polite">Loading patient list</div>
<div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">Confirm deletion</div>
```

- After sorting or filtering, announce `Sorted by admission time in descending order, 128 records` and localize it for the product language.
- After failed submission, announce the error summary and focus the first invalid field.
- Expose long-task progress with `role="progressbar"` and `aria-valuenow`.

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
```

## 7. Zoom and adaptation

Support 200% zoom, system text enlargement, unrestricted zoom, and `min-height` instead of locked heights. See [responsive review](responsive-review.md) §3.

## 8. Self-check

| # | Check | Criterion |
|---|---|---|
| 1 | Contrast | Body ≥ 4.5:1 and large text ≥ 3:1, measured |
| 2 | Visible focus | Every focusable element has a visible ring; no bare `outline: none` |
| 3 | Keyboard | Full flow works by keyboard, including dialogs and tables |
| 4 | Semantics | Landmarks, heading hierarchy, `label`, and `th scope` are correct |
| 5 | Names | Every icon button has `aria-label` |
| 6 | Color | States remain distinguishable under grayscale simulation |
| 7 | Touch | Mobile HTML targets are ≥ 48 CSS px in both dimensions |
| 8 | Announcements | Asynchronous results and errors use `aria-live` |
| 9 | Zoom | Interface remains usable at 200% |
| 10 | Preferences | `prefers-reduced-motion` and dark theme are verified |

## 9. Automated-measurement boundaries

Checks record the actual viewport, theme, density, and completion state. Pending, missing required cases, timeouts, or uncomputable results cannot pass green. Let the browser resolve `oklch` and `color-mix`, then perform alpha compositing. When media, gradients, or mixed layers make the background indeterminate, report manual review instead of silently skipping. Source-token scans and rendered contrast are separate evidence.

Document testing methods separately for 200% zoom, system text enlargement, mobile soft keyboard, safe areas, and screen readers. Shortening a desktop viewport is only a soft-keyboard layout stress test; it is not real-device IME or native accessibility acceptance.
