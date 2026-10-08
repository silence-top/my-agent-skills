# Premium UI: polished rather than templated

This document defines the skill's aesthetic position and outranks style-search results, including UI/UX Pro Max style and palette suggestions. The foundation answers “what is common for this product type?” This file answers “what makes the result intentional and polished?”

## 1. Avoid / Prefer

| Avoid without a task-specific reason | Prefer |
|---|---|
| Generic SaaS shell: sidebar + top bar + card wall | Spatial hierarchy: the primary task receives the most area; secondary regions recede |
| Generic dashboard: four equal KPI cards plus one chart | Material hierarchy: solid surfaces carry content; glass is reserved for persistent overlays |
| Equal-width cards everywhere; one box per field | Restrained transparency: reveal real content below, not a fixed translucent color |
| Gradient hero or gradient headline text | Nuanced depth: shadows belong to real overlays; boundaries mark necessary divisions |
| Purple “AI” styling, glowing borders, breathing halos | Intentional contrast: contrast expresses priority, not “premium feel” |
| Arbitrary glassmorphism and full-screen blur | Content-dependent surfaces whose role follows the information they carry |
| Decorative motion: whole-page entrance, hover lift, endless floating | Deliberate typography: font roles, scale, leading, and Chinese punctuation create hierarchy |
| A hero that pushes the actual workspace below the fold | Restrained motion that explains hierarchy, narrative, feedback, or state; remove it if it explains nothing |

Polish comes from making hierarchy clearer after removing ineffective decoration, not from adding effects. Replace decoration with information: separate through spacing and alignment, emphasize through weight and text color, and group by real data relationships such as time, state, and ownership.

## 2. Visual anchor

Each page needs a clear primary anchor: the current task, an input/output workspace, a key chart, search, a timeline, media, or the relationship between a title and evidence. An anchor may contain tightly related objects, but every card cannot be the anchor.

Selection method: determine what the user must see first → assign area, position, and contrast → organize the scan path → let secondary areas recede. Do not require a hero, gradient, glow, or quota of oversized numbers. When no media exists, anchor on a visible local-file selection workspace rather than a hidden player.

Manual review: Is the primary task recognizable at first glance? Does hierarchy survive without the accent color? Is the anchor obscured by navigation or a console? Does mobile need a different anchor?

## 3. Personality vocabulary (combine; naming is optional)

Personality emerges from structure and behavior, not from a theme, industry label, or palette switch. Use at most one dominant and one supporting personality; the supporting one affects only a clear local role. Light and dark themes retain the same structural identity.

| Personality | Typography and scale | Composition, density, and surfaces | Boundaries and forbidden combinations |
|---|---|---|---|
| Technical | Monospace for tool information; readable text face for body copy | Workspaces, commands, and lists; compact high-frequency zones; flat content first; precise selection contrast | Do not set all body copy in monospace |
| Premium | Limited display type plus clear body copy; create refinement through proportion, not ultra-thin type | Asymmetric hierarchy; few surfaces; borders only at necessary divisions | Blur, gold, or empty space do not define premium; high-risk work cannot use low contrast |
| Editorial | Distinct roles for title, abstract, body, and sidenote; optional local serif heading | Claim → evidence → explanation; typography and whitespace group; rules mark sections | Avoid for dense editors requiring repeated horizontal comparison |
| Calm | Stable weight and comfortable leading | Clear primary task, progressive disclosure, soft backgrounds with compliant text | Calm does not mean gray until unreadable |
| Futuristic | Precise numerals plus modern body copy | Real-time signals as anchors; functional glow only for selection or alerts | No fabricated live data, decorative scan lines, or invented AI confidence |
| Organic | Natural reading rhythm; no negative tracking for Chinese | Flowing groups based on content relationships; shape expresses relationships; few surfaces | Do not make every container irregular |
| Playful | One expressive display role with stable body copy | Put playfulness in low-risk discovery and completion feedback; retain high-contrast emphasis | No jokes in destructive actions or payment confirmation |
| Cinematic | Concise, forceful titles; clear media and subtitle priority | Media leads, queue recedes; controls rest on a known background | No fake covers or playback; do not sacrifice subtitle or control contrast |
| Industrial | Precise primary keys, states, and values | Lists and processes first; dense but clearly grouped; firm flat surfaces | Not equivalent to bolding everything or using thick borders |
| Human-centered | Task language before system terminology | Current person/task → next action → evidence; risk tiers; cards only when useful | Never fabricate patients, clinicians, or recommendation results |

Examples: healthcare workbench = Technical for queues and keyboard operation + Human-centered for verification language; media = Cinematic for the subject + Editorial for titles and queue typography; feature presentation = Editorial for the argument + Premium for proportion and type.

Do not offer a runtime switch that pairs arbitrary personalities with arbitrary compositions. Personality is structural and behavioral; theme switches change semantic color values only.

## 4. Relationship to the foundation

- Styles returned by the foundation, such as Glassmorphism, Dark, or Minimal, are candidates rather than decisions. Pass them through the Avoid list in §1.
- Validate palette and font-pairing suggestions against the Chinese rules in [typography](typography.md) when applicable and measured contrast in [accessibility-review](../review/accessibility-review.md).
- See [materials](../materials/solid.md) for material choice, [depth](depth.md) for surfaces, rhythm, and composition, and [anti-slop-review](../review/anti-slop-review.md) for the final template check.
