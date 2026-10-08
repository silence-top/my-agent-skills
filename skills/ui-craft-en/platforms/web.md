# Web: business systems and high-frequency workspaces

Web input includes mouse, keyboard, browser navigation, and multiple tabs. Structural decisions include stable URLs and filters, semantic tables, and an explicit primary workspace. Do not copy native window controls, fake system permissions, or occupy reserved browser shortcuts. The dimensions and skeleton below are defaults (SHOULD) for admin and operations systems, not universal templates for media, tools, or editorial pages. Engineering baselines are MUST requirements.

## 1. Page structure

Workspace is only one candidate. Compare it with List-first and Search-first first; see [depth](../visual-dna/depth.md) §5. Do not add a top bar, sidebar, page header, or pagination unless the task needs it.

```text
┌─ Top bar: brand / global search / environment / user ────────┐
├─ Sidebar ─┬─ Header: title + breadcrumb + primary actions ───┤
│           │  Filters, collapsible                            │
│           │  Toolbar: bulk actions / columns / density       │
│           │  Content: table / form / board                   │
│           │  Pagination / sticky action bar                  │
└───────────┴──────────────────────────────────────────────────┘
```

| Region | Size | Rule |
|---|---|---|
| Top bar | 48–56px high | Global items only; no page actions |
| Sidebar | 200–240px expanded / 56–64px collapsed | Depth ≤ 3; use secondary navigation instead of four-level indentation |
| Content | 16–24px horizontal padding | Data workspaces use available width; reading and forms use task-appropriate limits |
| Page header | 48–64px high | Title left, primary actions right; ≤ 3 primary actions, remainder under More |
| Sticky action bar | 56–64px high | Use when valuable for long tasks; reserve scroll and safe-area space so it does not cover content |

Responsive baseline: design at 1280×800; 1024 must remain usable. The sidebar collapses to an icon rail with accessible names or an openable panel; text must not be squeezed into vertical writing. Below 1024, reassess the task: move low-frequency properties into details, split editing into steps, and allow local horizontal scrolling only for genuine comparison tables. Build mobile only for real mobile scenarios; do not shrink the desktop page into a phone. See [mobile](mobile.md) and the viewport matrix in [responsive review](../review/responsive-review.md).

## 2. Tables

| Density | Row height | Font size | Padding | Use |
|---|---:|---:|---:|---|
| Compact | 36px | 13px | 8px 12px | Reconciliation, logs, batch processing |
| Default | 44px | 14px | 10px 16px | Most list pages |
| Comfortable | 52px | 14px | 14px 16px | Avatars or multiline secondary information |

High-frequency tables provide a density control and remember the choice. Row height is guidance, not a clipping ceiling. In touch mode, targets still reach at least 48×48 CSS px.

Column rules:
- Use semantic widths: IDs are fixed and tabular, names get the widest flexible space, and status/actions remain narrow and fixed.
- Align text left; align numbers and currency right with `tabular-nums`; keep status alignment consistent within a table.
- Keep headers sticky with `position: sticky; top: 0` and `--ui-z-sticky`. When the first column is fixed, use `box-shadow` or `border-right` to express the fixed layer.
- Fix the action column to the right. Keep ≤ 3 buttons in a cell and place the rest under More. Icon buttons require `aria-label`.
- Fix the selection column left at 40–48px. Header select-all supports the indeterminate state.
- Default to one-line truncation. Only columns that must be read in full may use a two-line `-webkit-line-clamp`.
- Sorting cycles ascending → descending → unsorted and uses both arrow and color indicators.

| State | Presentation |
|---|---|
| Loading | Skeleton rows match real row count and column widths; do not use one centered spinner |
| Empty, first use | Explain what the table contains and provide a primary action |
| Empty after filtering | Explain the active filters and provide `Clear filters` |
| Error | Explain the failure and provide `Retry`; retain the header instead of blanking the page |
| No permission | Explain the missing permission and request path; do not show an empty table |

Pagination defaults to 20 rows with 20 / 50 / 100 options. Show `1,284 total` only when the total is trustworthy; otherwise show the loaded count. After selection, show `3 selected`. Collapse more than seven page numbers with an ellipsis. For large datasets use Load more or virtual scrolling and show how many rows are loaded.

## 3. Forms

| Item | Rule |
|---|---|
| Label position | Top-aligned by default; left-align only when every label is short and vertical space is constrained |
| One or two columns | One column by default; use two only for paired fields such as date ranges or province/city, with equally sized labels |
| Grouping | More than eight fields require groups with headings and separators |
| Control width | Match expected content: name 160px, address 100% with max 480px, date 160px; do not make everything 100% |
| Spacing | 8px label-to-control, 16–20px between fields, 32px between groups |

Validate on blur and submit, not on every keystroke. For Chinese input, validate after `compositionend`; see [typography](../visual-dna/typography.md) §5. Reserve at least one message line below each field with `min-height`, not fixed height:

```css
.field__msg {
  min-height: calc(var(--ui-text-caption) * var(--ui-leading-snug));
  margin-top: var(--ui-space-1);
  font-size: var(--ui-text-caption);
  line-height: var(--ui-leading-snug);
  color: var(--ui-text-muted);
}
.field.is-error .field__msg { color: var(--ui-danger); }
```

In a horizontal filter bar aligned with `align-items: flex-end`, an error may increase one field's height and shift the row. Only in this controlled layout may messages be absolutely positioned while the container reserves space, such as `.filter-bar { padding-bottom: var(--ui-space-6); }`. Return messages to document flow on narrow screens or with long text. State what is wrong and what is expected; do not repeat a value already visible in the control. Never clip an error.

- Mark required fields with `*` in one consistent position and explain the mark at the top of the form.
- After failed submission, scroll to and focus the first invalid field, with a summary at the top.
- Prefer `readonly` when users should copy, focus, and submit a value. `disabled` values are not submitted or reachable by Tab.
- Confirm dangerous actions with the specific quantity and object named.
- Long forms, over 15 fields or one viewport, need draft saving or leave confirmation. Disable submit while pending and use an idempotency key.

## 4. Detail pages

Use description lists with label and value, not read-only inputs assembled into a page. Group consistently with forms; group headings are 14–16px / 600. Give long text its own block at line-height 1.75 and max-width around 42em. A critical-field summary may sit first without another enclosing card. Timelines use three parts: tabular time, actor and action, result.

## 5. Dialogs, drawers, and floating layers

| Scenario | Use |
|---|---|
| A decision is required before continuing | Modal |
| Preserve context while viewing and editing | Drawer, 480–720px wide |
| Lightweight supplementary information | Popover or tooltip |
| Long form | Separate page or full-screen drawer, not a dialog |

- Use dialog width tiers `480 / 640 / 800 / 1000px`, not arbitrary widths.
- Use the project's overlay color. Blur is off by default; see [frosted](../materials/frosted.md) for material choice.
- Trap focus, close with `Escape`, allow overlay click only when safe, and restore focus to the trigger after closing.
- Do not open a dialog from another dialog. Convert the flow into steps inside one dialog. Use a verb phrase as the title.

## 6. Feedback levels

| Type | Use | Duration |
|---|---|---|
| Inline message | Related to the current field | Persistent |
| Toast | Operation result that needs no action | 2–3s; errors 4–5s |
| Notification | System-level information requiring awareness or action | Manual dismissal |
| Banner | Environment, read-only mode, or delayed data | Persistent |

Use inline feedback for fields, a form-top summary for the form, toast for an operation, and notification for system-level events. Show no more than three toasts, make them dismissible, and keep them away from primary actions. Announce asynchronous results with `aria-live="polite"`. Do not show a dialog for every success.

## 7. Navigation, permission, and failures

- Keep hierarchy ≤ 3. Beyond that, use breadcrumbs or tabs. Mark the current item with accent, background, and weight rather than color alone. Persist sidebar collapse. Tabs represent different views of one entity, not the main menu; more than eight tabs must scroll.
- No permission is not 404. Explain the missing permission and request path. After session expiry, return to the original page and preserve query state. Explain stale or offline data in a top banner and disable unreliable actions. On API failure, retain the previous data and label it as possibly outdated.

## 8. Keyboard, commands, and focus

Provide an explicit Command button alongside shortcuts. Intercept `Command/Ctrl+K` only when the product truly needs it and IME composition is inactive. Do not override refresh, back, copy, or other browser semantics. The command list is searchable, uses arrows for movement and Enter to execute, closes with Escape, and restores trigger focus.

Tab order follows reading order; do not repair DOM order with positive `tabindex`. Use native `dialog` or equivalent inert background plus focus loop. Rapid open/close remains interruptible and leaves no inert state, scroll lock, or transition residue. After deleting a list item, focus an adjacent item or the creation entry. Filtering does not steal focus to results; announce count changes through `aria-live`. Put infrequent destructive actions in a clearly named menu or confirmation rather than beside the primary execution action.

## 9. Unsaved state, files, and privacy

Dirty state comes from real data changes and clears only after successful save. Register route guards in practice. Use `beforeunload` for browser exit and explain that browsers may ignore custom text. Restoring input does not mean it was saved to the server. Local tools state that files remain in the browser and release Blob URLs promptly. Provide distinct recovery for selection failure, decoding failure, and clipboard denial. Do not hide failure behind a success toast. Clearly label sample data as locally simulated.

## 10. Four commonly skipped scenarios

| Scenario | Core rules |
|---|---|
| Multi-step wizard | ≤ 5 steps with verb-phrase names; validate each step independently; Back preserves content without validation; completed steps may be revisited; auto-save drafts for more than three steps or 20 fields; submission failure opens the failing step; show `Step 2 of 4` |
| Editable table | Enter editing through an explicit Edit action, not by turning any clicked cell into an input; validate on blur and summarize errors at the row start; prefer row-level save; `Enter` submits, `Escape` cancels, `Tab` advances; do not use optimistic update by default; cap editable rows, such as 200, then use export → edit → import |
| Tree structure | Indent 16–20px per level; beyond five levels use breadcrumb drill-down; expand to level two by default and remember state; support indeterminate checkboxes and Select this level only; search expands matching paths and explains scope; virtualize over 500 nodes; use `role="tree"`, `treeitem`, `aria-expanded`, and `aria-level` |
| Attachment upload | State file types and size limits before selection; each file has independent progress and state; failures retry and pending uploads cancel; failed preview falls back to download; confirm deletion of uploaded files; validate again on the server; a drop zone has a keyboard-equivalent button |

## 11. Self-check

| # | Check | Criterion |
|---|---|---|
| 1 | Four table states | Supported loading / empty / error / no-permission states recover correctly |
| 2 | Table dimensions | Density control exists and row height comes from tokens |
| 3 | Numeric columns | Right-aligned with `tabular-nums` |
| 4 | Form labels | Top-aligned, required marks consistent, placeholder not used as label |
| 5 | Validation timing | Blur + submit; Chinese after composition ends |
| 6 | Dangerous actions | Confirmation states quantity and consequence |
| 7 | Dialog | Focus trap, Escape, overlay policy, tiered width |
| 8 | Feedback levels | Inline / toast / notification / banner are correctly assigned |
| 9 | Permission state | Explanation and request path exist; no fake 404 |
| 10 | Wizard | Independent step validation; submission failure finds the failing step |
| 11 | Editable table | Explicit edit entry, row-level save, unsaved-change interception |
| 12 | Tree | Indeterminate select-all, matching paths expand, > 500 nodes virtualized |
| 13 | Upload | Limits stated before selection, retry available, drop zone keyboard-reachable |
| 14 | Field message space | Minimum message space reserved; long errors and text zoom neither clip nor overlap |
| 15 | Keyboard | Explicit command entry, browser shortcuts preserved, focus loop complete |
