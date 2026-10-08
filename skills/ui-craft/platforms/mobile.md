# Mobile：移动不是桌面纵向堆叠

适用于移动 Web 与 iOS / Android / 跨端 App 的共同规则；平台专项见 [ios](ios.md)、[android](android.md)。先读产品任务，再决定结构，不把“密度优先”机械反转为“越少越好”：医疗现场可高密度，媒体可沉浸，工具可分步。触控、阅读和风险底线一致。

新建或重构移动布局时，先安排主任务、必要信息和可达操作，再处理导航、安全区与渐进披露。桌面内容按需要保留、摘要、下钻或延后，不静默删关键字段。

## 1. 七种移动构图

| 结构 | 阅读与操作顺序 | 适用 | 禁用 / 取舍 |
|---|---|---|---|
| Immersive | Large Visual → Context → Primary Action | 播放、专注体验 | 没有内容时显示诚实状态；退出始终可达 |
| Content-first | Title → Metadata → Primary Content → Supporting | 文章、知识、报告 | 目录可折叠，介绍不压过正文 |
| Tool-first | Context → Workspace → Sticky Action | 格式化、计算、转换 | 输入 / 结果分步，不缩小桌面双栏编辑器 |
| Feed | Featured → Compact → Progressive | 动态、媒体发现 | 精选与紧凑条目节奏不同，不全巨型卡片 |
| Detail | 核心对象 → Core Info → Secondary → Related Actions | 病历 / 报告 / 媒体详情 | 次级字段按需展开，风险字段不能藏 |
| Task | Context → Primary Task → Confirmation → Secondary | 核对、审批、现场操作 | 单一主动作；确认后列表与计数同步 |
| Navigation-first | Primary Navigation → Content → Contextual Actions | 多个同级目的地 | 仅一个任务时不强加底部标签 |

视觉重点可以是当前申请、工作区、播放主体、查询或时间轴，不要求大标题、Hero、渐变。七种结构用于找思路，不要求每页填写名称。

## 2. 三档密度与尺度

Compact 保留更多必要摘要、分组紧凑；Balanced 聚焦当前主任务；Relaxed 给阅读 / 媒体更长节奏。三档均不缩小触控区。

移动正文与输入默认 16px 起；辅助标签可用 12 / 13px 但不能替代主内容。中文正文行高约 1.6、字距 0。字号与圆角按角色统一，不限制每屏档数。允许 edge-to-edge、full-bleed、通栏分组、浮动工具条；内容可全幅，文字与操作仍避让安全区。表面分组见 [depth](../visual-dna/depth.md)，不强制全灰底白卡。

## 3. 触控、安全区与软键盘

- HTML 默认命中区 ≥ 48×48 CSS px，宽高双向检查；原生 iOS 44pt、Android 48dp 分别验证，不混用单位。
- 图标可小，按钮盒子真实达标；伪元素扩展需证明不与邻居命中区重叠。
- 高频主动作放拇指可达处；危险低频动作与主动作隔离。FAB 与同权重吸底按钮不同时出现。
- viewport 用 `width=device-width, initial-scale=1, viewport-fit=cover`；不得禁缩放。

```css
.mobile-action {
  min-height: var(--ui-control-touch);
  padding: var(--ui-space-3);
  padding-bottom: calc(var(--ui-space-3) + env(safe-area-inset-bottom, 0px));
}
.mobile-page {
  min-height: 100dvh;
  padding-inline: max(var(--ui-space-4), env(safe-area-inset-left, 0px))
                  max(var(--ui-space-4), env(safe-area-inset-right, 0px));
}
```

`env()` 的值取决于真实设备，带 `viewport-fit` 不保证非零；HTML 安全区开关仅模拟 padding，须明确标注。软键盘打开时允许工作区滚动、保持当前输入与提交可达，不固定死 body 高度。200% 缩放和长文本需换行；输入类型 / `inputmode` / `autocomplete` 按任务选择。真机未测就报告未测。

## 4. 导航与模态

底部标签只适合多个一级目的地，通常 3–5 项，每项有名称、当前状态，切换实际内容；单任务工具可以不用。大标题收起、Sheet、手势返回都不是必选。

下钻必须可返回，保留列表筛选与滚动上下文；手势不能是唯一入口。Sheet 用于近场上下文，阻断确认用 Dialog，复杂长任务用独立页面；禁止层层弹窗。原生 `dialog` 或等效方案必须隔离背景、Tab / Shift+Tab 循环、Escape 关闭、恢复触发焦点；删除触发元素后焦点到相邻记录或新建入口；快速开关和 reduced-motion 不能留滚动锁。

## 5. 状态与语义动效

适用的 loading / empty / error / denied 需真实展示：加载结束恢复原内容，错误可重试，空结果可清除筛选，无权限解释原因而非假解锁。搜索、完成、删除后所有计数和视图来自同一数据源。

按压解释触发（100–150ms），Sheet 上滑解释层级（220–320ms），列表背景解释选择（100–150ms），导航指示解释目的地。transform / opacity 优先；无装饰循环、无全局 scale、无 `transition: all`。系统 reduced-motion 与页面 motion=off 都去位移 / 缩放。触感仅作补充，不能代替视觉 / 文本反馈。完整规则见 [motion](../visual-dna/motion.md)。

## 6. 性能与信息诚实

图片有尺寸、按需加载；列表按实际复杂度分页 / 虚拟化。LCP < 2.5s、INP < 200ms、CLS < 0.1 是目标，未测量不宣称达标。大面积 blur 默认不用；`will-change` 仅在必要时短暂启用。

医疗记录与建议标注本地模拟、来源、人工责任；媒体只用真实本地文件和原生事件，不伪造播放；无后端时不报告“已同步服务器”。

## 7. 验收

按 [mobile-review](../review/mobile-review.md) 检查本次受影响的目标设备、长文本与缩放、触控、焦点和真实操作；安全区、软键盘、系统返回、手势与读屏按实际平台验证。新布局回看信息是否过度省略、主动作是否顺手。
