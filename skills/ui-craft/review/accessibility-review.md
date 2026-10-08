# Accessibility Review：不可协商的下限

无障碍不是附加项，是“这个界面能不能用”的一部分。医疗、政务、金融场景尤其：使用者可能年纪偏大、可能色觉异常、可能只能用键盘。底座的 UX Guidelines 覆盖通用无障碍原则；本篇给出本技能的实测标准与中文场景的坑。

## 1. 对比度

| 内容 | 最低 | 目标 |
|---|---|---|
| 正文文字 | 4.5:1 | 7:1 |
| 大字号（≥ 18.66px 粗体 或 ≥ 24px） | 3:1 | 4.5:1 |
| 图标（承载信息） | 3:1 | 4.5:1 |
| 边框 / 分隔线 | 3:1（若是控件的唯一边界） | — |
| 禁用态文字 | 豁免 | 仍需可辨认（≥ 3:1 更友好） |
| 焦点环 | 3:1（相对相邻色） | — |

必须实测，不凭感觉。常见坑：
- 弱文字仍是普通文字，不能因“次要”豁免 4.5:1；正式 tokens 的 muted 与各使用背景逐对验证。
- 主色按钮的文字用语义前景 token；浅色主色不一定能承载白字，hover / active 也需复测。
- 状态色与实际背景、透明度合成有关，不以色名或硬编码示例比值判定通过；半透明与磨砂面的承载面见 [materials/](../materials/translucent.md)。
- placeholder 也要 4.5:1——很多设计稿这里只有 2.5:1。
- 暗色主题重新验一遍，不复用浅色结论。

## 2. 键盘可达

| 要求 | 说明 |
|---|---|
| 所有功能可仅用键盘完成 | Tab / Shift+Tab / Enter / Space / 方向键 / Esc |
| 焦点顺序与视觉顺序一致 | 不用正 `tabindex` 打乱顺序 |
| `:focus-visible` 有可见焦点环 | 见下 |
| 跳转到主内容 | 长导航页面提供 `跳到主要内容` |
| 弹窗焦点锁定 | 打开时焦点进入，`Esc` 关闭，关闭后回到触发元素 |
| 不依赖 hover | hover 才出现的关键操作必须同时支持 focus |
| 表格键盘操作 | 语义 table 内控件用 Tab / Space / Enter；仅 ARIA grid 实现额外方向键模型 |

```css
:focus-visible {
  outline: 2px solid var(--ui-brand);
  outline-offset: 2px;
  border-radius: inherit;
}
/* 组件库常用 box-shadow 方案 */
.btn:focus-visible {
  outline: none;
  box-shadow: var(--ui-shadow-focus);
}
```

禁止 `outline: none` 而没有等价替代。

## 3. 语义与结构

```html
<header>…</header>
<nav aria-label="主导航">…</nav>
<main>
  <h1>患者列表</h1>
  <section aria-labelledby="filter-title">
    <h2 id="filter-title">筛选条件</h2>
  </section>
  <section aria-labelledby="result-title">
    <h2 id="result-title">查询结果</h2>
    <table>…</table>
  </section>
</main>
```

- 标题层级不跳级；一个页面只有一个 `h1`；不为了字号用 `h4`。
- `button` 做按钮、`a` 做链接；不用 `div` + `@click`。
- 数据表用 `<table>` + `<th scope>`；不用 `div` 拼表格（除非完整 ARIA grid）。
- 表单控件有 `<label for>`；`aria-describedby` 关联帮助与错误文本。
- 图标按钮有可读名称：`<button aria-label="删除该记录"><svg aria-hidden="true">…</svg></button>`。
- 装饰性图标与图片 `aria-hidden="true"` 或 `alt=""`。

## 4. 颜色不是唯一信息载体

| 场景 | 必须补充 |
|---|---|
| 状态标识 | 图标 + 文本，不能只有颜色点 |
| 表单错误 | 错误文字 + 边框色 +（可选）图标 |
| 图表分组 | 直接标注 / 不同形状 / 图案填充 |
| 表格行高亮 | 高亮 + 左侧标记 |
| 必填 | `*` + 说明文字 |
| 链接 | 下划线或明确样式 |

色觉异常检查：在浏览器临时灰度 / 色觉模拟下操作 HTML，确认文字、图标或形状仍表达状态。

## 5. 触控与指针

| 项 | 要求 |
|---|---|
| 触控目标 | HTML 默认 ≥ 48×48 CSS px；iOS 原生 ≥ 44pt、Android 原生 ≥ 48dp，不混用单位。桌面 ≥ 24×24 CSS px，间距默认 ≥ 8px |
| 图标按钮 | 图标可为 16px，实际命中区双向达标；扩展区域不重叠邻近控件 |
| 手势 | 不依赖自定义手势；滑动删除必须同时提供按钮 |
| 悬停 | 悬停提示不包含唯一的关键信息 |

## 6. 动态内容与读屏

```html
<div aria-live="polite" class="sr-only">{{ statusText }}</div>
<div role="status" aria-live="polite">正在加载患者列表</div>
<div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">…</div>
```

- 排序 / 筛选后播报“已按入院时间降序排列，共 128 条”。
- 提交失败播报错误汇总并聚焦第一个错误字段。
- 长任务进度对读屏可见：`role="progressbar"` + `aria-valuenow`。

```css
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
```

## 7. 缩放与适配

200% 缩放、系统字号放大、不禁缩放、`min-height` 而非死锁高度——详见 [responsive-review](responsive-review.md) §3。

## 8. 自检

| # | 检查 | 判据 |
|---|---|---|
| 1 | 对比度 | 正文 ≥ 4.5:1，大字 ≥ 3:1，实测过 |
| 2 | 焦点可见 | 所有可聚焦元素有可见焦点环，无裸 `outline: none` |
| 3 | 键盘 | 全流程仅键盘可完成，含弹窗与表格 |
| 4 | 语义 | 地标、标题层级、`label`、`th scope` 正确 |
| 5 | 名称 | 所有图标按钮有 `aria-label` |
| 6 | 颜色 | 灰度模拟下状态仍可区分 |
| 7 | 触控 | HTML 移动目标双向 ≥ 48 CSS px |
| 8 | 播报 | 异步结果与错误有 `aria-live` |
| 9 | 缩放 | 200% 缩放下可用 |
| 10 | 降级 | `prefers-reduced-motion` 与暗色主题都已验证 |

## 9. 自动测量边界

检查必须记录实际 viewport、主题、密度与完成状态。pending、缺失必测项、超时或不可计算不能绿色通过。浏览器解析 oklch / color-mix 后进行 alpha 合成；渐变、媒体、混合图层无法确定背景时报告待人工确认，不能静默跳过。源码 token 扫描与渲染对比度是独立证据。

200% 缩放、系统文字放大、移动软键盘、安全区及读屏需分别注明测试方式。缩短桌面视口只是软键盘布局压力测试，不等同于真机输入法或原生无障碍验收。
