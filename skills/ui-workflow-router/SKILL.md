---
name: ui-workflow-router
description: Route UI design work across web, Electron desktop, and mobile using mature design skills and platform guidance.
---

# UI Workflow Router

Use this skill for UI creation, redesign, or review when several community UI skills are available. It orchestrates them; it does not replace their specialist guidance or invent a parallel design system.

## First establish the source of truth

Before choosing a visual direction, inspect the request and the project. Preserve, in priority order:

1. Explicit user requirements and approved references.
2. The existing product's tokens, components, brand, and interaction conventions.
3. The target platform's native conventions and accessibility needs.
4. The selected design lead's direction.
5. Critique and polishing recommendations.

Use one design lead per surface. Do not load several broad design skills merely to vote on colors, type, radius, or layout.

## Route the work

Only invoke a named companion skill when it is installed and materially fits the task.

| Request | Design lead and support |
|---|---|
| New UI or substantial redesign across platforms | Use `ui-ux-pro-max` as the default design lead for product direction, design system, and supported web/mobile/desktop stacks. |
| Web UI or Electron renderer visual craft | Use `frontend-design` for visual composition and implementation. It may lead a web-only visual redesign when that is the task's main need; otherwise it follows the approved `ui-ux-pro-max` direction. Electron's renderer is a web surface, so keep this guidance focused on its visible UI. |
| Native iOS, Android, Flutter, or React Native UI | Use `ui-ux-pro-max` for the cross-platform design direction and consult the relevant official platform guidance (Apple Human Interface Guidelines or Android Material Design) for native conventions. Treat community mobile-specialist skills as optional experiments unless their maintenance and guidance have been verified. |
| Electron desktop interaction surfaces | Apply the web visual system to renderer content, then account for desktop UI behavior such as window layout, menus, keyboard access, context actions, and compact information density. Preserve the project's existing shell and OS conventions. |
| Screenshot-led design-system bootstrap | `screenshot-to-design-system` before selecting a design lead. Treat its output as evidence and tokens, not permission to clone another product's complete UI. |
| Runnable web UI requiring critique, audit, or final polish | Use `impeccable` on the rendered web surface, including an Electron renderer. Do not treat it as a native iOS/Android review skill. Run it early enough to correct the first draft and again before release when the change is material. |

If a named skill is unavailable, continue with the applicable project and platform evidence; never substitute an unrelated or low-confidence community skill just to fill a slot. This workflow covers UI/UX decisions and visible interface quality, not framework architecture or application security.

## Practical phases

Choose only phases that match the request:

1. **Direction** — identify audience, task, platform, visual intent, and constraints; select one design lead. When the visual direction is vague or expressed as a style word (for example, “高级” or “科技感”), read [Visual directions](references/visual-directions.md) and translate it into concrete decisions.
2. **Implementation** — use the stack and platform-specific specialist needed by the project.
3. **Verification** — render or run the affected UI. Check representative states, responsive widths or device classes, keyboard/focus behavior, loading, empty, error, and overflow states when relevant.
4. **Critique and polish** — for web-rendered surfaces, use `impeccable` for visual critique, accessibility, responsive behavior, and polish. For native mobile conventions, check platform guidance and review the actual target platform. Apply recommendations only when they respect the source-of-truth ordering above.

For small UI fixes, skip a new visual-direction exercise. Preserve the incumbent system, implement the specific change, and verify it.

## Platform checks

- **Web:** responsive layout, semantic controls, keyboard navigation, focus visibility, contrast, and reduced motion where animation is added.
- **Mobile:** touch targets, safe areas, keyboard behavior, navigation model, dynamic text, dark mode, and platform-specific interaction patterns. Check iOS and Android conventions separately when the app targets both.
- **Desktop/Electron:** window and title-bar layout, menus and context actions, keyboard access, hover and focus, resize behavior, drag/drop affordances, and information density. Judge Electron renderer visuals as web UI while preserving desktop interaction conventions.

## Working rules

- Choose at most one primary visual direction and one modifier for a surface. A style word is a starting constraint, not a reason to pile every matching effect into the interface.
- For a significant new surface, establish a clear focal point and supporting hierarchy before polishing components. Choose visual emphasis that fits the product—such as expressive type, imagery, data visualization, composition, material, or purposeful motion—and make the content density fit the task. Avoid a page that reads as a default component gallery; do not add decoration just to make it busier. For small fixes, preserve the existing visual hierarchy.
- Supporting skills may improve implementation or identify issues, but they must preserve the chosen design lead's direction and the user's explicit constraints. Treat critique as evidence to evaluate, not an automatic redesign brief.
- Do not treat a web media query as a mobile design strategy.
- Do not call a blur plus translucent background “Liquid Glass” without defining material hierarchy, legibility, states, and motion.
- Do not install skills, add dependencies, or copy a third-party design system unless the user asks.
- Prefer rendered evidence over a code-only claim that the UI is complete.
