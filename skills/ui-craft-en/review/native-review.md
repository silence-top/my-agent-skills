# Native Review: real application or website in a window?

Use with [visual review](visual-review.md). This applies to Electron / Tauri desktop shells and native or cross-platform iOS / Android implementations. Real system-integration behavior proves native feel; skinning does not. Source rules live in [Electron](../platforms/electron.md), [macOS](../platforms/macos.md), [Windows](../platforms/windows.md), [iOS](../platforms/ios.md), and [Android](../platforms/android.md).

## 1. Desktop-shell checklist

Answer Yes / No / Not applicable / Untested for each item. Fix No and include Untested in delivery notes.

| # | Check | Criterion |
|---|---|---|
| 1 | Window | Minimum size exists; position and size persist; resizing recomposes layout instead of scaling proportionally |
| 2 | Title bar | System or custom is explicit; custom has a draggable region and platform-correct controls, macOS left and Windows right |
| 3 | Sidebar | Collapsible and resizable with persistent state; selection matches platform, rounded block on macOS and leading accent on Windows |
| 4 | Toolbar | Frequent current-context actions have icon, tooltip, and shortcut label |
| 5 | Context menu | Core objects have object-specific menus; browser default menu does not appear |
| 6 | Shortcuts | Frequent actions follow platform conventions; labels use symbols on macOS and text on Windows; IME composition is not intercepted; a searchable shortcut panel exists |
| 7 | Tray / menu bar | Provided only when background operation matters; close-to-tray differs clearly from quit |
| 8 | Drag and drop | Accepts system files with a target state; in-app dragging has placeholder and cancellation |
| 9 | Native dialogs | Open/save uses system dialogs; unimplemented capabilities do not appear as disabled impostors |
| 10 | Focus | Selection grays when the window loses focus; previous focus returns; input and playback state remain correct |
| 11 | Hover | Critical actions are not hover-only; touch laptops remain usable |
| 12 | Selection | Lists support Shift / Ctrl(Cmd) multi-select, arrows, Enter, and Delete; control labels are not selectable |
| 13 | System material | Vibrancy / Mica / Acrylic has a solid fallback when transparency is disabled; high-risk information rests on solid |
| 14 | Platform differences | Product structure stays consistent; only window controls, menus, and shortcut labels adapt by platform |

## 2. Mobile-native checklist

| # | Check | Criterion |
|---|---|---|
| 1 | Units | Native acceptance uses iOS 44pt and Android 48dp without mixing them with CSS px |
| 2 | Back | iOS back gesture is not the only entry; Android system Back closes each layer correctly |
| 3 | System text | Dynamic Type / sp at maximum supported size wraps without clipping |
| 4 | System controls | Navigation bar, tab bar, sheet, and alert use system controls or document the reason for custom drawing |
| 5 | System material | iOS navigation and tab materials use system capabilities; Android defaults to solid |
| 6 | Platform habits | Do not mix conventions: iOS does not combine FAB and bottom navigation; Android does not rely on an iOS back arrow as its only Back path |
| 7 | Screen reader | VoiceOver / TalkBack focus order and restoration are correct |
| 8 | Haptics | Haptics supplement visible and announced feedback |

## 3. Acceptance boundaries

| Environment | Can prove | Cannot prove |
|---|---|---|
| Browser preview | Layout, keyboard principles, focus loop, hit-area dimensions | Window, menu, tray, auto-update, system clipboard, native file permissions, system material |
| Packaged desktop app | Every desktop item above | — |
| iOS / Android emulator | System Back, system text, system-control appearance | Real-device haptics, some actual safe-area values, performance |
| Real device | All applicable items | — |

HTML controls default to 48×48 CSS px. Accept native iOS at 44pt and Android at 48dp; do not treat those units as CSS px. Safe-area `env()` depends on a device, so desktop-browser padding simulation must be labeled simulated. Without a real-device test, do not claim keyboard and bottom gesture-bar verification.

When packaged-app or real-device acceptance was not performed, list the Untested items in delivery notes instead of presenting browser preview as native acceptance. The user confirms visual personality, rhythm, and high-risk business meaning in the interactive artifact.
