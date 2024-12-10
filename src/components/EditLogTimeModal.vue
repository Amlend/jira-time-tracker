<template>
  <div>
    <el-dialog
      width="800px"
      center
      v-model="isDialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :modal="true"
      :append-to-body="true"
      style="padding: 24px 40px 40px 40px"
    >
      <h2 class="modal-title">Edit logged time</h2>
      <el-form>
        <el-row :gutter="25" class="table-header">
          <el-col :span="5"><strong>Date</strong></el-col>
          <el-col :span="4"><strong>User</strong></el-col>
          <el-col :span="4"><strong>Issue</strong></el-col>
          <el-col :span="4"><strong>Description</strong></el-col>
          <el-col :span="4"><strong>Logged time</strong></el-col>
          <el-col :span="3"><strong>Action</strong></el-col>
        </el-row>

        <el-row
          v-for="(entry, index) in entries"
          :key="index"
          :gutter="25"
          class="table-row"
        >
          <el-col :span="5">
            <el-date-picker
              v-model="entry.entryTime"
              type="date"
              placeholder="DD/MMM/YY"
              format="DD/MMM/YY"
              value-format="DD/MMM/YY"
              :clearable="false"
              class="custom-date-picker"
              popper-class="custom-date-popper"
              style="width: auto"
            />
          </el-col>

          <el-col :span="4" class="user-info">
            <el-avatar :src="entry.user.photoUrl" size="small" />
            <span>{{ entry.user.username }}</span>
          </el-col>

          <el-col :span="4">
            <el-input v-model="entry.task.taskKey" placeholder="Issue" />
          </el-col>

          <el-col :span="4">
            <el-input v-model="entry.notes" placeholder="Description" />
          </el-col>

          <el-col :span="4">
            <div class="time-input">
              <el-input
                type="text"
                placeholder="0h"
                v-model="entry.minutes"
                @keydown="isValidTimeInput($event)"
                @focusout="formatTimeInputOnFocusOut(index)"
                id="timeInput"
              />
              <span class="time-icon">
                <img src="public/icons/clock.svg" alt="Clock" />
              </span>
            </div>
          </el-col>

          <el-col :span="3" class="action-buttons">
            <el-button class="left-calendar-button" @click="removeEntry(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <BaseButton displayText="Log time" @click="addEntry"></BaseButton>
        <div class="log-time-button">
          <el-button @click="cancel">Cancel</el-button>
          <BaseButton displayText="Save" @click="save"></BaseButton>
        </div>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Delete } from "@element-plus/icons-vue";
import axios from "axios";
import dayjs from "dayjs";
import {
  ElAvatar,
  ElButton,
  ElCol,
  ElDatePicker,
  ElDialog,
  ElForm,
  ElInput,
  ElRow,
} from "element-plus";
import { defineComponent, ref } from "vue";
import BaseButton from "/components/ui-components/BaseButton.vue";
import helperFunction from "/helper-functions/helperFunctions.js";
export default defineComponent({
  name: "EditLogTimeModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    ElAvatar,
    ElButton,
    ElCol,
    ElDatePicker,
    ElDialog,
    ElForm,
    ElInput,
    ElRow,
    BaseButton,
    Delete,
  },
  emits: ["closeEditModal"],
  setup(props, { emit }) {
    const isDialogVisible = computed(() => props.visible);
    const {
      isValidTimeInput,
      formatTimeInput,
      convertMinutesToHoursAndMinutes,
      convertBackToMinutes,
    } = helperFunction();
    const entryCopy = ref({});
    const entries = ref([]);
    const addEntry = () => {
      let temp = { ...entryCopy.value };
      temp.notes = "";
      temp.minutes = "";
      entries.value.push(temp);
    };
    const removeEntry = (index) => {
      entries.value.splice(index, 1);
    };
    const cancel = () => {
      emit("closeEditModal");
    };
    const save = async () => {
      await axios.put(`api/time/entry/update-one`, {
        timeEntryId: entries.value[0].timeEntryId,
        sourceEntryId: entries.value[0].sourceEntryId,
        taskKey: entries.value[0].task.taskKey,
        minutes: convertBackToMinutes(entries.value[0]?.minutes),
        notes: entries.value[0].notes,
        entryDate: dayjs(entries.value[0].entryTime).format("YYYY-MM-DD"),
      });
      cancel();
    };
    const formatTimeInputOnFocusOut = (i) => {
      entries.value[i].minutes = formatTimeInput(entries.value[i].minutes);
    };

    onMounted(() => getLogDetailsForDay());

    const getLogDetailsForDay = async () => {
      try {
        const response = await axios.get(`/api/time/entry/AT-3`, {
          params: {
            entryDate: "2024-11-6",
          },
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.data || !response.data.data) {
          console.warn("API response is missing 'data':", response.data);
          entries.value = [];
        } else {
          entries.value = Object.values(response.data.data);
        }

        entries.value = entries.value?.map((item) => {
          item.entryTime = dayjs(item.entryTime).format("DD/MMM/YY");
          item.minutes = convertMinutesToHoursAndMinutes(+item.minutes);
          return item;
        });
        if (entries.value?.length) entryCopy.value = entries.value[0];
      } catch (error) {
        console.error("Error fetching table log details:", error);
        entries.value = [];
      }
    };

    return {
      isDialogVisible,
      entries,
      addEntry,
      removeEntry,
      cancel,
      save,
      isValidTimeInput,
      formatTimeInputOnFocusOut,
    };
  },
});
</script>

<style scoped>
.edit-logged-time {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}
.table-header,
.table-row {
  display: flex;
  margin-bottom: 10px;
  padding-bottom: 10px;
}
.table-header {
  border-bottom: 1px solid #ebecf0;
  font-weight: bold;
  color: #333;
}
.table-row:not(:last-child) {
  border-bottom: 1px solid #ebecf0;
}
.user-info {
  display: flex;
  align-items: center;
}
.user-info span {
  margin-right: 4px;
}
.action-buttons {
  display: flex;
  align-items: center;
}
.log-time-button {
  display: inline-flex;
}
.dialog-footer {
  display: flex;
  margin-top: 15px;
  justify-content: space-between;
}
.dialog-footer .el-button:first-child {
  margin-right: 10px;
}
.left-calendar-button {
  border: none;
}
.time-input {
  flex: 1;
}
.search-container,
.time-input,
.description-input {
  position: relative;
}
.search-icon,
.time-icon,
.description-icon,
.calendar-icon {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}
:global(.custom-date-popper .el-picker-panel__icon-btn) {
  display: none !important;
}
:global(.custom-date-popper) {
  --el-datepicker-border-color: #dfe1e6;
  --el-datepicker-inner-border-color: #dfe1e6;
  --el-datepicker-text-color: #172b4d;
  --el-datepicker-off-text-color: #7a869a;
  --el-datepicker-header-text-color: #172b4d;
  border-radius: 3px;
  box-shadow: 0 4px 8px rgba(9, 30, 66, 0.25);
}
.el-col {
  align-content: center;
}
.el-dialog .el-dialog__header {
  align-content: start;
}
.modal-title {
  font-size: 24px;
  color: #172b4d;
  margin: 0;
  font-weight: 500;
  margin-bottom: 24px;
}
</style>
