# Android：跟随系统返回与 Material 语法

共同的移动规则见 [mobile](mobile.md)；本篇只写 Android 与其他平台不同的部分。适用于 Jetpack Compose / View 原生实现，以及 Android 上的移动 Web 与跨端框架（后者是近似模拟，验收时说明）。

## 1. 尺寸与单位

- 命中区 ≥ 48×48dp，按 dp 在原生实现中验收；不与 HTML 的 48 CSS px 或 iOS 的 44pt 混用。
- 正文默认 16sp；支持系统字号缩放（sp 随系统），布局在最大档位可换行。
- 安全区 / 显示切口：原生用 `WindowInsets`；Web 用 `env(safe-area-inset-*)`，全面屏手势条区域下方不放主操作。

## 2. 字体

系统字体 Roboto（西文）+ 厂商中文字体（Noto Sans CJK / 各家自带）。中文字体回退差异比 iOS 大：字重档位可能缺失、行高不同，验收要覆盖至少一台非 Pixel 设备。Web 字体栈见 [typography](../visual-dna/typography.md) §1，不为“统一”而下载大字体包。

## 3. 系统返回

系统返回（手势或按钮）是全局能力，App 必须正确响应：
- 关闭当前 Sheet / Dialog → 回到上一页 → 退出到桌面，层级明确。
- 不拦截返回来弹“确定退出？”，除非有未保存内容。
- 预测性返回（Predictive Back）可用时让系统处理转场。

## 4. 导航与弹层

- 底部导航 3–5 项，有名称与当前态；Navigation Rail 用于平板 / 大屏。
- FAB 只代表当前页面唯一主动作；FAB 与同权重吸底按钮不同时出现。
- Bottom Sheet 顶部两角圆角对应 `--ui-radius-2xl`（28px，M3 extra-large）；Modal Sheet 与 Standard Sheet 区分是否阻断。
- Dialog 用于必须决定的确认；Snackbar 用于操作结果并可带单个动作。

## 5. 材质与颜色

Material 3 动态取色是系统能力，开启后语义色由系统生成；自有品牌色只放在品牌承载点，不与动态色冲突。表面层级靠 tonal elevation（色调偏移）而不是大阴影，见 [depth](../visual-dna/depth.md)。模糊材质在 Android 上成本高且版本差异大，默认不用，见 [materials/solid](../materials/solid.md)。

## 6. 动效

Material motion 的 emphasized / standard 曲线是默认；自定义动效遵守 [motion](../visual-dna/motion.md)。系统“移除动画”开启时去位移 / 缩放。列表项按压用状态层（state layer）而非全局 scale。

## 7. 不做的事

- 照搬 iOS 的左上角返回箭头 + 右滑返回作为唯一返回方式。
- 用 iOS 风格底部 Sheet 圆角 + 拖动条来“像 iOS”。
- 阴影堆叠表达层级；多个 FAB。
- 在 Web 端宣称验证了系统返回、TalkBack、动态取色；未在真机 / 模拟器测过就写明未测。

## 8. 验收

原生感与系统集成按 [native-review](../review/native-review.md)，移动通用项按 [mobile-review](../review/mobile-review.md)。
