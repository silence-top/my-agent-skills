# Framework Mapping：Tailwind 与组件库主题映射

把 [ui-tokens.css](../assets/ui-tokens.css) 的语义令牌接入 Tailwind 与组件库。两条原则：

1. 映射表只允许 `var(--ui-*)` 引用（R02），真实色值只存在于令牌文件；
2. 主题切换只改令牌层（`[data-theme]`），映射与组件代码不感知主题。

## 1. Tailwind

```js
// tailwind.config.js —— 全部引用令牌，不复制值
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--ui-font-sans)'],
        display: ['var(--ui-font-display)'],
        serif: ['var(--ui-font-serif)'],
        mono: ['var(--ui-font-mono)'],
      },
      fontSize: {
        caption: ['var(--ui-text-caption)', { lineHeight: 'var(--ui-leading-tight)' }],
        sm: ['var(--ui-text-sm)', { lineHeight: 'var(--ui-leading-snug)' }],
        base: ['var(--ui-text-base)', { lineHeight: 'var(--ui-leading-normal)' }],
        lg: ['var(--ui-text-lg)', { lineHeight: 'var(--ui-leading-normal)' }],
        xl: ['var(--ui-text-xl)', { lineHeight: 'var(--ui-leading-snug)' }],
        '2xl': ['var(--ui-text-2xl)', { lineHeight: 'var(--ui-leading-tight)' }],
        '3xl': ['var(--ui-text-3xl)', { lineHeight: 'var(--ui-leading-tight)' }],
        '4xl': ['var(--ui-text-4xl)', { lineHeight: 'var(--ui-leading-tight)' }],
      },
      colors: {
        canvas: 'var(--ui-canvas)',
        surface: {
          DEFAULT: 'var(--ui-surface)',
          alt: 'var(--ui-surface-alt)',
          raised: 'var(--ui-surface-raised)',
        },
        stroke: { DEFAULT: 'var(--ui-stroke)', strong: 'var(--ui-stroke-strong)' },
        content: {
          primary: 'var(--ui-text-primary)',
          secondary: 'var(--ui-text-secondary)',
          muted: 'var(--ui-text-muted)',
          inverse: 'var(--ui-text-inverse)',
        },
        brand: { DEFAULT: 'var(--ui-brand)', subtle: 'var(--ui-brand-subtle)' },
        success: 'var(--ui-success)',
        warning: 'var(--ui-warning)',
        danger: 'var(--ui-danger)',
        info: 'var(--ui-info)',
      },
      borderRadius: {
        xs: 'var(--ui-radius-xs)',
        sm: 'var(--ui-radius-sm)',
        md: 'var(--ui-radius-md)',
        lg: 'var(--ui-radius-lg)',
        xl: 'var(--ui-radius-xl)',
        '2xl': 'var(--ui-radius-2xl)',
        full: 'var(--ui-radius-full)',
      },
      boxShadow: {
        xs: 'var(--ui-shadow-xs)',
        sm: 'var(--ui-shadow-sm)',
        md: 'var(--ui-shadow-md)',
        lg: 'var(--ui-shadow-lg)',
        focus: 'var(--ui-shadow-focus)',
      },
      transitionTimingFunction: {
        standard: 'var(--ui-ease-standard)',
        snappy: 'var(--ui-ease-snappy)',
        exit: 'var(--ui-ease-exit)',
      },
      zIndex: {
        sticky: 'var(--ui-z-sticky)',
        dropdown: 'var(--ui-z-dropdown)',
        overlay: 'var(--ui-z-overlay)',
        modal: 'var(--ui-z-modal)',
        drawer: 'var(--ui-z-drawer)',
        popover: 'var(--ui-z-popover)',
        toast: 'var(--ui-z-toast)',
      },
    },
  },
}
```

注意：

- 中文行高用 ui-tokens.css 的 `--ui-leading-*`，不套用西文字阶工具生成的行高（见 [typography](../visual-dna/typography.md)）。
- 字号档名对齐 `--ui-text-*`，覆盖 Tailwind 默认 `sm` / `base` 是有意的（中文正文 14px 起步）；`md` / `2xl` 等非默认档按需增删。
- `zIndex` 映射让布局代码不出现魔法数字；`--ui-z-loading` / `--ui-z-base` 等未列档按需补。

## 2. Naive UI

```js
const themeOverrides = {
  common: {
    primaryColor: 'var(--ui-brand)',
    primaryColorHover: 'var(--ui-brand-hover)',
    primaryColorPressed: 'var(--ui-brand-active)',
    successColor: 'var(--ui-success)',
    warningColor: 'var(--ui-warning)',
    errorColor: 'var(--ui-danger)',
    infoColor: 'var(--ui-info)',
    borderRadius: 'var(--ui-radius-md)',
    fontFamily: 'var(--ui-font-sans)',
    fontSize: 'var(--ui-text-base)',
  },
  Card: { borderRadius: 'var(--ui-radius-lg)', color: 'var(--ui-surface)' },
  Input: { borderRadius: 'var(--ui-radius-sm)' },
}
```

已知陷阱：Naive UI 会在 JS 里对主色做再派生（hover / active / suppl 等），CSS 变量串无法参与其颜色计算。若发现派生色失效，改在 CSS 侧覆盖其渲染出的 `--n-*` 变量，或从令牌文件生成的 JSON 里读取具体色值传入。

## 3. Element Plus

Element Plus 走 CSS 变量覆盖，不需要 config 文件：

```css
:root {
  --el-color-primary: var(--ui-brand);
  --el-color-success: var(--ui-success);
  --el-color-warning: var(--ui-warning);
  --el-color-danger: var(--ui-danger);
  --el-color-info: var(--ui-info);
  --el-border-radius-base: var(--ui-radius-md);
  --el-font-family: var(--ui-font-sans);
}
```

EP 自身用 white / black 按档位混主色生成 hover / active 渐变档（light-N = N 成白，dark-N = N 成黑）。覆盖时保持其比例、只换基色，例如：

```css
--el-color-primary-light-3: color-mix(in oklch, var(--ui-brand) 70%, white);
--el-color-primary-dark-2: color-mix(in oklch, var(--ui-brand) 80%, black);
```

## 4. 存量项目渐进迁移

改造现有项目时的顺序，与 SKILL.md §2"改造现有页面"对齐：

1. **检测栈**：框架、样式方案、组件库、browserslist —— 决定走 §1–§3 哪条映射；
2. **映射计划**：现有颜色 / 尺寸 → `--ui-*` 语义令牌的对应表；查不出对应关系的值先标记，不急于归一；
3. **注入令牌**：接入 ui-tokens.css（或把现有变量映射成语义名），此步页面无视觉变化；
4. **逐组件替换**：优先主题覆盖 / 包装组件，其次改样式引用；不做全量重写；
5. **验收**：按 [visual-review](../review/visual-review.md) 检查受影响页面；较大迁移可先跑 [scan-project.mjs](../assets/tools/scan-project.mjs) 定位硬编码颜色（R02）。

红线：

- 迁移不改变信息结构与业务行为；发现模板化问题按 [anti-generic](../visual-dna/anti-generic.md) 单独处理，不在迁移改动里夹带改版。
- 不自动生成迁移报告或补丁目录——交付物遵循 SKILL.md §5：简述改动、验证结果和未测边界。
