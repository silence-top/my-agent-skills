# Electron: a shell app is not a website in a window

These rules apply to Web-technology desktop shells such as Electron and Tauri. Native feel comes from window and system-integration behavior, not skinning. See [macOS](macos.md) and [Windows](windows.md) for platform differences. Use Windows as a Linux baseline while letting the desktop environment control caption-button placement; the system title bar is the safest choice. Keep product structure consistent and adapt window controls, menus, and shortcut labels by platform.

## 1. Input shapes structure

Desktop productivity means keyboard-heavy input, long sessions, multiple windows, and large screens. Structural decisions include resource navigation / main workspace / inspector, a command entry, and collapsible secondary regions. Do not copy mobile bottom tabs for every tool, simulate native permissions, or simply wrap a website.

The main workspace receives most available area; navigation and inspector serve it. When a secondary region collapses, retain an explicit reopening control and restore focus. Collapsing must not clear input. Define a product minimum window size instead of hiding failures behind horizontal scrolling.

## 2. Thirteen native-feel checks

| Item | Native-feel criterion | Website-like symptom |
|---|---|---|
| Window | Minimum size exists; last position/size persist; multiple windows have clear roles | Fixed single window with horizontal scrolling when narrow |
| Title bar | Explicitly choose system or custom; custom uses a `-webkit-app-region: drag` region and platform-correct controls | Top region is a Web navbar with no draggable area |
| Sidebar | Collapsible and resizable with persisted state; selection matches platform | Fixed-width navigation menu |
| Toolbar | Holds frequent current-context actions with icon, tooltip, and shortcut label | Row of equal-weight buttons or no toolbar |
| Context menu | Core objects have menus containing only object-relevant actions | Browser default menu or no response |
| Keyboard shortcut | Frequent actions follow platform conventions; shortcuts do not intercept IME composition; searchable shortcut panel exists | Mouse-only path; `Ctrl+K` swallows Chinese composition |
| System tray/menu bar | Exists only when background operation is meaningful; closing-to-tray differs clearly from quit | Window close exits while UI claims background operation |
| Drag and drop | Accepts system files with a clear target state; in-app dragging has placeholder and cancellation | File picker is the only path |
| Window resize | Layout recomposes with aspect ratio; three regions collapse rather than compress | Canvas scales proportionally or elements overlap |
| Native dialog | Open/save uses system file dialogs; destructive confirmation may use a system dialog | Hand-built file picker |
| Focus | Selection grays when unfocused; prior focus returns; input and playback state remain correct | Selection stays bright and restored focus is lost |
| Hover | Hover provides hints and light feedback; critical actions are not hover-only; touch laptops remain usable | Critical buttons appear only on hover |
| Selection | Lists support Shift/Ctrl(Cmd) multi-select, arrow movement, Enter open, Delete remove; body text is selectable while control labels are not | Mouse-only single selection; all UI text is selectable |

## 3. System integration: expose only implemented capabilities

Tray, menu bar, file drag-and-drop, native file dialogs, system notifications, clipboard, auto-update, and deep links are either genuinely connected or absent. Do not show disabled placeholders for unimplemented features.

## 4. Keyboard, commands, and focus

Provide an explicit Command button alongside shortcuts. The command palette is searchable, navigates with arrows, executes with Enter, closes with Escape, and restores trigger focus. Tab order follows reading order. Modals use native `dialog` or equivalent inert background plus focus loop. After list deletion, focus an adjacent item or creation entry. Put infrequent destructive actions in a clearly named menu or confirmation rather than beside the primary execution action.

## 5. Viewport and scaling

| Window | Structure |
|---|---|
| 1920×1080 | Give more area to the workspace; do not stretch controls indefinitely |
| 1440×900, 1280×800 | Place primary task, queue, and context together |
| 1024×768 | Inspector may collapse while critical state remains |
| 768×1024 | Transitional layout explicitly merges or drills into regions |

True two-dimensional data tables may scroll inside a labeled local container; the whole window must not overflow horizontally. At 200% system scaling, controls wrap and the workspace may become step-based.

## 6. Unsaved state, files, and privacy

Dirty state comes from real data changes and clears only after successful save. Use a system dialog before closing a dirty window. Local paths and recent-file lists respect system privacy settings. Release Blob URLs and temporary files promptly. Provide distinct recovery paths for undecodable files, clipboard denial, and permission denial.

## 7. Materials

Use native capabilities for macOS vibrancy and Windows Mica/Acrylic when available; see [frosted](../materials/frosted.md). A hand-drawn Web equivalent is only an approximation and needs a solid fallback when transparency is disabled. High-risk information always rests on [solid](../materials/solid.md).

## 8. Verification boundary

Browser preview can validate layout and keyboard principles but cannot prove window, menu, tray, auto-update, system clipboard, or native file-permission behavior. Native feel is demonstrated by real system integration. If the packaged app was not tested, disclose the boundary per [native review](../review/native-review.md).
