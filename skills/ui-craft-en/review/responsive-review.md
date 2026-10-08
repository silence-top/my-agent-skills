# Responsive Review: viewport, zoom, and overflow

Use with [visual review](visual-review.md). Responsive design means an explicit structural decision at each viewport tier, not merely remaining visible when reduced. Zoom and long text are another form of the same pressure.

## 1. Viewport matrix

Select tiers affected by the current change; do not run every tier each time.

| Viewport | Structural decision | Source |
|---|---|---|
| 1920×1080 | Increase workspace area without stretching controls indefinitely; remain readable when projected | [web](../platforms/web.md) / [Electron](../platforms/electron.md) |
| 1440×900 | Keep primary task, queue, and context together | |
| 1280×800 | Admin and operations design baseline | [web](../platforms/web.md) §1 |
| 1024×768 | Must remain usable: sidebar becomes an icon rail with accessible names; inspector may collapse while critical state remains | |
| 768×1024 | Transitional layout explicitly merges or drills into regions | |
| 360×800, 390×844, 430×932 | Reorganize as a mobile task, not a scaled canvas | [mobile](../platforms/mobile.md) |

## 2. Response strategies

- Design at 1280×800 and keep 1024 usable. Below 1024, reassess the task: move low-frequency properties into details, split editing into steps, and allow local horizontal scrolling only for genuine comparison tables in labeled containers.
- Do not squeeze collapsed navigation text into 60–70px vertical writing. Keep readable navigation at ≥ 96px when necessary.
- Before using `min-width` to preserve a table, hide lower-priority columns or move details into expandable rows.
- Build mobile only for real mobile scenarios such as query, approval, and status. Recompose with the seven patterns in [mobile](../platforms/mobile.md), not by shrinking the desktop page.
- Read-only degradation needs an explicit business reason and message.

## 3. Zoom and text enlargement

- At 200% browser zoom, layout remains intact and the page has no horizontal scrollbar. Business systems may use a local content scroller, but navigation must remain usable.
- Support system text enlargement. At minimum, allow users to override the `html` font size instead of fixing every size against enlargement.
- Never disable zoom with `user-scalable=no` or `maximum-scale=1`.
- Let line-height and containers grow with text. Avoid locked `height: 32px` plus `line-height: 32px`; use `min-height` and padding.
- At 200% zoom, controls may wrap and the workspace may switch to a step-based structure.

## 4. Acceptance checks

| # | Check | Criterion |
|---|---|---|
| 1 | No overflow | Affected viewports have no page-level horizontal scroll; local scrollers are labeled |
| 2 | 1024 usable | Collapsed sidebar retains accessible names and the primary task is completable |
| 3 | Mobile recomposition | Narrow view is not proportionally reduced; primary action and required summary remain |
| 4 | 200% zoom | Layout holds, navigation works, and actions are not covered |
| 5 | Long text | Long Chinese, numbers, and English words wrap or truncate intentionally without breaking containers |
| 6 | Real rendering | Verify at actual viewports; do not treat CSS transform-scaled preview as responsive testing |
| 7 | Two themes | Verify light and dark themes at each affected viewport |

## 5. Boundary

Automated checks record actual viewport, theme, density, and completion state. Pending, missing coverage, or timeout cannot pass green. Shortening a desktop viewport is only a soft-keyboard layout stress test, not real-device IME acceptance; see [mobile review](mobile-review.md) §3.
