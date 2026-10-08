---
name: ui-craft
description: >-
  面向 Web、移动和桌面的 UI 设计、实现与评审指南，覆盖视觉层级、中文排版、材质、响应式、
  平台原生感、交互状态、无障碍和设计令牌映射。用于新建或改造页面、修复视觉与交互问题、
  审查前端 UI，以及处理后台、医疗、媒体、工具和信息展示界面。纯后端、基础设施和非视觉任务不使用。
---

# UI Craft

理解任务 → 选择结构 → 实现 → 检查关键问题。先解决内容和操作，再选择组件；改一个按钮不需要重新设计整个产品。

## 1. 分工：底座负责检索，本技能负责审美与平台

```
UI/UX Pro Max（随附底座：skills/ui-ux-pro-max，安装后与本技能同级）
    风格 / 配色 / 字体组合 / UX 规则 / 技术栈指南检索；--design-system 生成 MASTER.md 与页面级 override
本技能五域（叠在底座之上，也可独立使用）
├── visual-dna/   什么算精致、什么一眼模板；中文排版、深度与构图、动效
├── materials/    实色 / 半透明 / 磨砂 / 液态玻璃：何时用、何时必须退回实色
├── platforms/    Web 业务、移动通用、iOS、Android、macOS、Windows、Electron
├── stacks/       Web 实现工程：交互态推导、Tailwind / 组件库映射、Modern CSS
└── review/       视觉、移动、响应式、无障碍、原生感、反模板六类验收
```

底座回答“这类产品常用什么风格和配色”，本技能回答“怎么做才精致、像真实平台、不像模板”。底座给出的风格、配色、字体组合是**建议**，经本技能的 Visual DNA、中文排版规则与对比度实测后使用。

冲突时的优先级：**用户明确要求 > 项目现有约定 > 本技能底线（§4）> 底座检索结果**。

底座是可选增强：[ui-ux-pro-max](../ui-ux-pro-max/SKILL.md)（vendored，上游 MIT；同步记录见 [VENDORED.md](../ui-ux-pro-max/VENDORED.md)）。需要检索时，先定位已安装的 `ui-ux-pro-max` 目录，再运行其中的 `scripts/search.py`（Python 3，无外部依赖）；不要假定当前工作目录。新项目 / 新产品类型可先跑 `--design-system`，持久化的 `MASTER.md` 视为项目约定。底座未安装或 Python 不可用时跳过检索，本技能仍须独立完成任务。上游地址：[UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)。

## 2. 先判断这次要做什么

| 任务 | 最小流程 |
|---|---|
| 新建页面 / 明显重构 | 确认主任务和主信息 → 选择布局与视觉重点 → 实现。存在真实结构取舍时才比较两个候选 |
| 改造现有页面 | 看清现有技术、品牌、字段与权限 → 定位主要问题 → 在授权范围改进，保留业务兼容 |
| 局部修复 / 组件调整 | 直接检查相关组件与相邻影响，沿用现有设计；不重选整页风格，不生成设计档案 |
| 评审 / 诊断 | 按 review/ 给出可定位问题、影响和建议；没有修改授权时保持只读 |

从项目识别技术栈，不默认指定框架。需求明确就执行；只对影响结果的真实歧义提问。新页可用一句话说明“主任务、布局理由、视觉重点、移动取舍”；局部修复只说明问题和改动。

## 3. 五域路由：先读最相关的 1–2 篇

### visual-dna/ — 审美

| 问题 | 读 |
|---|---|
| 什么算精致、Avoid / Prefer、与底座风格的关系 | [premium-ui](visual-dna/premium-ui.md) |
| 页面像模板、具体症状怎么改 | [anti-generic](visual-dna/anti-generic.md) |
| 中文字体栈、字号行高、标点、数字、输入法、界面文案 | [typography](visual-dna/typography.md) |
| 表面角色、节奏、尺度、构图选择、桌面到移动映射 | [depth](visual-dna/depth.md) |
| 动效准入、时长曲线、reduced-motion、加载占位 | [motion](visual-dna/motion.md) |

### materials/ — 材质

| 问题 | 读 |
|---|---|
| 默认面、高风险信息承载 | [solid](materials/solid.md) |
| 吸顶栏、叠层等稳定底色上的次要层 | [translucent](materials/translucent.md) |
| 菜单、Dialog、Sheet 等系统级浮层 | [frosted](materials/frosted.md) |
| 播放器、Dock、沉浸控制层；十一维度与“不是透明底加 blur” | [liquid-glass](materials/liquid-glass.md) |

### platforms/ — 平台

| 场景 | 读 |
|---|---|
| 数据中台、后台、表格、表单、弹窗、向导、树、上传 | [web](platforms/web.md) |
| 移动通用：七种构图、触控、安全区、软键盘、导航模态 | [mobile](platforms/mobile.md) |
| iOS：44pt、Dynamic Type、Sheet、系统材质、手势返回 | [ios](platforms/ios.md) |
| Android：48dp、系统返回、M3、动态取色 | [android](platforms/android.md) |
| macOS：左侧窗口控制、vibrancy、菜单栏、⌘ | [macos](platforms/macos.md) |
| Windows：右侧窗口控制、清晰边界、Mica、Ctrl | [windows](platforms/windows.md) |
| Electron / Tauri：十三项原生感清单、系统集成 | [electron](platforms/electron.md) |

### stacks/ — Web 实现工程

| 问题 | 读 |
|---|---|
| 交互态从语义色推导、@layer 分层、Modern CSS 准入 | [design-tokens](stacks/design-tokens.md) |
| Tailwind / Naive UI / Element Plus 主题映射、存量项目渐进迁移 | [framework-mapping](stacks/framework-mapping.md) |

### review/ — 验收

| 时机 | 读 |
|---|---|
| 任何交付前 | [visual-review](review/visual-review.md)（R01–R15 + 视觉回看 + 简短交付） |
| 移动页面 | [mobile-review](review/mobile-review.md)（M1–M12） |
| 视口、缩放、溢出 | [responsive-review](review/responsive-review.md) |
| 对比度、键盘、语义、读屏、触控 | [accessibility-review](review/accessibility-review.md) |
| 桌面外壳 / 原生实现 | [native-review](review/native-review.md) |
| 新建或布局调整后 | [anti-slop-review](review/anti-slop-review.md)（十一问） |

先读最相关的 1–2 篇；只有新的决策问题出现时才继续展开，不一次加载全部参考。没有命中场景时按任务判断，不硬套模板；目录不是必走流程。

## 4. 少量底线，保留设计自由

- 复用项目现有品牌、语义令牌和控件行为；不为应用本技能强行换框架、配色或目录。
- 主任务和信息层级优先。内容、对齐和间距能分组时不加多余容器；不强制 Hero、卡片、渐变、字号档数或人格标签。
- 移动端重新安排必要信息与操作，不能只缩小桌面页面；桌面外壳 ≠ 窗口里的网站。
- 材质服务于信息层级与可读性；玻璃不是“透明底加模糊”，高风险信息永远落在实色面上。
- 操作有真实结果、必要状态和恢复路径；保留输入、焦点与数据一致性。模拟数据、AI 建议和未实现能力明确标注。
- 中文正文不负字距；文字可读、焦点可见、键盘可用、支持 reduced-motion。对比度 4.5:1 / 3:1，HTML 移动目标 48×48 CSS px、桌面 ≥ 24×24，iOS 44pt / Android 48dp 分别验收；不以审美覆盖可用性。

构图、人格、材质、表面和尺度是解决问题的词汇，不是每页要填满的字段。产品共享语义与交互，不要求共享同一张页面骨架。

## 5. 检查与交付

只执行 review/ 中本次相关的检查；真实操作优先于属性或类名断言。新建或大幅改布局时回看主次、密度和移动可达性；发现问题再改，不强制每次写第二轮报告。未测、失败和不可测都不能说成通过。

交付简述改动、验证结果和未测边界。有 HTML 预览就提供可操作入口；不自动创建设计档案、报告文件、截图或图片。

## 6. 可选资产，不是使用前置条件

- [ui-tokens.css](assets/ui-tokens.css)：没有现成系统时可作为起点；已有系统优先做语义映射。各域文档中引用的 `--ui-*` 令牌均定义于此。
- [scan-project.mjs](assets/tools/scan-project.mjs)：较大改造时按需运行的源码审计，不是设计推荐引擎；局部改动不必全库扫描。
- [工作台示例](assets/demo/index.html)：参考布局和真实操作，不复制万能外壳。仓库另有移动、媒体、工具等示例。
