# Frosted：磨砂给系统级浮层

磨砂 = `backdrop-filter` 模糊 + 半透明底 + 回退承载面。它让浮层“属于”下层内容，同时把下层内容模糊到不再需要被读清。

## 1. 什么时候用

系统级浮层：菜单、Dialog、Sheet、mini-player、吸底工具条——并且底下的内容不需要同时被读清。每屏一层磨砂浮层是常态；玻璃上不叠玻璃。

## 2. 构成

```css
/* 磨砂浮层：可测承载面 + 回退 */
.frosted {
  background: color-mix(in oklch, var(--ui-surface) 82%, transparent);
  backdrop-filter: blur(16px) saturate(1.2);
  border: var(--ui-border-width) solid var(--ui-stroke-strong);
  box-shadow: var(--ui-shadow-lg);
}
@supports not (backdrop-filter: blur(1px)) {
  .frosted { background: var(--ui-surface); }
}
```

- 承载面：`color-mix` 出的底色是可测的对比度承载面；文字对比按这个实色计算，模糊只算增强。
- 回退：`@supports not (backdrop-filter)` 提供实色。
- 边界：暗色主题下阴影弱化，磨砂主要靠描边区分。

## 3. 什么时候不用

- 长文阅读、密集表格、表单：模糊背景增加视觉噪声，不增加信息。
- 性能受限设备：大面积或滚动态 blur 有实测成本，低端设备提供实色降级。
- 需要绝对可读的信息：告警、确认弹窗的正文与按钮落在实色面上，磨砂只做容器。

## 4. 硬性约束

- blur 默认关闭，用了要能说出它解释了哪一层空间关系。
- 磨砂层不承载密集正文；剂量、金额、删除确认永远落在 [实色](solid.md)。
- 平台原生材质（iOS / macOS 的系统 vibrancy）是现成能力，Web 实现是近似模拟，不宣称等同；桌面外壳里能用系统材质就用系统材质，见 [platforms/macos](../platforms/macos.md)。
- 需要折射高光、动态 tint 与跟手行为时，才升级为 [液态玻璃](liquid-glass.md)。
