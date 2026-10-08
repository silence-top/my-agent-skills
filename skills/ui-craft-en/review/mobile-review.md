# Mobile Review: mobile acceptance

Use with the shared items in [visual review](visual-review.md). This document contains mobile-specific checks only. See [mobile](../platforms/mobile.md) for source rules and [iOS](../platforms/ios.md) or [Android](../platforms/android.md) for platform differences.

## 1. Mobile anti-patterns

When one appears, change structure rather than only color values.

| ID | Symptom | Fix |
|---|---|---|
| `M1` | Navigation form chosen before destinations | Choose bottom tabs, task entries, or drill-down from top-level tasks |
| `M2` | Desktop shrunk or every column stacked | Reorganize by retain, summarize, drill down, and defer |
| `M3` | Dialog nested in dialog | Page steps or one modal |
| `M4` | Targets are small or overlap | HTML 48×48 CSS px measured in both dimensions; native 44pt / 48dp by platform |
| `M5` | Safe area or sticky footer covers content | `env()`, reserved space, and real-device confirmation |
| `M6` | System scroll or zoom is broken | Preserve platform behavior and never disable zoom |
| `M7` | Gradient quantity replaces a visual anchor | Use primary task, area, proportion, and reading path |
| `M8` | Decorative loop or global press-to-scale | Give semantic feedback only to the relevant operation |
| `M9` | State distinguished only by color | Add text or icon |
| `M10` | Soft keyboard covers input or submit | Scrollable workspace, `dvh`, and real-device test |
| `M11` | Several equally weighted primary actions | Keep one strongest action for the current task |
| `M12` | Result is expressed only through haptics | Add visible and screen-reader-announced feedback |

## 2. Acceptance checks

| # | Check | Criterion |
|---|---|---|
| 1 | Target devices | Affected viewports, at least one of 360×800 or 390×844 and 430×932 when targeting large phones, have no overflow and keep the primary action reachable |
| 2 | Touch | HTML hit areas are ≥ 48 CSS px in both dimensions; pseudo-element expansion does not overlap neighbors |
| 3 | Safe area | Top / bottom / left / right `env()` handled; desktop simulation labeled as simulated |
| 4 | Soft keyboard | Focused input and submit remain reachable; body is not locked to a fixed height |
| 5 | Long text and zoom | 200% zoom and long Chinese wrapping neither cover actions nor clip text |
| 6 | Navigation | Drill-down returns with filters and scroll preserved; gesture is not the only entry; bottom tabs ≤ 5 and switch real content |
| 7 | Modal | Sheet / dialog isolates background, closes with Escape, restores focus, does not nest, and leaves no scroll lock |
| 8 | States | Applicable loading / empty / error / denied states are real and recoverable |
| 9 | Real result | Search / complete / delete keeps counts and views consistent from one data source |
| 10 | Motion | Press / sheet / selection uses semantic timing; reduced-motion and motion-off remove displacement |
| 11 | Information trade-off | Review the new layout for over-omitted fields and thumb-reachable primary action |
| 12 | Performance | Images have dimensions; long lists paginate or virtualize; do not claim LCP / INP / CLS without measurement |

## 3. State the test method

| Item | Browser can test | Requires device or emulator |
|---|---|---|
| Layout, overflow, hit-area size | ✓ | |
| Actual safe-area values | Simulated padding | ✓ |
| Soft-keyboard obstruction | Shortened viewport is only a stress test | ✓ |
| System Back and back gesture | | ✓ |
| Dynamic Type / system font scaling | Approximation | ✓ |
| VoiceOver / TalkBack | | ✓ |
| Haptics | | ✓ |

Disclose the boundary when real-device testing was not performed. Do not require every viewport and state combination for routine changes. The repository preview tool maintains its existing example matrix.
