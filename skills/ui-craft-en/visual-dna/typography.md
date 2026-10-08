# Typography: Chinese typesetting and interface copy

Applying Western typography rules directly to Chinese is the main reason Chinese interfaces feel subtly wrong. Font pairings returned by the foundation are Western-first candidates; pass them through this guide before using them in a Chinese interface. Font roles and visual scale follow the product task, and actual font supply, glyph coverage, and browser support require verification.

## 1. Font stacks: Western fonts first, Chinese fallback second

Browsers fall back per glyph. Western fonts usually lack Han glyphs, so the browser automatically uses the following Chinese font. Put the Western font first so each script receives its best available glyphs.

```css
:root {
  /* Body/UI: Western first, Chinese fallback */
  --ui-font-sans:
    'Inter', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    'PingFang SC', 'HarmonyOS Sans SC', 'MiSans', 'Source Han Sans SC',
    'Noto Sans CJK SC', 'Microsoft YaHei',
    sans-serif;

  /* Headings when a tighter display voice is useful */
  --ui-font-display:
    'Inter Tight', 'Geist', 'SF Pro Display',
    'PingFang SC', 'HarmonyOS Sans SC', 'Source Han Sans SC',
    'Microsoft YaHei',
    sans-serif;

  /* Numbers, code, IDs, timestamps */
  --ui-font-mono:
    'JetBrains Mono', 'SF Mono', 'Cascadia Mono', Consolas,
    'Sarasa Mono SC',
    monospace;

  /* Reports, official documents, and archival paper-like UI */
  --ui-font-serif:
    'Source Han Serif SC', 'Noto Serif CJK SC', 'Songti SC', SimSun, serif;
}
```

| Platform | Default Chinese font | Note |
|---|---|---|
| macOS / iOS | PingFang SC | High quality and broad weight range |
| Windows | Microsoft YaHei | Loose shapes, limited Regular/Bold weights, can look weak at small sizes |
| Android | Noto/Source Han or vendor font | Varies widely; always provide fallbacks |
| HarmonyOS | HarmonyOS Sans SC | High quality; place early in the stack |
| Linux | Explicit Source Han installation often required | Otherwise fallback may drop to an unsuitable serif face |

Do not place `Microsoft YaHei` before `PingFang SC`: Windows cannot use PingFang anyway, while macOS users would unnecessarily receive YaHei.

Chinese font files commonly weigh 5–10MB; never load a full package casually. Priority: system font > self-hosted subset > full CDN package. When a brand font must be self-hosted, subset it with `fonttools` or `cn-font-split`, split with `unicode-range`, and set `font-display: swap`.

```css
@font-face {
  font-family: 'HarmonyOS Sans SC';
  src: url('/fonts/HarmonyOS_Sans_SC_Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
  unicode-range: U+4E00-9FFF, U+3000-303F, U+FF00-FFEF;
}
```

## 2. Size and leading: Chinese needs more breathing room

Han characters have a high visual fill ratio, so identical leading feels tighter than in Latin text.

| Role | Size | Leading | Tracking | Weight |
|---|---|---|---|---|
| Page title | 20–24px | 1.3 | 0 | 600 |
| Section heading | 16–18px | 1.4 | 0 | 600 |
| Card heading | 14–16px | 1.45 | 0 | 500–600 |
| Business body | 14px | 1.6 | 0 | 400 |
| Reading body | 16px | 1.75 | 0 | 400 |
| Table cell | 13–14px | 1.4 | 0 | 400 |
| Label/helper | 12px | 1.4 | 0 | 400 |
| Large heading (≥28px) | 28–48px by role | 1.25 | 0; slight positive tracking only when justified | 600–700 |

Hard rules:

- Chinese body text uses `letter-spacing: 0`. Western guidance such as `-0.02em` compresses Han glyphs and is forbidden.
- Business-web body defaults to 14px; reading and mobile body default to at least 16px. Reserve 12px for noncritical helper text; do not use it to compress primary content.
- Use weights 400 / 500 / 600 / 700. Avoid 300 for Chinese body copy, especially on Windows.
- Pair line height with font size through tokens; do not scatter values across components.
- A page may use more than three sizes, but roles stay stable and hierarchy clear. A size role is not an HTML heading rule; an `h1` may be 24px.

## 3. Punctuation and line breaking

```css
.zh-body {
  text-spacing-trim: space-first;   /* Tighten adjacent full-width punctuation; Chrome 123+ */
  text-autospace: normal;           /* Add quarter-em spacing between Han and Latin/numbers */
  line-break: strict;               /* Prevent forbidden punctuation at line start/end */
  word-break: normal;
  overflow-wrap: anywhere;          /* Only for long URLs and IDs */
}
h1, h2, h3 { text-wrap: balance; }  /* Avoid orphaned heading characters */
p { text-wrap: pretty; }            /* Avoid orphaned final lines */
```

| Item | Correct | Incorrect |
|---|---|---|
| Punctuation | Full-width Chinese: `，。；：？！（）《》` | Mixed punctuation: `测试,完成.` |
| Ellipsis | `……` (U+2026 twice) | `...` or `。。。` |
| Em dash | `——`, only for a true parenthetical break | Decoration, divider, or label |
| Range | `2024-01 至 2024-06` or `10-20` | `10—20` or `10 ~ 20` |
| Number and unit | `12px`, `3.5GB` without a space | `12 px`, `3.5 GB` |
| Chinese and Latin/number | Quarter-em separation via `text-autospace` or a manual space | Cramped: `导出PDF文件` |
| Parentheses | Full-width `（）` around Chinese; half-width `()` around Latin | Mixed forms |

Use `text-align: justify` cautiously in Chinese web content: consider it only for long all-Han prose and pair with `text-justify: inter-ideograph`.

## 4. Numerals

```css
.ui-num {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}
```

| Scenario | Rule |
|---|---|
| Numeric table column | Use `tabular-nums` and right alignment |
| Currency | Right-align, group thousands, and keep consistent decimals up to two places |
| Large dashboard number | Format grouping and localized units with `Intl.NumberFormat` |
| ID or order number | Monospace, `white-space: nowrap`, middle ellipsis when too long |
| Time | Standardize on `YYYY-MM-DD HH:mm`; do not mix `2024/1/5` and `2024-01-05` on one screen |
| Unit | Place after the value at 12–13px in secondary text color |

## 5. Chinese IME and forms

```vue
<script setup lang="ts">
import { ref } from 'vue'
const text = ref('')
const composing = ref(false)
const error = ref('')
function validate() {
  if (!composing.value) error.value = text.value.trim() ? '' : '填写查询名称'
}
function onInput(event: Event) {
  text.value = (event.target as HTMLInputElement).value
}
function onCompositionEnd(event: CompositionEvent) {
  composing.value = false
  onInput(event)
  validate()
}
</script>

<template>
  <label for="query-name">查询名称</label>
  <input id="query-name" :value="text" aria-describedby="query-error"
    :aria-invalid="!!error" @input="onInput"
    @compositionstart="composing = true" @compositionend="onCompositionEnd"
    @blur="validate" />
  <p id="query-error" role="status">{{ error }}</p>
</template>
```

- Chinese input has a composition phase while choosing Pinyin candidates. Validation during composition creates false errors; validate after `compositionend`. Search boxes must not send remote queries during composition.
- Chinese has no word boundaries. Do not split on spaces or use `word-break` for highlighting or counting.
- HTML `maxlength` counts UTF-16 code units. Use `Intl.Segmenter` when grapheme counting matters.
- Convert full-width to half-width only for fields with explicit formats, such as identifiers. Never silently normalize names or free text.
- Phrase character counts naturally in Chinese, for example `还可输入 12 字` (“12 characters remaining”).

## 6. Truncation and overflow

```css
.ui-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;            /* Required for flex children */
}
.ui-ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

- Truncated text needs a full-text route reachable by touch and keyboard; do not rely only on `title`. Critical conclusions must not be silently clipped to a fixed line count.
- Do not truncate critical fields such as names and identifiers down to two characters. Allocate adequate column width first.
- Middle ellipsis, preserving both ends, is more readable for IDs, paths, and filenames; implement it in JavaScript.

## 7. Ready-to-use `typography.css`

```css
@layer base {
  html {
    font-family: var(--ui-font-sans);
    font-size: var(--ui-text-base);
    line-height: var(--ui-leading-normal);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-size-adjust: 100%;
  }
  body {
    color: var(--ui-text-primary);
    background: var(--ui-canvas);
    font-variant-numeric: tabular-nums;
    text-spacing-trim: space-first;
    text-autospace: normal;
    line-break: strict;
  }
  h1, h2, h3, h4 {
    margin: 0;
    font-weight: 600;
    line-height: var(--ui-leading-tight);
    letter-spacing: 0;
    text-wrap: balance;
  }
  h1 { font-size: var(--ui-text-3xl); }
  h2 { font-size: var(--ui-text-2xl); }
  h3 { font-size: var(--ui-text-xl); }
  h4 { font-size: var(--ui-text-lg); }
  p {
    margin: 0 0 var(--ui-space-4);
    line-height: var(--ui-leading-loose);
    text-wrap: pretty;
  }
  code, kbd, samp, pre, .u-mono {
    font-family: var(--ui-font-mono);
    font-variant-numeric: tabular-nums;
  }
  ::placeholder { color: var(--ui-text-muted); }
  .zh-prose {
    max-width: 42em;            /* About 35–45 Chinese characters per line */
    line-height: var(--ui-leading-loose);
  }
}
```

## 8. Interface copy

Copy is design material, not decoration. Copy problems are often more common than typesetting problems in Chinese interfaces.

Buttons and actions:

| Rule | Bad | Good |
|---|---|---|
| Verb + object | `提交` (Submit), `确定` (Confirm) | `保存修改` (Save changes), `新建患者` (Create patient), `导出报告` (Export report) |
| One action keeps one name end-to-end | Button says “Publish,” success says “Submitted” | Button `发布` → message `已发布` |
| Destructive action states the consequence | `确定吗？` (Are you sure?) | `删除后将无法恢复该条记录` (This record cannot be recovered after deletion) |
| Primary button ≤ 6 Chinese characters | `立即创建并进入下一步` | `创建并继续` |

Error copy has three parts: what happened + why + what to do. Weak: `操作失败` (“Operation failed”). Strong: `报告导出失败：本次查询结果超过 1 万条。请缩小日期范围后重试。` (“Report export failed: this query exceeds 10,000 rows. Narrow the date range and try again.”) Errors do not apologize, hedge, or blame. Put field errors below fields, form errors above the submit action, and reserve notifications for system-level errors.

Empty-state copy also has three parts: what this is + why it is empty now + how to begin. Distinguish first-use empty (teaching + primary action), filtered empty (describe condition + clear filters), and failure empty (an error state, not an empty state).

Create a terminology list before delivery and use it consistently across the product. Do not alternate equivalent Chinese terms such as 记录/条目, 姓名/名称, 时间范围/时间段, or 校验失败/验证错误.

Avoid empty corporate language, mechanical translations, excessive exclamation marks, emoji replacing icons in key actions, missing spacing in mixed Chinese/Latin text, and placeholders such as `张三`, `测试数据1`, `XX公司`, or `Lorem ipsum`.

## 9. Self-check

| # | Check | Criterion |
|---|---|---|
| 1 | Font stack | Western font first; Windows fallback included |
| 2 | Tracking | Chinese body uses `letter-spacing: 0` |
| 3 | Leading | Body ≥ 1.6; long-form ≥ 1.75; tables ≥ 1.4 |
| 4 | Weight | Body starts at 400; no weight 300 |
| 5 | Punctuation | No half-width punctuation mixed into Chinese prose; ellipsis and em dash are correct |
| 6 | Line breaking | `line-break: strict`; headings avoid orphan characters |
| 7 | Measure | Chinese long-form container is about 35–45 characters wide |
| 8 | Numbers | Table numerals use `tabular-nums` and right alignment; time format is consistent |
| 9 | Forms | Validation waits until `compositionend` |
| 10 | Font loading | No full CJK package; `font-display: swap` |
| 11 | Overflow | Full text is reachable; no unintended horizontal overflow |
| 12 | Copy | Buttons use verb + object; errors and empty states follow three-part structures; no filler or placeholder content |
