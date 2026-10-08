# iOS：原生感来自系统行为，不来自圆角

共同的移动规则见 [mobile](mobile.md)；本篇只写 iOS 与其他平台不同的部分。适用于 SwiftUI / UIKit 原生实现，以及在 iOS 上运行的移动 Web 与跨端框架（后者是近似模拟，验收时说明）。

## 1. 尺寸与单位

- 命中区 ≥ 44×44pt，按 pt 在原生实现中验收；不与 HTML 的 48 CSS px 混用单位。
- 正文默认对应 Dynamic Type 的 Body（17pt）；支持系统字号放大，布局在 AX 档位下可换行，不裁切。
- 安全区：原生用 `safeAreaInsets`；Web 用 `env(safe-area-inset-*)` 并加 `viewport-fit=cover`，值依赖真机，模拟器 / 桌面浏览器只能模拟。

## 2. 字体

系统字体 SF Pro（西文）+ PingFang SC（中文）；Web 端字体栈把 `-apple-system, "PingFang SC"` 放在前面，见 [typography](../visual-dna/typography.md) §1。不引入需要下载的中文字体来“像 iOS”。

## 3. 导航与返回

- 手势返回是系统能力，但不能是唯一入口：导航栏保留返回按钮或等价可见入口。
- 下钻保留列表筛选与滚动位置；返回后用户回到离开时的状态。
- 底部 Tab 只给多个一级目的地（3–5 项）；单任务工具不强加。
- 大标题（Large Title）收起是可选项，长列表页面适合，工具页不必。

## 4. Sheet 与 Dialog

| 需要 | 用什么 |
|---|---|
| 近场上下文、可随时收起 | Sheet（支持 detent；顶部圆角用 `--ui-radius-2xl` 量级） |
| 必须做决定才能继续 | Alert / 确认 Dialog |
| 复杂长任务 | 独立页面推入导航栈 |

Sheet 不套 Sheet；Sheet 上不再开 Alert 以外的模态。关闭后焦点与 VoiceOver 焦点回到触发处。

## 5. 系统材质

iOS 的系统 vibrancy / material 是平台现成能力：导航栏、Tab 栏、Sheet 背景直接用系统材质，不自制半透明。Web 端实现见 [materials/frosted](../materials/frosted.md) 与 [liquid-glass](../materials/liquid-glass.md)，它们是近似模拟，不宣称等同。高风险信息（剂量、金额、删除确认）落在实色面上。

## 6. 动效与触感

- 转场、Sheet 上滑、列表选中用系统默认时长与曲线；自定义动效遵守 [motion](../visual-dna/motion.md) 的准入与 reduced-motion 退化。
- Haptic 只作补充，视觉与可播报反馈仍是主反馈。
- 系统“减弱动态效果”开启时去位移 / 缩放。

## 7. 不做的事

- 用 Android 的 FAB + 底部导航同时出现。
- 用 `maximum-scale=1` 禁缩放来“防止双击放大”。
- 自绘 iOS 风格开关、导航栏来替代系统控件——除非产品身份需要且验收覆盖。
- 在 Web 端宣称验证了手势返回、Dynamic Type、VoiceOver；未在真机 / 模拟器测过就写明未测。

## 8. 验收

原生感与系统集成按 [native-review](../review/native-review.md)，移动通用项按 [mobile-review](../review/mobile-review.md)。
