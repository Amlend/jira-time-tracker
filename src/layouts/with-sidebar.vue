<template>
  <div class="layout-with-sidebar">
    <Sidebar class="sidebar" />
    <div class="main-content">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
</script>

<style scoped>
.layout-with-sidebar {
  display: flex;
}
.sidebar {
  width: 60px;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background-color: #f4f5f7;
  border-right: 1px solid #e2e8f0;
  z-index: 10;
}
.main-content {
  flex: 1;
  padding-left: 53px;
}
</style>
