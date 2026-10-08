# Motion：动效是状态变化的说明书

一条准入规则：如果不能用一句话说出这个动画在解释什么，就删掉它。底座提供的动效预设是素材库，进入产品前先过 §1 的准入。

## 1. 准入：四类之一

| 类别 | 解释什么 | 例子 |
|---|---|---|
| 层级 | 谁在谁之上 | 弹窗从触发方向展开；抽屉从侧面滑入 |
| 叙事 | 状态如何流转 | 步骤条推进；列表项新增 / 删除 |
| 反馈 | 操作是否生效 | 按钮按下、保存成功勾选、复制成功 |
| 状态 | 数据或视图发生了变化 | 数值变化、筛选结果刷新、展开 / 收起 |

不属于以上四类的全部删除：旋转的 logo、循环呼吸的按钮、无触发的漂浮、整屏入场动画、“高级感”视差。声明“有过渡”却只写 `transition: all .3s` 而没定义变化前后状态，等于没做。

## 2. 时长与曲线

```css
:root {
  --ui-duration-instant: 100ms;  /* 按下反馈、颜色变化 */
  --ui-duration-fast:    150ms;  /* hover、focus */
  --ui-duration-normal:  220ms;  /* 展开收起、轻提示进出 */
  --ui-duration-slow:    320ms;  /* 弹窗、抽屉 */

  --ui-ease-standard: cubic-bezier(0.2, 0, 0, 1);     /* 通用 */
  --ui-ease-snappy:   cubic-bezier(0.16, 1, 0.3, 1);  /* 进场：快起慢停 */
  --ui-ease-exit:     cubic-bezier(0.4, 0, 1, 1);     /* 退场：慢起快走 */
}
```

- 进场慢、退场快：退场时长约为进场的 60–70%。
- 距离越远，时长越长：移动 8px 用 120ms；移动 400px 用 320ms。
- 不用 `linear`（进度条与骨架屏微光除外）；不用 `ease-in-out` 做 UI 过渡。
- 高频工作区避免回弹；有依据的低频反馈可用受控弹性，不延迟操作。
- 业务系统单次动效不超过 400ms。用户一天触发几百次，每多 100ms 都在收税。

## 3. 语义行为表

场景默认值，不是每页必须收齐的清单。工程要求：可中断、不阻塞业务、降级后终态与反馈一致。

| 语义 | 行为 | 时长 | 曲线 | 中断与降级 |
|---|---|---|---|---|
| 按下 | `translateY(1px)` 或 `scale(0.98)` | 80–120ms | standard | 松开立即复位；reduce 时仅状态色 |
| Hover | 背景 / 边框色变化，不做位移 | 100–150ms | standard | 离开回起点 |
| Focus | 焦点环 `opacity 0→1` | 100ms | standard | — |
| 列表底色 | 选中 / 完成，普通底 → 语义底 | 150ms | standard | 新状态覆盖旧动画；保留文本状态 |
| Tab / 导航指示 | 旧位置 → 新位置 | 150–220ms | snappy | 以最新选择为准；reduce 直接定位，URL / 内容先成为事实 |
| 弹窗 | `opacity 0→1` + `scale .96→1` | 220 / 150ms | snappy / exit | 快速关闭无残留遮罩；焦点与 modal 状态不等待动画 |
| 抽屉 / Sheet | `translateX(100%)→0` 或上滑 | 320 / 220ms | snappy / exit | 取消未完成动画 |
| 展开 / 收起 | `grid-template-rows 0fr→1fr` + `opacity` | 200–260ms | snappy | 收起取消未完动画；reduce 直接展开并保留焦点 |
| 列表插入 | `opacity 0→1` + `translateY(-4px)→0` + 背景高亮淡出 | 300ms | snappy | — |
| 列表删除 | 高度塌缩 + `opacity→0`，其余行平滑上移 | 200ms | exit | — |
| Toast | 滑入 + 淡入；退出反向 | 180 / 140ms | snappy / exit | — |
| 进度插值 | 真实进度前值 → 新值 | 220ms | standard | 新值接管，失败暂停；不能伪造进度 |
| 骨架屏 | 微光扫过，无限循环 | 1400ms | linear | reduce 改静态占位 |
| 数值变化 | 高亮闪烁一次 | 400ms | standard | 高亮属于信息，reduce 保留 |

明确禁止：列表行 hover 位移 / 放大（行在跳动）；卡片 hover 上浮 8px + 阴影扩散；表格行整行缩放；路由整屏滑动；任何无限循环（骨架屏除外）；自动轮播；首屏整屏入场。

## 4. 性能约束

```css
.ui-anim {
  transition: transform var(--ui-duration-fast) var(--ui-ease-standard),
              opacity var(--ui-duration-fast) var(--ui-ease-standard);
}
```

- 优先 `transform` 与 `opacity`；颜色过渡、受控内容展开和真实数据图形长度是明确例外，尺寸变化需限制作用范围并测量。
- 高度展开用 `grid-template-rows: 0fr → 1fr` 或设定上限的 `max-height`；阴影变化用 `::after` 叠层过渡 `opacity`。
- `will-change` 只在动效即将开始时加，结束后移除。
- 禁止用 `scroll` 事件监听做动画——用 `IntersectionObserver` 或 CSS `animation-timeline`。
- 高频工作区默认同时显著运动不超过 2 处。
- 帧预算：5 年前的办公电脑保持 60fps；测不出来就做保守选择。

## 5. reduced-motion（强制）

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

降级后必须仍保留状态变化的可感知性：把位移 / 缩放改成透明度变化或静态呈现 + 高亮。JS 驱动动画（Vue Transition / WAAPI / GSAP）必须读 `matchMedia('(prefers-reduced-motion: reduce)')` 并短路。

```vue
<script setup lang="ts">
import { shallowRef, onMounted, onUnmounted } from 'vue'

const reduce = shallowRef(false)
let mq: MediaQueryList | undefined
onMounted(() => {
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduce.value = mq.matches
  mq.addEventListener('change', onMq)
})
onUnmounted(() => mq?.removeEventListener('change', onMq))
function onMq(e: MediaQueryListEvent) { reduce.value = e.matches }
</script>

<template>
  <Transition :name="reduce ? 'fade' : 'slide-up'">
    <slot />
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 150ms var(--ui-ease-standard); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active { transition: opacity 220ms var(--ui-ease-snappy), transform 220ms var(--ui-ease-snappy); }
.slide-up-leave-active { transition: opacity 150ms var(--ui-ease-exit), transform 150ms var(--ui-ease-exit); }
.slide-up-enter-from { opacity: 0; transform: translateY(8px); }
.slide-up-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
```

## 6. 加载与占位

| 场景 | 正确做法 | 错误做法 |
|---|---|---|
| 首屏表格 | 骨架屏，行高与列宽匹配真实数据 | 居中转圈 |
| 局部刷新 | 表格自身遮罩 + 轻量指示，保留旧数据 | 整页 Loading，数据全部消失 |
| 按钮提交 | 按钮内联 loading，宽度不变 | 全局遮罩 |
| 长任务 | 有真实进度才显示百分比；否则说明阶段与可中断入口 | 编造进度与剩余时间 |
| 图片 | 固定宽高比占位，避免 CLS | 加载后撑开布局 |

## 7. 自检

| # | 检查 | 判据 |
|---|---|---|
| 1 | 动机 | 每个动画能归类到层级 / 叙事 / 反馈 / 状态之一 |
| 2 | 属性 | 优先 `transform` / `opacity`；例外有范围与性能依据 |
| 3 | 时长 | 单次 ≤ 400ms；退场 < 进场 |
| 4 | 曲线 | 来自令牌，无随手 `ease` |
| 5 | 降级 | `prefers-reduced-motion` 下有替代呈现 |
| 6 | 负载 | 高频工作区显著运动 ≤ 2 |
| 7 | 无循环 | 除骨架屏外零无限循环 |
| 8 | 清理 | JS 动画在组件卸载时被清理 |

验收走真实 click / keyboard / media 事件，等待明确完成信号；不以类名存在或固定延时证明通过。正常、页面关闭动效和系统 reduced-motion 分别验证。
