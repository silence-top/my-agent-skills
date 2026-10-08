# Typography：中文排版与界面文案

直接照搬西文排版规则来排中文，是中文界面“看着不对劲”的头号原因。底座给出的字体组合是西文优先的候选，落到中文界面前必须过本篇。字体角色与视觉尺度服从产品任务；实际字体供应、字形和浏览器支持需要验证。

## 1. 字体栈（西文在前，中文回退）

浏览器逐字回退：西文字体没有汉字字形，会自动落到后面的中文字体。因此西文字体必须写在前面，中英文各自拿到最好的字形。

```css
:root {
  /* 正文 / UI：西文优先 + 中文回退 */
  --ui-font-sans:
    'Inter', 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    'PingFang SC', 'HarmonyOS Sans SC', 'MiSans', 'Source Han Sans SC',
    'Noto Sans CJK SC', 'Microsoft YaHei',
    sans-serif;

  /* 标题（需要更紧的排版气质时） */
  --ui-font-display:
    'Inter Tight', 'Geist', 'SF Pro Display',
    'PingFang SC', 'HarmonyOS Sans SC', 'Source Han Sans SC',
    'Microsoft YaHei',
    sans-serif;

  /* 数字 / 代码 / ID / 时间戳 */
  --ui-font-mono:
    'JetBrains Mono', 'SF Mono', 'Cascadia Mono', Consolas,
    'Sarasa Mono SC',
    monospace;

  /* 报告 / 公文 / 档案类（纸感方向） */
  --ui-font-serif:
    'Source Han Serif SC', 'Noto Serif CJK SC', 'Songti SC', SimSun, serif;
}
```

| 平台 | 默认中文字体 | 备注 |
|---|---|---|
| macOS / iOS | 苹方 PingFang SC | 质量好，字重齐全 |
| Windows | 微软雅黑 Microsoft YaHei | 字形偏松、字重只有 Regular / Bold，屏显小字号发虚 |
| Android | 思源黑体 / 厂商定制 | 差异大，必须给回退 |
| 鸿蒙 | HarmonyOS Sans SC | 质量好，建议靠前 |
| Linux | 需要显式安装思源黑体 | 否则落宋体，观感断崖 |

不要把 `Microsoft YaHei` 放在 `PingFang SC` 之前——Windows 用户看不到苹方，但 Mac 用户会看到雅黑，白白降级。

字体加载：中文字体动辄 5–10MB，绝对不能整包加载。优先级：系统字体 > 自托管子集 > CDN 整包。必须自托管品牌字体时，用 `fonttools` / `cn-font-split` 子集化，按 `unicode-range` 切片，`font-display: swap`。

```css
@font-face {
  font-family: 'HarmonyOS Sans SC';
  src: url('/fonts/HarmonyOS_Sans_SC_Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
  unicode-range: U+4E00-9FFF, U+3000-303F, U+FF00-FFEF;
}
```

## 2. 字号与行高（中文必须比西文更松）

汉字是方块字，字面率高，同样的行高在中文里显得更挤。

| 用途 | 字号 | 行高 | 字距 | 字重 |
|---|---|---|---|---|
| 页面标题 | 20–24px | 1.3 | 0 | 600 |
| 区块标题 | 16–18px | 1.4 | 0 | 600 |
| 卡片标题 | 14–16px | 1.45 | 0 | 500–600 |
| 正文（业务系统） | 14px | 1.6 | 0 | 400 |
| 正文（阅读型） | 16px | 1.75 | 0 | 400 |
| 表格单元 | 13–14px | 1.4 | 0 | 400 |
| 标签 / 辅助 | 12px | 1.4 | 0 | 400 |
| 大标题（≥28px） | 28–48px，按角色 | 1.25 | 0，必要时小幅正字距 | 600–700 |

铁律：

- 中文正文 `letter-spacing` 必须是 `0`。西文规范里的 `-0.02em` 负字距会让汉字互相挤压，禁止使用。
- Web 业务正文默认 14px，阅读与移动正文默认至少 16px；12px 只用于非关键辅助信息，不可用来压缩主要内容。
- 字重只用 400 / 500 / 600 / 700。不要用 300 排中文正文（Windows 上尤其发虚）。
- 行高必须与字号成对出现，写成令牌，不要散落在组件里。
- 页面可以使用超过三档字号，但同角色应稳定、主次应清晰；字号角色不是标题标签，h1 可以是 24px。

## 3. 标点与断行

```css
.zh-body {
  text-spacing-trim: space-first;   /* 相邻全角标点自动收窄，Chrome 123+ */
  text-autospace: normal;           /* 中西文之间自动加 1/4 字空隙 */
  line-break: strict;               /* 避头尾：禁止行首出现 。，）》 */
  word-break: normal;
  overflow-wrap: anywhere;          /* 只用于处理超长 URL / ID */
}
h1, h2, h3 { text-wrap: balance; }  /* 标题不出孤字 */
p { text-wrap: pretty; }            /* 段落不出孤行 */
```

| 项 | 正确 | 错误 |
|---|---|---|
| 标点 | 全角：`，。；：？！（）《》` | 中英标点混用：`测试,完成.` |
| 省略号 | `……`（U+2026 ×2） | `...`、`。。。` |
| 破折号 | `——`，仅用于真正的插入语 | 当装饰、分隔符、标签用 |
| 范围 | `2024-01 至 2024-06` 或 `10-20` | `10—20`、`10 ~ 20` |
| 数字与单位 | `12px`、`3.5GB`（不空格） | `12 px`、`3.5 GB` |
| 中文与西文 / 数字 | 留 1/4 空隙（`text-autospace` 或手动空格） | 紧贴：`导出PDF文件` |
| 括号 | 中文内容全角 `（）`，纯西文半角 `()` | 混用 |

`text-align: justify` 在中文网页上慎用：只在纯汉字长文中考虑，并配合 `text-justify: inter-ideograph`。

## 4. 数字排版

```css
.ui-num {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}
```

| 场景 | 规则 |
|---|---|
| 表格中的数值列 | 必须 `tabular-nums`，且右对齐 |
| 金额 | 右对齐，千分位分隔，小数位统一（最多 2 位） |
| 大数字（看板） | 用 `Intl.NumberFormat` 做千分位与单位缩写（`12.3 万`） |
| ID / 单号 | 等宽字体，`white-space: nowrap`，过长时中间省略 |
| 时间 | 统一 `YYYY-MM-DD HH:mm`；同屏不混用 `2024/1/5` 与 `2024-01-05` |
| 单位 | 放在数字之后，字号 12–13px，次要文字色 |

## 5. 中文输入法与表单

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

- 中文输入存在组合态（拼音候选阶段）。组合中触发校验会误报，必须在 `compositionend` 之后再校验；搜索框在组合态期间不触发远程查询。
- 中文没有单词边界，不要用 `word-break` 或空格切词做高亮 / 统计。
- HTML `maxlength` 按 UTF-16 码元计数；需要字素计数时用 `Intl.Segmenter`。
- 仅对编号等有明确规则的字段做全角转半角；姓名、自由文本不得静默归一化。
- 字符计数用中文表述：`还可输入 12 字`。

## 6. 文本裁切与溢出

```css
.ui-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;            /* flex 子项必须加 */
}
.ui-ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

- 省略时必须提供触控与键盘都可达的全文入口，不能只依赖 `title`；诊断结论等核心信息不得为固定行高被静默裁切。
- 关键字段（姓名、编号）不要省略到只剩 2 个字；优先给列分配足够宽度。
- 中间省略（保留头尾）在 ID、路径、文件名场景更可读：用 JS 处理。

## 7. 可直接落地的 `typography.css`

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
    max-width: 42em;            /* 中文一行 35–45 字最舒适，比西文的 65ch 短 */
    line-height: var(--ui-leading-loose);
  }
}
```

## 8. 界面文案

文案是设计材料，不是装饰。中文界面的文案问题比排版问题更常见。

按钮与操作：

| 规则 | 反例 | 正例 |
|---|---|---|
| 动词 + 对象 | `提交`、`确定` | `保存修改`、`新建患者`、`导出报告` |
| 同一动作全流程同名 | 按钮“发布”，提示“提交成功” | 按钮“发布” → 提示“已发布” |
| 破坏性操作写清后果 | `确定吗？` | `删除后将无法恢复该条记录` |
| 主按钮 ≤ 6 字 | `立即创建并进入下一步` | `创建并继续` |

错误文案三段式：发生了什么 + 为什么 + 怎么办。差：`操作失败`；好：`报告导出失败：本次查询结果超过 1 万条。请缩小日期范围后重试。` 错误不道歉、不含糊、不甩锅。字段级错误放字段下方，表单级放提交按钮上方，系统级才用通知。

空态文案三段式：这是什么 + 为什么现在是空的 + 怎么开始。区分首次为空（教学文案 + 主行动）、筛选后为空（说明条件 + `清除筛选`）、异常为空（这是错误态，不是空态）。

术语统一：交付前建立术语表并全站一致（记录 / 姓名 / 时间范围 / 校验失败，不混用条目、名称、时间段、验证错误）。

禁止的文案习惯：空话（`赋能`、`闭环`、`抓手`、`一键式解决方案`）；英文直译的机械中文（`点击这里以继续`）；感叹号堆叠；关键操作用 Emoji 代替图标；中英混排无空格；占位内容（`张三`、`测试数据1`、`XX公司`、`Lorem ipsum`）。

## 9. 自检

| # | 检查 | 判据 |
|---|---|---|
| 1 | 字体栈 | 西文字体在前，含 Windows 回退 |
| 2 | 字距 | 中文正文 `letter-spacing: 0` |
| 3 | 行高 | 正文 ≥ 1.6；长文 ≥ 1.75；表格 ≥ 1.4 |
| 4 | 字重 | 正文 400 起，无 300 |
| 5 | 标点 | 无半角标点混入中文正文；省略号与破折号正确 |
| 6 | 断行 | `line-break: strict`；标题无孤字 |
| 7 | 行宽 | 中文长文容器约 35–45 字宽 |
| 8 | 数字 | 表格数值 `tabular-nums` + 右对齐；时间格式统一 |
| 9 | 表单 | 校验在 `compositionend` 之后触发 |
| 10 | 字体加载 | 无整包 CJK 字体；`font-display: swap` |
| 11 | 溢出 | 长文本全文可达，页面无非预期横向溢出 |
| 12 | 文案 | 按钮动词 + 对象；错误与空态三段式；无空话与占位内容 |
