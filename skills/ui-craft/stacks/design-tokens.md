# Design Tokens：令牌分层与交互态推导

Web 实现工程文档：只提供把令牌落进项目的方法，不引入新的审美。令牌值以 [ui-tokens.css](../assets/ui-tokens.css) 为准；项目已有系统时优先做语义映射（见 [framework-mapping](framework-mapping.md)），不强行替换。

## 1. 三层令牌架构

```
primitive   →   semantic   →   component
原始值          意图映射        组件绑定
```

| 层 | 内容 | 规则 |
|---|---|---|
| primitive | 色阶、间距、字号、曲线等原始值 | 只被语义层引用，组件不直接使用 |
| semantic | `--ui-canvas`、`--ui-surface`、`--ui-brand` 等意图命名 | 主题切换层，`[data-theme]` 只改这一层 |
| component | 组件级绑定（如 `--button-radius`） | 可选；小项目省略，大型组件库再引入 |

[ui-tokens.css](../assets/ui-tokens.css) 的 §1（尺度）、§2（色板）、§3（交互态）即按此分层。新增令牌时保持层级归属，组件里只引用 `var(--ui-*)`（R02）。

## 2. 交互态推导

交互态颜色不手工挑，从语义色推导。公式与 ui-tokens.css §3 一致，任何语义色（brand / success / warning / danger / info）同理：

```css
--ui-brand-hover:  color-mix(in oklch, var(--ui-brand) 88%, white);
--ui-brand-active: color-mix(in oklch, var(--ui-brand) 88%, black);
/* disabled 不做透明度叠加：与画布混合，避免叠出脏色 */
--ui-disabled-text: color-mix(in oklch, var(--ui-text-primary) 35%, var(--ui-canvas));
/* 焦点环用预置阴影令牌 */
--ui-shadow-focus: 0 0 0 3px var(--ui-brand-glow);
```

规则：

- 暗色主题下"混白变亮"不一定成立，推导后必须过对比度实测（[accessibility-review](../review/accessibility-review.md)：正文 4.5:1、大字 3:1）；不达标就回退为显式色值，写进主题色板并注释对比度。
- 不支持 `color-mix` / `oklch` 的目标浏览器（先查 browserslist）：手动补 `-hover` / `-active` 静态值，语义令牌名不变，组件无需感知。
- 状态不能只靠颜色（R10）：hover / active 同时给出阴影、边框或字重变化。
- 状态值全部落在令牌层；组件直接用 `var(--ui-brand-hover)`，不就地写 color-mix。

## 3. Modern CSS 准入

| 特性 | 用途 | 准入条件 |
|---|---|---|
| `oklch` / `color-mix()` | 交互态推导、无新令牌的状态变体 | 按 §2 提供静态回退 |
| `@layer` | 级联分层：`reset, tokens, base, components, utilities` | 令牌文件已置于 `@layer tokens`，勿破坏层级顺序 |
| Container Queries | 组件随容器而非视口响应 | 渐进增强：不支持时布局仍须正确 |
| View Transitions | 路由 / 页面切换编排 | 纯增强：不支持时直接切换，不降级成装饰动效 |
| Scroll-driven animations | 滚动进度、视差 | 纯增强：仅在有真实叙事或反馈需求时引入（见 [motion](../visual-dna/motion.md) 准入） |

准入原则：增强类特性失效时行为必须正确；布局关键特性必须有回退。不为"用新特性"而引入。

## 4. 与其他域和技能的边界

- 动效时长、缓动、准入见 [motion](../visual-dna/motion.md)，本文件不定义新曲线；Vue / React 动画技能文档只定义 API 用法，视觉参数以令牌与 motion 为准。
- 材质（blur / 透明度 / 玻璃）见 [materials/](../materials/solid.md)，本文件不提供玻璃配方。
- 底座（ui-ux-pro-max）检索到的配色 / 字体是候选：采纳时映射进 §1 的语义层再使用，不直接写进组件样式。
