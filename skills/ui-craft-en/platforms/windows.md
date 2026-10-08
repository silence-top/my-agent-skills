# Windows: efficiency, clear boundaries, Ctrl shortcuts

See [Electron](electron.md) for shared desktop-shell behavior. This file covers Windows differences. Windows favors efficiency and clear boundaries: regions have visible divisions, controls have defined rectangular outlines, and density may be higher.

## 1. Window and title bar

- Caption controls (minimize, maximize, close) sit at the top-right, roughly 46px wide each in a 32px row. With a custom title bar, use a system overlay such as `titleBarOverlay` so Windows draws them, or precisely preserve their position and hit areas.
- The title bar is draggable except where controls sit. Double-clicking it maximizes the window.
- Snap Layouts come from hovering the system maximize button. Custom buttons may remove this capability and require disclosure.
- Define a product-specific minimum window size. Recompose as the aspect ratio changes rather than scaling the canvas proportionally.

## 2. Boundaries and materials

- Separate regions with a 1px `--ui-stroke` border or a clear background difference; see [solid](../materials/solid.md). Do not rely on large shadows.
- Mica and Acrylic are optional system materials. Mica carries the window background; Acrylic suits temporary flyouts. Provide a solid fallback when Windows transparency effects are disabled. Omitting them is a valid choice.
- Sidebar selection commonly uses a left accent bar plus background.
- Follow system dark mode. In forced-colors/high-contrast themes, boundaries must remain visible.

## 3. Menus and context menus

- Application menus live inside the window, below the title bar or behind a menu button; Windows has no screen-level app menu bar.
- Context menus are frequent Windows entry points and cover all actions relevant to the current object. `Shift+F10` and the Menu key open the equivalent menu.
- Settings may use `Ctrl+,` or a gear entry.

## 4. Shortcuts

- Use `Ctrl` and text labels such as `Ctrl+Shift+S`, not symbols.
- Follow conventions: `Alt+F4` close window, `Ctrl+W` close tab, `F2` rename, `F5` refresh, `Ctrl+Z/Y` undo/redo, and `Alt` activates menu mnemonics.
- Do not intercept shortcuts during IME composition. Provide a searchable shortcut panel.

## 5. Typography

Use Segoe UI plus Microsoft YaHei. YaHei may look weak at 12–13px when ClearType is off or display scaling is fractional. Start body copy at 14px and measure 12px helper labels. Weight 500 may fall back to 400 or 700 in YaHei; prefer 400 and 600. See [typography](../visual-dna/typography.md) §1.

## 6. System integration

Taskbar icons, jump lists, Windows toasts, system file dialogs, Explorer drag-and-drop, clipboard, and tray icons appear only when implemented. Do not simulate missing capabilities. It is expected for title bars and selection to gray when the window loses focus.

## 7. Do not

- Put caption controls on the left or copy macOS rounded selection and vibrancy sidebar.
- Replace the system title bar, lose Snap Layouts, and fail to disclose it.
- Label shortcuts with `⌘`.
- Claim browser preview verified Mica, Snap, or taskbar integration. If the packaged app was not tested, state the boundary per [native review](../review/native-review.md).
