# Translucent：半透明只覆盖稳定底色

半透明 = 语义底色 + 受控透明度，下层背景稳定可预测。它不做模糊，所以成本低、可读性可算，但前提是“下面是什么”是已知的。

## 1. 什么时候用

覆盖在稳定底色上的次要层：吸顶栏、侧栏叠层、列表选中底、Focus / Highlight 类语义面。下层是 Canvas 或 Surface 这类可预测颜色时，文字对比度可以直接按合成结果计算。

## 2. 构成

```css
.translucent-bar {
  background: color-mix(in oklch, var(--ui-surface) 90%, transparent);
  border-bottom: var(--ui-border-width) solid var(--ui-stroke);
}
```

透明度来自语义底色的受控混合，不是随手 `rgba(255 255 255 / .5)`。交互态（hover / active）沿用同一底色推导，见 [ui-tokens.css](../assets/ui-tokens.css) 的 color-mix 推导层。

## 3. 什么时候不用

- 文字背景无法计算的位置：下面是媒体、渐变、滚动内容时，半透明会让对比度随内容漂移。这种情况要么回到 [实色](solid.md)，要么升级为 [磨砂](frosted.md) 并提供承载面。
- 高风险信息永远不落在半透明面上。

## 4. 验证

对比度按“底色 × 透明度 × 下层色”合成后实测，不以色名或设计稿比值判定；明暗两套主题分别验证。渐变 / 图片 / 半透明底上的文字若无法计算背景，报告待人工确认，不算自动通过。
