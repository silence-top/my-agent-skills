# Motion: explain state changes

One admission rule: if a single sentence cannot explain what an animation communicates, remove it. Treat motion presets from the foundation as raw material that must pass §1 before entering the product.

## 1. Admission: one of four categories

| Category | What it explains | Examples |
|---|---|---|
| Hierarchy | What sits above what | A dialog expands from its trigger direction; a drawer enters from the side |
| Narrative | How state progresses | A stepper advances; a list item is inserted or removed |
| Feedback | Whether an action took effect | Button press, saved checkmark, copied confirmation |
| State | Data or view changed | Value update, refreshed filter results, expand/collapse |

Remove motion outside these categories: spinning logos, endlessly breathing buttons, untriggered floating, full-screen entrance sequences, and “premium” parallax. Writing `transition: all .3s` without defining before and after states does not constitute a transition design.

## 2. Duration and easing

```css
:root {
  --ui-duration-instant: 100ms;  /* Press feedback, color changes */
  --ui-duration-fast:    150ms;  /* Hover, focus */
  --ui-duration-normal:  220ms;  /* Expand/collapse, lightweight notice */
  --ui-duration-slow:    320ms;  /* Dialogs, drawers */

  --ui-ease-standard: cubic-bezier(0.2, 0, 0, 1);     /* General */
  --ui-ease-snappy:   cubic-bezier(0.16, 1, 0.3, 1);  /* Enter: quick start, soft stop */
  --ui-ease-exit:     cubic-bezier(0.4, 0, 1, 1);     /* Exit: slow start, quick leave */
}
```

- Enter slower, exit faster: exit duration is about 60–70% of enter duration.
- Greater distance needs more time: 8px movement may use 120ms; 400px movement may use 320ms.
- Avoid `linear` except for progress and skeleton shimmer; avoid `ease-in-out` for UI transitions.
- Avoid spring bounce in high-frequency workspaces. Evidence-based low-frequency feedback may use controlled spring behavior without delaying the action.
- A single business-UI animation stays below 400ms. When triggered hundreds of times a day, every extra 100ms is a tax.

## 3. Semantic behavior table

These are scenario defaults, not a quota each page must satisfy. Engineering requirements: interruptible, non-blocking, and the same final state and feedback after degradation.

| Semantic | Behavior | Duration | Easing | Interruption and fallback |
|---|---|---|---|---|
| Press | `translateY(1px)` or `scale(0.98)` | 80–120ms | standard | Reset on release; color state only under reduced motion |
| Hover | Background or border color change; no displacement | 100–150ms | standard | Return on pointer leave |
| Focus | Focus ring `opacity 0→1` | 100ms | standard | — |
| Row background | Default → semantic background for selection/completion | 150ms | standard | New state replaces old animation; text state remains |
| Tab/navigation indicator | Old position → new position | 150–220ms | snappy | Latest choice wins; under reduced motion, position instantly while URL/content become truth first |
| Dialog | `opacity 0→1` + `scale .96→1` | 220 / 150ms | snappy / exit | Fast close leaves no backdrop; focus and modal state never wait for animation |
| Drawer/sheet | `translateX(100%)→0` or slide up | 320 / 220ms | snappy / exit | Cancel unfinished animation |
| Expand/collapse | `grid-template-rows 0fr→1fr` + opacity | 200–260ms | snappy | Collapse cancels pending animation; reduced motion expands immediately and preserves focus |
| List insert | `opacity 0→1` + `translateY(-4px)→0` + fading highlight | 300ms | snappy | — |
| List delete | Height collapses + `opacity→0`; remaining rows move smoothly | 200ms | exit | — |
| Toast | Slide and fade in; reverse on exit | 180 / 140ms | snappy / exit | — |
| Progress interpolation | Previous real value → new value | 220ms | standard | New value takes over; pause on failure; never fabricate progress |
| Skeleton | Shimmer loop | 1400ms | linear | Static placeholder under reduced motion |
| Value change | One highlight flash | 400ms | standard | Highlight carries information and remains under reduced motion |

Explicitly forbidden: list-row hover displacement or scale; card hover with 8px lift and expanding shadow; whole-row table scale; whole-screen route slides; infinite loops except skeletons; autoplay carousels; full-screen first-load entrances.

## 4. Performance constraints

```css
.ui-anim {
  transition: transform var(--ui-duration-fast) var(--ui-ease-standard),
              opacity var(--ui-duration-fast) var(--ui-ease-standard);
}
```

- Prefer `transform` and `opacity`. Color transitions, bounded content expansion, and real data-shape length changes are explicit exceptions; scope and measure dimension changes.
- Expand height with `grid-template-rows: 0fr → 1fr` or bounded `max-height`; animate shadow through the opacity of a `::after` layer.
- Add `will-change` only immediately before motion and remove it afterward.
- Do not drive animation with a `scroll` listener; use `IntersectionObserver` or CSS `animation-timeline`.
- In high-frequency workspaces, no more than two areas should move prominently at once.
- Frame budget: maintain 60fps on a five-year-old office computer. Choose conservatively when measurement is unavailable.

## 5. Reduced motion (required)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The state change must remain perceivable after degradation: replace displacement/scale with opacity or immediate state plus highlight. JavaScript-driven animation (Vue Transition, WAAPI, GSAP) must read `matchMedia('(prefers-reduced-motion: reduce)')` and short-circuit.

```vue
<script setup lang="ts">
import { shallowRef, onMounted, onUnmounted } from 'vue'

const reduce = shallowRef(false)
let mq: MediaQueryList | undefined
onMounted(() => {
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduce.value = mq.matches
  mq.addEventListener('change', onMq)
})
onUnmounted(() => mq?.removeEventListener('change', onMq))
function onMq(e: MediaQueryListEvent) { reduce.value = e.matches }
</script>

<template>
  <Transition :name="reduce ? 'fade' : 'slide-up'">
    <slot />
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 150ms var(--ui-ease-standard); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active { transition: opacity 220ms var(--ui-ease-snappy), transform 220ms var(--ui-ease-snappy); }
.slide-up-leave-active { transition: opacity 150ms var(--ui-ease-exit), transform 150ms var(--ui-ease-exit); }
.slide-up-enter-from { opacity: 0; transform: translateY(8px); }
.slide-up-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
```

## 6. Loading and placeholders

| Scenario | Correct | Incorrect |
|---|---|---|
| Initial table | Skeleton rows matching real row height and column widths | Centered spinner |
| Partial refresh | Local table overlay plus lightweight indicator while retaining old data | Whole-page loading that removes all data |
| Button submission | Inline button loading with stable width | Global overlay |
| Long task | Show percentage only with real progress; otherwise show stage and cancellation | Invented progress and remaining time |
| Image | Fixed aspect-ratio placeholder to avoid CLS | Layout expands after load |

## 7. Self-check

| # | Check | Criterion |
|---|---|---|
| 1 | Motivation | Every animation belongs to hierarchy, narrative, feedback, or state |
| 2 | Properties | Prefer `transform` / `opacity`; exceptions have scope and performance evidence |
| 3 | Duration | Single motion ≤ 400ms; exit < enter |
| 4 | Easing | Comes from tokens; no arbitrary `ease` |
| 5 | Fallback | Alternative presentation exists under `prefers-reduced-motion` |
| 6 | Load | Prominent simultaneous motion ≤ 2 in high-frequency workspaces |
| 7 | Loops | No infinite loops except skeleton shimmer |
| 8 | Cleanup | JavaScript animations clean up on component unmount |

Verify through real click, keyboard, and media events and wait for explicit completion signals. Class presence or fixed delays do not prove success. Test normal motion, closing behavior, and system reduced motion separately.
