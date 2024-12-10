<template>
  <div class="filter-bar">
    <DateRangePick @dateRange="updateSelectedDate"></DateRangePick>
    <div class="group-by-wrapper">
      <span class="group-by-label">Group by</span>
      <div class="custom-select">
        <el-tree-select
          v-model="treeValue"
          :data="data"
          multiple
          :render-after-expand="false"
          style="width: 500px"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { addMonths, format, subMonths } from "date-fns";
import { computed, ref, watch } from "vue";
import DateRangePick from "./DateRangePick.vue";
const emit = defineEmits(["dateRange"]);
const props = defineProps({
  onRangeChange: {
    type: Function,
    required: true,
  },
});
const data = [
  {
    value: "jiraFields",
    label: "Jira Fields",
    children: [
      {
        value: "assignee",
        label: "Assignee",
      },
      {
        value: "components",
        label: "Components",
      },
      {
        value: "epic",
        label: "Epic",
      },
      {
        value: "fixVersions",
        label: "Fix Versions",
      },
      {
        value: "issue",
        label: "Issue",
      },
      {
        value: "issueType",
        label: "Issue Type",
      },
      {
        value: "labels",
        label: "Labels",
      },
      {
        value: "priority",
        label: "Priority",
      },
      {
        value: "project",
        label: "Project",
      },
      {
        value: "projectCategory",
        label: "Project Category",
      },
      {
        value: "projectLead",
        label: "Project Lead",
      },
      {
        value: "projectType",
        label: "Project Type",
      },
      {
        value: "reporter",
        label: "Reporter",
      },
      {
        value: "resolution",
        label: "Resolution",
      },
      {
        value: "status",
        label: "Status",
      },
      {
        value: "subTask",
        label: "Sub-task",
      },
    ],
  },
];

const selectedDate = ref([new Date(), new Date()]);
const treeValue = ref(["issue"]);
const groupBy = ref("issues");
const showPicker = ref(false);
const dateRange = ref(null);

watch(treeValue, (newValue) => {
  if (newValue.length === 0) {
    treeValue.value = ["issue"];
  }
});

const onPrevMonth = () => {
  selectedDate.value = selectedDate.value.map((date) => subMonths(date, 1));
  updateDateRange();
};
const onNextMonth = () => {
  selectedDate.value = selectedDate.value.map((date) => addMonths(date, 1));
  updateDateRange();
};
const handleDateChange = () => {
  updateDateRange();
  showPicker.value = false;
};
const updateDateRange = () => {
  props.onRangeChange(dateRange.value);
};

const updateSelectedDate = (newValue) => {
  dateRange.value = newValue;
  emit("dateRange", newValue);
};
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  margin: 15px 0px;
  margin-top: -25px;
  position: relative;
}
.date-range-container {
  display: flex;
  align-items: center;
}
:deep(.calendar-button) {
  border: 1px solid var(--el-border-color);
  height: 32px;
  padding: 10px 8px;
  color: var(--el-text-color-regular);
  background-color: var(--el-bg-color);
}
:deep(.calendar-button .el-icon) {
  font-size: 14px;
}
:deep(.left-calendar-button) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
:deep(.right-calendar-button) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.calendar-icon {
  position: absolute;
  left: 8px;
  z-index: 1;
  width: 16px;
  height: 16px;
  pointer-events: none;
}
:deep(.date-input .el-input__wrapper) {
  padding-left: 32px;
  border-radius: 0;
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}
:deep(.date-input .el-input__inner) {
  cursor: pointer;
  height: 32px;
  color: var(--neutral-light-n-500, #42526e);
  font-family: Rubik;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
}
.hidden-date-picker {
  width: 320px;
}
.group-by-wrapper {
  display: flex;
  align-items: center;
  margin-left: 30px;
}
.group-by-label {
  margin-right: 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
.custom-select {
  position: relative;
  display: inline-block;
}
:deep(.group-by-select) {
  width: 130px;
}
:deep(.group-by-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}
:deep(.group-by-select .el-input__inner) {
  height: 32px;
  line-height: 32px;
  font-size: 14px;
}
.dropdown-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  width: 14px;
  height: 14px;
}
:deep(.el-select .el-input__suffix) {
  display: none;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}
</style>
