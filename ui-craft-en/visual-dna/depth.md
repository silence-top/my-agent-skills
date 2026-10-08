# Depth: surfaces, spatial rhythm, scale, and composition

Depth is not a shadow count. It is whether users can immediately understand what sits above what and what matters more. Four concepts: surface role answers “what does this content rest on?”, rhythm answers “what belongs together?”, scale answers “what is seen first?”, and composition answers “what relationship organizes the page?” For solid, translucent, frosted, and liquid-glass materials, see [materials](../materials/solid.md).

## 1. Six surface roles

Surface roles describe content and interaction; they are not six nested containers. Default ordering: content/alignment → spacing → tone → necessary boundary → real overlay. Canvas and Surface alone can support an excellent list.

| Role | Token | Contrast | Border / shadow / blur / radius | Interaction |
|---|---|---|---|---|
| Canvas | `--ui-canvas`, page carrier | Stable base for reading regions | No border, shadow, blur, or container radius | No meaningless hover response |
| Surface | `--ui-surface`, primary work/reading area | Compliant text contrast; need not strongly contrast with Canvas | Group with spacing first; use a one-sided boundary only when needed; no default shadow | Editable regions retain focus state |
| Elevated | `--ui-surface-elevated`, local overlap or secondary layer | Distinguishable from the layer below | Necessary edge or low shadow; blur off by default | Selection and hover do not change layout |
| Floating | `--ui-surface-floating`, menus, dialogs, sheets | Distinguishable from both backdrop and text | Shadows for real overlays; optional blur with fallback; shape follows platform | Focus isolation, Escape, and focus restoration |
| Focus | `--ui-surface-focus`, current task or selected region | Light brand surface plus readable text; never color alone | Focus ring or indicator bar; no extra container required | Keyboard focus and persistent selection remain distinguishable |
| Highlight | `--ui-surface-highlight`, scarce primary action or key marker | Pair with `--ui-text-on-highlight`; measure contrast | No default glow; avoid filling body-copy regions with brand color | The sole primary action has pressed, disabled, and outcome feedback |

Dark mode does not mean adding borders to every surface. Use content contrast, tone, and real hierarchy; add an edge only when shadows disappear against a dark base. Text on gradients, images, or translucent surfaces with an indeterminate background requires manual review and never auto-passes.

## 2. Five-level spatial rhythm

| Role | Token | Default | Use |
|---|---|---|---|
| Micro | `--ui-rhythm-micro` | 4px | Internal icon/label relationship |
| Small | `--ui-rhythm-small` | 8px | Closely related controls and inline content |
| Medium | `--ui-rhythm-medium` | 16px | Internal organization of one group |
| Large | `--ui-rhythm-large` | 32px | Separation between tasks or sections |
| Hero | `--ui-rhythm-hero` | 64px | Major transition in media, editorial, or presentation pages |

These values express relationships, not identical padding for every block. A compact workbench may never use Hero; a presentation page cannot use Hero spacing between every group. Calculate touch targets separately from content spacing. Prefer the 4/8/12/16/20/24/32/40/48/64px scale inside a page.

## 3. Six-level visual scale

| Role | Token | Default | Boundary |
|---|---|---|---|
| Micro | `--ui-scale-micro` | 12px | Non-primary helper labels; never mobile body text |
| Small | `--ui-scale-small` | 13px | Secondary desktop annotation |
| Base | `--ui-scale-base` | 16px | Sustained reading and mobile input |
| Large | `--ui-scale-large` | 24px | Section or current task |
| Hero | `--ui-scale-hero` | 38px | Primary page object or conclusion |
| Display | `--ui-scale-display` | 48px | Business-meaningful display title; optional, not a quota |

## 4. Information density

Desktop table row heights are 36 / 44 / 52px for compact / default / loose. On mobile, Compact / Balanced / Relaxed distinguish essential summaries, primary-task focus, and reading/media rhythm. HTML touch targets remain at least 48×48 CSS px in all modes.

Density is not shrinking every element. Remove, defer, summarize, or drill into nonessential first-screen content before reducing dimensions; never remove critical risk or permission information. Standardize shapes by object role; there is no global quota of three radii. Changing a background, border, or font size alone does not prove visual refinement.

## 5. Composition decision tree

Ask what the user primarily does: detect trends → Dashboard; continuously process objects → Workspace; transform input → Tool; find objects → Search-first; repeatedly execute commands → Command-oriented; consume content → Feed / Media-first / Editorial; inspect one object → Detail; submit information → Form-first; enter a focused experience → Immersive; scan homogeneous records → List-first.

Use Bento only when related modules truly need area to express weight. Four content blocks do not automatically justify Bento.

## 6. Composition catalog

The hierarchy column defines primary-to-secondary order. Each composition is a relationship, not a fixed component tree.

| Composition | Suitable for | Information hierarchy | Primary focus | Desktop | Mobile | Counterexample |
|---|---|---|---|---|---|---|
| Dashboard | Detecting anomalies and trends | Key conclusion → primary visualization → supporting data → traceable detail | Anomalous trend or main metric | Main chart dominates; supporting metrics form a narrow band | Conclusion and anomaly list first; charts expand on demand | Do not show four equal KPI cards without interpretable metrics |
| Workspace | Processing a current object | Queue → current workspace → evidence/context → secondary settings | Current object and its evidence | Queue / main area / inspector; secondary regions collapse | Queue → detail → confirmation drill-down | Do not force a one-time form into three columns |
| Tool | Transforming input | Input → transformation → result → history/help | Input-output relationship | Adjustable split comparison | Input and result become steps; execution remains reachable at bottom | Do not use a welcome hero that pushes work below the fold |
| Feed | Content stream or activity | Featured item → compact entries → extended content | Featured content | Main feed plus low-weight side region | Compact progressive content after the feature | Not every entry needs a giant card |
| Editorial | Features and reports | Claim → main evidence → explanation → supplementary material | Proportion between title and key evidence | Reading column plus sidenotes; charts may span full width | Conclusion before evidence; sidenotes collapse nearby | Do not format frequent management actions as a magazine article |
| Detail | Records, reports, media detail | Core object → key properties → secondary sections → related actions | Object, title, or primary media | Place key properties beside evidence | Core summary above the fold; secondary detail drills down | Do not wrap every field in a card |
| Media-first | Music, video, imagery | Media → playback context → queue → metadata | The content itself | Primary media plus queue | Full-bleed content, mini-player, thumb-reachable playback | Show a clear empty state when media is absent; do not fake a cover |
| Form-first | Data entry and approval | Current step → required fields → validation → submission → optional data | Current step and completion progress | Reasonable reading width; supporting rules to the side | Progressive disclosure, visible keyboard, preserved input | Do not place unrelated fields in two columns merely for symmetry |
| Immersive | Playback, exhibitions, focus | Primary content → minimal context → key action | Full-bleed content or focused workspace | Preserve exit and critical state | Edge-to-edge with controls inside safe areas | Alerts and critical state cannot disappear |
| Bento | Related capabilities or data | Primary module → complementary modules → supporting modules | Semantically highest-weight module | Unequal grid expresses priority | Reselect one primary module; compact the rest | An equal-card wall is not Bento |
| List-first | Admin lists and traceability | Filter context → records → selected detail → bulk actions | Scannable key columns and status | Semantic column widths and visibility | Primary key / state / next action; move the rest into detail | Do not force every desktop column onto mobile |
| Search-first | Global search | Query → results → explanation/filters → detail | Query and first matching group | Filters beside results | Search stays reachable; filters in a sheet; detail drills down | Do not use a search box with no results behavior as decoration |
| Command-oriented | Desktop tools and consoles | Command → parameters/preview → result → history | Command entry and execution context | Command palette, focus order, discoverable shortcuts | Explicit task buttons replace shortcut dependence | Do not make users guess commands or override IME/browser-reserved keys |

```text
Dashboard                      Workspace                        Mobile Task
[Key conclusion    ][Range]     [Queue | Current object/evidence | Inspector] [Current object + progress]
[Primary visualization      ]   [      | Task actions            |          ] [Essential data/checks   ]
[Anomaly detail | Support   ]                                            [Details on demand       ]
                                                                         [Bottom confirmation     ]
```

These are not the only layouts. Business priority must explain size and order. If the relationship is wrong, change the composition rather than trying to repair it with color.

## 7. Desktop-to-mobile recomposition

- Desktop columns do not become a simple vertical stack. Decide what remains, summarizes, drills down, or waits before writing breakpoints.
- A workbench inspector becomes detail context on a phone, not an extra card at the bottom.
- A mobile chart may become a conclusion plus expandable evidence with a data-table alternative; never remove the anomaly explanation.
- Media may be full width while prose needs a reading width. Shared tokens do not require one `max-width`.
- Repeated list rows are valid; repeated undifferentiated feature modules require justification. One oversized number is not every dashboard's default anchor.

## 8. Verification

Identify the primary content, entry action, primary anchor, and destination of low-frequency information. Hierarchy must survive grayscale or another theme; skinning alone cannot change information hierarchy. On the second pass, verify that navigation, introduction, or four cards do not occupy the entire first screen while the real task requires scrolling.
