<template>
  <div class="settings-container">
    <h1 class="settings-title">Settings</h1>

    <div class="main-layout">
      <div class="sidebar">
        <div
          class="menu-item"
          :class="{ active: activeMenu === 'logging' }"
          @click="activeMenu = 'logging'"
        >
          Logging time
        </div>
        <div
          class="menu-item"
          :class="{ active: activeMenu === 'roles' }"
          @click="activeMenu = 'roles'"
        >
          Roles
        </div>
        <div
          class="menu-item"
          :class="{ active: activeMenu === 'permissions' }"
          @click="activeMenu = 'permissions'"
        >
          Permission roles
        </div>
      </div>

      <div class="content-area">
        <div v-if="activeMenu === 'logging'" class="content-wrapper">
          <h2 class="content-title">Logging time</h2>
          <p class="content-description">
            You can customize the options presented to your users when logging
            time
          </p>

          <el-form :model="settings">
            <div class="select-group">
              <div class="select-wrapper">
                <label
                  >Users can log time upto this number of days into the
                  future:</label
                >
                <el-select v-model="settings.futureDays" class="custom-select">
                  <el-option label="90 Days" value="90" />
                  <el-option label="60 Days" value="60" />
                  <el-option label="30 Days" value="30" />
                </el-select>
              </div>

              <div class="select-wrapper">
                <label>Maximum hours per day per user:</label>
                <el-select v-model="settings.maxHours" class="custom-select">
                  <el-option label="6 Hours" value="6" />

                  <el-option label="8 Hours" value="8" />
                  <el-option label="10 Hours" value="10" />
                  <el-option label="12 Hours" value="12" />
                  <el-option label="20 Hours" value="20" />
                </el-select>
              </div>
            </div>
          </el-form>
        </div>
        <div v-else><PermissionRoles /></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import PermissionRoles from "/components/settings/PermissionRoles.vue";
definePageMeta({
  layout: "with-sidebar",
});
const activeMenu = ref("logging");
const settings = ref({
  remainingEstimate: true,
  worklogDescription: true,
  closedAccounts: true,
  futureDays: "90",
  maxHours: "20 Hours",
});
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: calc(100vw-50px);
  overflow: hidden;
}
.settings-title {
  font-size: 20px;
  font-weight: 600;
  color: #1d2939;
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #eaecf0;
  flex-shrink: 0;
}
.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.sidebar {
  width: 240px;
  background: #f9fafb;
  border-right: 1px solid #eaecf0;
  padding: 12px 8px;
  overflow-y: auto;
  flex-shrink: 0;
  height: 85vh;
}
.menu-item {
  padding: 8px 12px;
  margin: 4px 0;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  color: #344054;
  transition: all 0.2s;
}
.menu-item:hover {
  background: #f3f4f6;
}
.menu-item.active {
  background: #f3f4f6;
  color: #1d6aff;
  font-weight: 500;
}
.content-area {
  flex: 1;
  background: #ffffff;
  overflow-y: auto;
}
.content-wrapper {
  padding: 24px 32px;
  height: 100%;
}
.content-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2939;
  margin: 0 0 8px 0;
}
.content-description {
  font-size: 14px;
  color: #475467;
  margin: 0 0 24px 0;
  padding-bottom: 24px;
  border-bottom: 1px solid #eaecf0;
}
.select-group {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.select-wrapper label {
  font-size: 14px;
  color: #344054;
}
.custom-select {
  width: 160px;
  padding-left: 8px;
}
:deep(.el-select .el-input__wrapper) {
  background: #ffffff;
  border: 1px solid #d0d5dd;
  box-shadow: none !important;
  border-radius: 8px;
  padding: 8px 12px;
}
:deep(.el-select .el-input__wrapper:hover) {
  border-color: #1d6aff;
}
:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #1d6aff;
  box-shadow: 0 0 0 4px rgba(29, 106, 255, 0.1) !important;
}
:deep(.el-select .el-input__inner) {
  font-size: 14px;
  color: #344054;
}
:deep(.el-select-dropdown__item) {
  font-size: 14px;
  color: #344054;
  padding: 8px 12px;
}
:deep(.el-select-dropdown__item.selected) {
  color: #1d6aff;
  font-weight: 500;
}
:deep(.el-select-dropdown__item:hover) {
  background: #f9fafb;
}
</style>
