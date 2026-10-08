<!-- 审计样本：故意包含若干可机械检出的问题，用于验证 scan-project.mjs。
     期望值写在 tools/scan-project.mjs 的 SELF_TEST_EXPECT 里（按设计意图手工确定）。 -->
<template>
  <div class="page">
    <h1 class="title">患者列表</h1>

    <!-- 占位文案：1 处 -->
    <table>
      <tr>
        <td>张三</td>
        <td>2024-09-15</td>
      </tr>
    </table>

    <!-- 非交互元素绑点击：1 处 -->
    <div class="row" @click="openDetail">
      <span class="icon">🔥</span>
      <span>查看详情</span>
    </div>

    <button type="button" class="btn">新建患者</button>
  </div>
</template>

<script setup>
function openDetail() {}
</script>

<style scoped>
/* 硬编码颜色：3 处 */
.title {
  color: #3b82f6;
  letter-spacing: -0.02em; /* 中文负字距：1 处 */
}
.card {
  background: #f5f5f5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  padding: 13px; /* 硬编码间距：2 处（另一处是下面的 font-size） */
  font-size: 15px;
  font-family: Inter, sans-serif; /* 缺中文回退：1 处 */
  transition: all 0.3s; /* transition: all：1 处 */
  outline: none; /* outline: none：1 处 */
  display: flex !important; /* !important：1 处 */
  z-index: 9999; /* z-index 硬编码：1 处 */
}
</style>
