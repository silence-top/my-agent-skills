<!-- 干净样本：必须零违规，用于验证规则不会误报 -->
<template>
  <section class="card">
    <h2 class="card__title">待审核报告</h2>
    <p class="card__desc">共 128 份，最早一份为 2024-09-14。</p>
    <button type="button" class="card__action" @click="open">打开列表</button>
  </section>
</template>

<script setup>
function open() {}
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-3);
  padding: var(--ui-space-6);
  border: 1px solid var(--ui-stroke);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-surface);
  color: var(--ui-text-primary);
  transition:
    border-color var(--ui-duration-fast) var(--ui-ease-standard),
    box-shadow var(--ui-duration-fast) var(--ui-ease-standard);
}
.card:hover {
  border-color: var(--ui-brand);
  box-shadow: var(--ui-shadow-md);
}
.card__title {
  margin: 0;
  font-size: var(--ui-text-lg);
  font-weight: var(--ui-weight-semibold);
  line-height: var(--ui-leading-snug);
  letter-spacing: 0;
}
.card__desc {
  margin: 0;
  font-size: var(--ui-text-sm);
  color: var(--ui-text-secondary);
}
.card__action {
  align-self: flex-start;
  min-height: var(--ui-control-height-md);
  padding: 0 var(--ui-space-4);
  border: 1px solid var(--ui-brand);
  border-radius: var(--ui-radius-md);
  background: var(--ui-brand);
  color: var(--ui-text-inverse);
  cursor: pointer;
}
.card__action:focus-visible {
  outline: 2px solid var(--ui-brand);
  outline-offset: 2px;
}
</style>
