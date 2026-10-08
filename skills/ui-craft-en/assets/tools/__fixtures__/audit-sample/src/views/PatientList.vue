<!-- Audit fixture: intentionally contains mechanically detectable problems.
     Expected counts are manually defined in SELF_TEST_EXPECT in scan-project.mjs. -->
<template>
  <div class="page">
    <h1 class="title">Patient list</h1>

    <!-- Placeholder copy: one instance. -->
    <table>
      <tr>
        <td>John Doe</td>
        <td>2024-09-15</td>
      </tr>
    </table>

    <!-- Click on a non-interactive element: one instance. -->
    <div class="row" @click="openDetail">
      <span class="icon">🔥</span>
      <span>View details</span>
    </div>

    <button type="button" class="btn">Create patient</button>
  </div>
</template>

<script setup>
function openDetail() {}
</script>

<style scoped>
/* Three hard-coded colors. */
.title {
  color: #3b82f6;
  letter-spacing: -0.02em; /* One negative tracking instance. */
}
.card {
  background: #f5f5f5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  padding: 13px; /* Two off-scale values, including font-size below. */
  font-size: 15px;
  font-family: Inter, sans-serif; /* One missing CJK fallback. */
  transition: all 0.3s; /* One transition: all instance. */
  outline: none; /* One outline reset. */
  display: flex !important; /* One !important instance. */
  z-index: 9999; /* One hard-coded z-index. */
}
</style>
