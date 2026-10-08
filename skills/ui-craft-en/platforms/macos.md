# macOS: immersion, unified material, keyboard first

See [Electron](electron.md) for shared desktop-shell behavior. This file covers macOS differences. macOS favors immersion and unified material: the window, sidebar, and toolbar feel continuous, with hierarchy expressed through vibrancy and fine boundaries rather than hard card borders.

## 1. Window and title bar

- Traffic-light controls (close, minimize, zoom) sit at the top-left. With a custom title bar, preserve their position and target sizes, or let the system draw them through a mode such as `titleBarStyle: hiddenInset`.
- The title bar may merge with the toolbar. The merged region is draggable except where controls sit.
- Full screen is a system behavior through the green button; do not add a custom duplicate.
- Define a product-specific minimum window size. Recompose as the aspect ratio changes rather than scaling the canvas proportionally.

## 2. Sidebar and material

- Use the system sidebar material/vibrancy so desktop wallpaper tone can influence it. A Web approximation is documented in [frosted](../materials/frosted.md) and must not claim equivalence.
- Sidebar selection uses a rounded background and weight, not a left color bar, which is more typical of Windows/Web.
- Keep the main workspace and inspector solid; material belongs to the shell layer. High-risk information always rests on solid.
- Follow system appearance for dark mode. Shadows weaken in dark mode; distinguish layers with necessary edges.

## 3. Menu bar and context menu

- The application menu bar at the top of the screen is the complete entry point for core actions: File, Edit, View, Window, Help, with shortcut labels.
- Context menus contain actions relevant to the current object rather than copying the toolbar.
- Preferences/Settings uses `Cmd+,` and lives under the application menu.

## 4. Shortcuts

- Use `Cmd` and display symbols `⌘ ⇧ ⌥ ⌃` in the order `⌃⌥⇧⌘`.
- Follow conventions: `Cmd+W` close window, `Cmd+Q` quit, `Cmd+,` settings, `Cmd+F` find, `Cmd+Z/⇧Z` undo/redo.
- Do not intercept shortcuts during IME composition. Provide a searchable shortcut panel.

## 5. Typography

Use SF Pro plus PingFang SC. A 13px body is common in native macOS controls; use 14–16px for sustained reading. See [typography](../visual-dna/typography.md) §1.

## 6. System integration

Menu-bar items (`NSStatusItem`), Dock badges, Notification Center, system file dialogs, Finder drag-and-drop, and clipboard integration appear only when implemented. Do not simulate missing capabilities. It is expected for selection to gray when a window loses focus; do not force it to remain highlighted.

## 7. Do not

- Put window controls on the right or stack Windows-style hard-bordered cards.
- Build a custom title bar without a draggable region.
- Label shortcuts with `Ctrl`.
- Claim browser preview verified vibrancy, the menu bar, or full-screen behavior. If the packaged app was not tested, state the boundary per [native review](../review/native-review.md).
