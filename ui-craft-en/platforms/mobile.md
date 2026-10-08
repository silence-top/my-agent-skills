# Mobile: not a vertical stack of desktop UI

These shared rules apply to mobile Web, native iOS/Android, and cross-platform apps. See [iOS](ios.md) and [Android](android.md) for platform differences. Read the product task before choosing structure. Do not mechanically invert “density first” into “less is always better”: field healthcare may be dense, media immersive, and tools step-based. Touch, readability, and risk safeguards remain constant.

For a new or reworked mobile layout, arrange the primary task, essential information, and reachable actions before navigation, safe areas, and progressive disclosure. Desktop content is preserved, summarized, drilled into, or deferred as needed; never silently remove critical fields.

## 1. Seven mobile compositions

| Structure | Reading and action order | Suitable for | Constraint |
|---|---|---|---|
| Immersive | Large visual → context → primary action | Playback and focused experiences | Show an honest state without content; exit always remains reachable |
| Content-first | Title → metadata → primary content → supporting | Articles, knowledge, reports | Table of contents may collapse; introduction does not overwhelm body |
| Tool-first | Context → workspace → sticky action | Formatting, calculation, conversion | Step input and result; do not shrink a desktop split editor |
| Feed | Featured → compact → progressive | Activity and media discovery | Feature and compact items use different rhythm; not all giant cards |
| Detail | Core object → core info → secondary → related actions | Medical record, report, media detail | Expand secondary fields on demand; never hide risk fields |
| Task | Context → primary task → confirmation → secondary | Verification, approval, field operations | One primary action; synchronize lists and counts after confirmation |
| Navigation-first | Primary navigation → content → contextual actions | Multiple peer destinations | Do not add bottom tabs to a single-task tool |

The visual focus may be the current request, workspace, playback subject, query, or timeline. Large headings, heroes, and gradients are optional. The seven structures prompt decisions; pages do not need to name their pattern.

## 2. Three densities and scale

Compact retains more essential summary with tight grouping. Balanced focuses the current primary task. Relaxed gives reading or media a longer rhythm. None shrink touch targets.

Mobile body and input text default to at least 16px. Helper labels may use 12/13px but cannot replace primary content. Chinese body leading is about 1.6 with zero tracking. Standardize size and radius by role without limiting the number of roles per screen. Edge-to-edge, full-bleed, full-width grouping, and floating toolbars are allowed; content may span the screen while text and actions avoid safe areas. See [depth](../visual-dna/depth.md) for grouping; gray canvas plus white cards is not required.

## 3. Touch, safe areas, and the soft keyboard

- HTML targets default to at least 48×48 CSS px; verify both dimensions. Verify native iOS at 44pt and Android at 48dp without mixing units.
- Icons may be smaller while their button boxes meet the target. Pseudo-element expansion must not overlap adjacent hit areas.
- Put frequent primary actions within thumb reach; separate infrequent destructive actions. Do not show a FAB and an equal-weight sticky bottom button together.
- Use `width=device-width, initial-scale=1, viewport-fit=cover`; never disable zoom.

```css
.mobile-action {
  min-height: var(--ui-control-touch);
  padding: var(--ui-space-3);
  padding-bottom: calc(var(--ui-space-3) + env(safe-area-inset-bottom, 0px));
}
.mobile-page {
  min-height: 100dvh;
  padding-inline: max(var(--ui-space-4), env(safe-area-inset-left, 0px))
                  max(var(--ui-space-4), env(safe-area-inset-right, 0px));
}
```

`env()` values depend on a real device; `viewport-fit` does not guarantee nonzero values. An HTML safe-area toggle only simulates padding and must be labeled as simulation. When the keyboard opens, allow the workspace to scroll and keep the active input and submit action reachable; do not lock body height. At 200% zoom and with long text, content wraps. Choose input type, `inputmode`, and `autocomplete` by task. Report real-device behavior as untested when it was not tested.

## 4. Navigation and modality

Bottom tabs suit multiple top-level destinations, usually 3–5, each with a label and current state that switches real content. Single-task tools may omit them. Collapsing large titles, sheets, and gesture back are optional.

Drill-down always has a visible return path and preserves list filters and scroll context; gestures are never the only route. Use a sheet for nearby context, a dialog for blocking confirmation, and a separate page for complex long tasks. Do not stack modal layers. Native `dialog` or equivalent must isolate the background, cycle Tab / Shift+Tab, close on Escape where appropriate, and restore trigger focus. If the trigger was deleted, move focus to an adjacent record or creation entry. Rapid toggling and reduced motion must not leave scroll locks behind.

## 5. States and semantic motion

Show applicable loading / empty / error / denied states honestly: loading restores content, errors retry, empty search clears filters, and denial explains the missing permission rather than pretending to unlock. Search, completion, and deletion update every count and view from one data source.

Press motion explains activation (100–150ms), sheet motion explains hierarchy (220–320ms), row background explains selection (100–150ms), and navigation indicators explain destination. Prefer transform and opacity; no decorative loops, global scale, or `transition: all`. Both system reduced motion and an in-product motion-off setting remove displacement and scale. Haptics supplement rather than replace visual or textual feedback. See [motion](../visual-dna/motion.md).

## 6. Performance and truthful information

Images have dimensions and load on demand; paginate or virtualize lists according to actual complexity. LCP < 2.5s, INP < 200ms, and CLS < 0.1 are targets, never claims without measurement. Avoid large blur by default; enable `will-change` only briefly when necessary.

Label medical records and recommendations as local simulation, identify sources and human responsibility. Media uses real local files and native events rather than fake playback. Without a backend, never report “synced to server.”

## 7. Verification

Use [mobile-review](../review/mobile-review.md) for affected target devices, long text and zoom, touch, focus, and real operations. Verify safe areas, soft keyboards, system back, gestures, and screen readers on the actual platform. For a new layout, check whether information was over-reduced and whether the primary action is comfortable to reach.
