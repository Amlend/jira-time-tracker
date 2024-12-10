<template>
  <el-button
    :type="buttonType ? buttonType : 'primary'"
    class="button-txt-center"
    :id="id"
    :native-type="type"
    :class="buttonClass"
    :disabled="disabled || loading"
    style="position: relative"
  >
    <template v-if="icon">
      <img :class="iconClass" :src="icon" class="button-prefix-icon" />
    </template>
    <span class="button-text">
      {{ loading ? loadingText || displayText : displayText }}
    </span>
  </el-button>
</template>

<script lang="ts" setup>
import { ElButton } from "element-plus";
const props = defineProps<{
  id?: string;
  buttonType?: string;
  buttonClass?: string;
  type?: string;
  icon?: any;
  iconClass?: string;
  loading?: boolean;
  disabled?: boolean;
  displayText: string;
  loadingText?: string;
}>();
</script>

<style scoped>
.button-txt-center {
  display: flex;
  justify-content: center;
}
.button-text-margin {
  margin-right: 15px;
  margin-left: 15px;
}
.button-text {
  display: flex;
  align-items: center;
  column-gap: 12px;
}
.el-button,
.el-button:focus,
.el-button:hover,
.el-button.is-disabled,
.el-button.is-disabled:focus,
.el-button.is-disabled:hover {
  border-color: transparent !important;
  background-color: #0052cc;
  color: #ffffff;
  font-weight: 500;
  font-size: 14px;
}
.button-prefix-icon {
  margin-right: 4px;
}
</style>
