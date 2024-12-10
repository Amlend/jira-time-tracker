<template>
  <div>
    <BaseButton
      id="log-time-button"
      buttonType="primary"
      displayText="Add permission role"
      @click="open = true"
      :icon="PlusIcon"
    ></BaseButton>
    <el-dialog
      v-model="open"
      :show-close="false"
      :close-on-click-modal="false"
      :modal="true"
      :append-to-body="true"
      class="log-time-dialog"
      width="500px"
    >
      <div class="modal-content">
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="select-container">
              <h2 class="modal-title">Add permission role</h2>
              <el-select
                v-model="selectedUser"
                class="time-dropdown custom-select flex-item w-100"
                popper-class="time-dropdown-popper"
                :fit-input-width="false"
                placeholder="Choose user"
              />

              <el-select
                v-model="selectedRole"
                class="time-dropdown custom-select flex-item w-100"
                popper-class="time-dropdown-popper"
                :fit-input-width="false"
                placeholder="Choose role"
              />

              <div v-for="(row, index) in permissions" :key="index">
                <div v-if="row.items">
                  <strong class="permission-label">{{ row.category }}</strong>
                  <div
                    v-for="item in row.items"
                    :key="item.label"
                    class="permission-sub-label"
                  >
                    <div class="permission-checkbox">
                      <el-checkbox
                        v-model="item.checked"
                        :disabled="item.disabled"
                      ></el-checkbox
                      >&nbsp;{{ item.label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="button-row">
              <button class="cancel-button" @click="handleCancel">
                Cancel
              </button>
              <button class="log-time-button" type="submit">Save</button>
            </div>
          </form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElSelect } from "element-plus";
import { defineProps, ref } from "vue";
import BaseButton from "/components/ui-components/BaseButton.vue";
import PlusIcon from "/public/icons/plus-circle.svg";
const props = defineProps({
  permissions: Array,
});
const open = ref(false);
const selectedUser = ref("");
const selectedRole = ref("");
const permissions = ref(props.permissions.filter((i) => i.items?.length));
const handleSubmit = () => {
  handleCancel();
};
const handleCancel = () => {
  open.value = false;
};
</script>
<style scoped>
.el-dialog {
  width: 35%;
  max-width: 500px;
  border-radius: 6px;
  overflow: scroll;
}
.modal-title {
  font-size: 24px;
  color: #172b4d;
  margin: 0;
  font-weight: 500;
}
.modal-body {
  padding: 20px 30px;
  background-color: #ffffff;
}
.select-container {
  gap: 24px;
  display: grid;
}
.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.cancel-button,
.log-time-button {
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.cancel-button {
  background-color: rgba(9, 30, 66, 0.04);
  color: #42526e;
}
.cancel-button:hover {
  background-color: rgba(9, 30, 66, 0.08);
}
.log-time-button {
  background-color: #0052cc;
  color: #ffffff;
}
.log-time-button:hover {
  background-color: #0065ff;
}
.log-time-button:active {
  background-color: #0047b3;
}
@media (max-width: 768px) {
  .el-dialog {
    width: 90%;
    max-width: none;
    margin: 20px auto;
  }
  .modal-body {
    padding: 16px 20px;
  }
  .modal-title {
    font-size: 20px;
  }
}
.permission-label {
  margin-bottom: 20px;
  display: flex;
}
.permission-sub-label:not(:last-child) {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.permission-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
}
.w-100 {
  width: 100%;
}
</style>
