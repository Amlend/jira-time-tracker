<template>
  <div class="date-range-picker">
    <el-card
      class="picker-container"
      ref="pickerRef"
      :body-style="{ padding: '0px' }"
    >
      <div class="date-headers">
        <div class="date-header">
          <div class="header-label">Start date</div>
          <div class="date-display" :class="{ placeholder: !selectedRange[0] }">
            {{ formatDisplayDate(selectedRange[0]) || "MM/DD/YYYY" }}
            <el-icon><Calendar /></el-icon>
          </div>
        </div>
        <div class="date-header">
          <div class="header-label">End date</div>
          <div class="date-display" :class="{ placeholder: !selectedRange[0] }">
            {{ formatDisplayDate(selectedRange[1]) || "MM/DD/YYYY" }}
            <el-icon><Calendar /></el-icon>
          </div>
        </div>
      </div>

      <div class="picker-content">
        <div class="calendars-container">
          <div class="month-navigation">
            <el-button
              text
              :icon="ArrowLeft"
              @click="previousMonth"
              class="nav-button"
            />
            <span class="month-label">{{ formatMonthYear(currentMonth) }}</span>
            <span class="month-label next-month">{{
              formatMonthYear(nextMonth)
            }}</span>
            <el-button
              text
              :icon="ArrowRight"
              @click="nextMonthClick"
              class="nav-button"
            />
          </div>

          <div class="calendars-wrapper">
            <el-calendar v-model="currentMonth" class="custom-calendar">
              <template #header>
                <div class="calendar-header">
                  <div v-for="day in weekDays" :key="day" class="week-day">
                    {{ day }}
                  </div>
                </div>
              </template>
              <template #date-cell="{ data }">
                <div
                  :class="[
                    'date-cell',
                    isInRange(data) ? 'in-range' : '',
                    isStartDate(data) ? 'start-date' : '',
                    isEndDate(data) ? 'end-date' : '',
                    isDisabled(data) ? 'disabled' : '',
                  ]"
                  @click="handleDateClick(data)"
                >
                  {{ data.day.split("-")[2] }}
                </div>
              </template>
            </el-calendar>

            <el-calendar v-model="nextMonth" class="custom-calendar">
              <template #header>
                <div class="calendar-header">
                  <div v-for="day in weekDays" :key="day" class="week-day">
                    {{ day }}
                  </div>
                </div>
              </template>
              <template #date-cell="{ data }">
                <div
                  :class="[
                    'date-cell',
                    isInRange(data) ? 'in-range' : '',
                    isStartDate(data) ? 'start-date' : '',
                    isEndDate(data) ? 'end-date' : '',
                    isDisabled(data) ? 'disabled' : '',
                  ]"
                  @click="handleDateClick(data)"
                >
                  {{ data.day.split("-")[2] }}
                </div>
              </template>
            </el-calendar>
          </div>
        </div>

        <div class="shortcuts-section">
          <el-button
            v-for="(item, index) in shortcutsItems"
            :key="index"
            text
            size="large"
            class="shortcut-button"
            :type="item.active ? 'primary' : ''"
            @click="applyShortcut(item)"
          >
            {{ item.label }}
          </el-button>

          <div class="custom-days">
            <el-input
              v-model.number="customDays"
              :min="0"
              type="number"
              size="large"
              class="days-input"
              placeholder="0"
            />
            <el-button
              text
              size="large"
              class="days-button"
              @click="applyCustomDays"
            >
              Days
            </el-button>
          </div>
        </div>
        <div class="action-buttons">
          <div class="cancel">
            <el-button text size="large" @click="handleCancel">
              Cancel
            </el-button>
          </div>
          <div class="apply">
            <BaseButton
              id="log-time-button"
              buttonType="primary"
              displayText="Apply"
              @click="open = true"
              :icon="PlusIcon"
            ></BaseButton>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight, Calendar } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { computed, onMounted, ref, watch } from "vue";
import BaseButton from "/components/ui-components/BaseButton.vue";
dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [null, null],
  },
  initialRange: {
    type: Object,
    default: () => ({
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
    }),
  },
});
const emit = defineEmits(["update:modelValue", "change"]);
const pickerRef = ref(null);
const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const selectedRange = ref([null, null]);
const customDays = ref("");
const currentMonth = ref(dayjs().toDate());
const nextMonth = computed(() =>
  dayjs(currentMonth.value).add(1, "month").toDate()
);
onMounted(() => {
  if (props.initialRange) {
    selectedRange.value = [
      dayjs(props.initialRange.startDate).toDate(),
      dayjs(props.initialRange.endDate).toDate(),
    ];
  }
});
watch(customDays, (newValue) => {
  if (newValue > 0) {
    const startDate = dayjs().startOf("day");
    const endDate = startDate.add(Number(newValue) - 1, "days");
    selectedRange.value = [startDate.toDate(), endDate.toDate()];
  }
});
const shortcutsItems = [
  {
    label: "This Week",
    getValue: () => {
      const today = dayjs();
      return [today.startOf("week"), today.endOf("week")];
    },
    active: false,
  },
  {
    label: "Last Week",
    getValue: () => {
      const today = dayjs();
      return [
        today.subtract(1, "week").startOf("week"),
        today.subtract(1, "week").endOf("week"),
      ];
    },
    active: false,
  },
  {
    label: "Current Month",
    getValue: () => {
      const today = dayjs();
      return [today.startOf("month"), today.endOf("month")];
    },
    active: false,
  },
  {
    label: "Next Month",
    getValue: () => {
      const today = dayjs();
      return [
        today.add(1, "month").startOf("month"),
        today.add(1, "month").endOf("month"),
      ];
    },
    active: false,
  },
  {
    label: "This Quarter",
    getValue: () => {
      const today = dayjs();
      return [today.startOf("quarter"), today.endOf("quarter")];
    },
    active: false,
  },
  {
    label: "Last Quarter",
    getValue: () => {
      const today = dayjs();
      return [
        today.subtract(1, "quarter").startOf("quarter"),
        today.subtract(1, "quarter").endOf("quarter"),
      ];
    },
    active: false,
  },
];
const formatDisplayDate = (date) => {
  return date ? dayjs(date).format("M/D/YYYY") : "";
};
const formatMonthYear = (date) => {
  return dayjs(date).format("MMMM YYYY");
};
const isInRange = (data) => {
  if (!selectedRange.value[0] || !selectedRange.value[1]) return false;
  const date = dayjs(data.day);
  return (
    date.isAfter(dayjs(selectedRange.value[0]), "day") &&
    date.isBefore(dayjs(selectedRange.value[1]), "day")
  );
};
const isStartDate = (data) => {
  if (!selectedRange.value[0]) return false;
  return dayjs(data.day).isSame(dayjs(selectedRange.value[0]), "day");
};
const isEndDate = (data) => {
  if (!selectedRange.value[1]) return false;
  return dayjs(data.day).isSame(dayjs(selectedRange.value[1]), "day");
};
const isDisabled = (data) => {
  return false;
};
const handleDateClick = (data) => {
  const clickedDate = dayjs(data.day).toDate();
  if (
    !selectedRange.value[0] ||
    (selectedRange.value[0] && selectedRange.value[1])
  ) {
    selectedRange.value = [clickedDate, null];
  } else {
    if (dayjs(clickedDate).isBefore(selectedRange.value[0])) {
      selectedRange.value = [clickedDate, selectedRange.value[0]];
    } else {
      selectedRange.value = [selectedRange.value[0], clickedDate];
    }
  }
};
const previousMonth = () => {
  currentMonth.value = dayjs(currentMonth.value).subtract(1, "month").toDate();
};
const nextMonthClick = () => {
  currentMonth.value = dayjs(currentMonth.value).add(1, "month").toDate();
};
const applyShortcut = (shortcut) => {
  shortcutsItems.forEach((item) => (item.active = false));
  shortcut.active = true;
  const [start, end] = shortcut.getValue();
  selectedRange.value = [start.toDate(), end.toDate()];
};
const applyCustomDays = () => {
  if (customDays.value > 0) {
    const startDate = dayjs().startOf("day");
    const endDate = startDate.add(Number(customDays.value) - 1, "days");
    selectedRange.value = [startDate.toDate(), endDate.toDate()];
  }
};
const handleOk = () => {
  if (selectedRange.value[0] && selectedRange.value[1]) {
    emit("update:modelValue", selectedRange.value);
    emit("change", selectedRange.value);
  }
};
const handleCancel = () => {
  selectedRange.value = [null, null];
  emit("update:modelValue", [null, null]);
};
</script>

<style scoped>
.date-range-picker {
  position: relative;
  z-index: 1000;
}
.picker-container {
  width: 800px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin: 75px;
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 24px;
  gap: 12px;
  position: relative;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 250px;
  padding-top: 24px;
  margin-right: -24px;
  margin-left: -250px;
  padding-left: 24px;
  padding-right: 24px;
}
.date-headers {
  display: flex;
  gap: 64px;
  padding: 24px;
  padding-left: 30px;
  padding-top: 10px;
}
.header-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.date-display {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--neutral-light-n-100, #7a869a);
  font-family: Rubik;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  padding-left: 8px;
  color: var(--el-text-color-primary);
  min-height: 35px;
  width: 230px;
  border: 1px solid#f4f5f7;
  background-color: #f4f5f7;
}
.date-display.placeholder {
  color: var(--el-text-color-placeholder);
  color: var(--neutral-light-n-100, #7a869a);
}
.picker-content {
  display: flex;
  padding: 24px;
  gap: 32px;
  padding-top: 0px;
}
.calendars-container {
  flex: 1;
}
.month-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.month-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.next-month {
  margin-left: 200px;
}
.calendars-wrapper {
  display: flex;
  gap: 32px;
  width: 550px;
}
.custom-calendar {
  flex: 1;
  border: none;
}
.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 16px;
}
.week-day {
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 8px 0;
}
.date-cell {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  font-size: 14px;
  transition: all 0.3s;
}
.date-cell:hover {
  background-color: var(--el-fill-color-light);
}
.in-range {
  background: var(--Blue-B50, #deebff);
  color: var(--neutral-light-n-800, #172b4d);
}
.start-date,
.end-date {
  background: var(--neutral-light-n-500, #42526e);
  color: white;
  border-radius: 4px;
}
.shortcuts-section {
  width: 200px;
  display: flex;
  flex-direction: column;
  margin-top: -40px;
  padding-left: 20px;
  position: relative;
  align-items: start;
}
.shortcut-button {
  text-align: left;
  height: 36px;
  font-size: 14px;
  margin-bottom: 8px;
}
.shortcut-button:hover {
  color: var(--el-color-primary);
}
.custom-days {
  display: flex;
  align-items: center;
  margin-top: 16px;
  margin-left: 22px;
  gap: 8px;
}
.days-input {
  width: 60px;
  height: 40px;
}
.days-input :deep(.el-input__wrapper) {
  padding: 0 8px;
}
.days-input :deep(.el-input__inner) {
  text-align: center;
  font-size: 14px;
}
.days-button {
  color: var(--el-color-primary);
  color: var(--neutral-light-n-800, #172b4d);
  font-family: Rubik;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
}
.date-range-picker {
  position: relative;
  z-index: 1000;
}
.picker-container {
  width: 800px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 280px;
  width: 200px;
  margin-left: -250px;

  position: relative;
}
:deep(.el-calendar-table .el-calendar-day) {
  height: 36px;
  padding: 0;
}
:deep(.el-calendar__header) {
  display: none;
  color: var(--neutral-light-n-200, #6b778c);
  text-align: center;
  font-family: Rubik;
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
  line-height: 16px;
}
:deep(.el-calendar-table td) {
  border: none;
}
:deep(.el-calendar) {
  padding: 0;
}
:deep(.el-calendar__body) {
  padding: 12px 0px 35px;
}
.start-date::after {
  content: "Start";
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--el-color-primary-dark-2);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.end-date::after {
  content: "End";
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--el-color-primary-dark-2);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.start-date:hover::after,
.end-date:hover::after {
  opacity: 1;
}
.shortcut-button {
  text-align: left;
  height: 32px;
  font-size: 14px;
  margin-bottom: 4px;
  color: var(--Blue-B400, #0052cc);
  text-align: center;
  font-family: Rubik;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
}
.header-label {
  margin-bottom: 8px;
  color: var(--neutral-light-n-200, #6b778c);
  font-family: Rubik;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;
}
.month-label,
.month-label next-month {
  color: var(--neutral-light-n-800, #172b4d);
  text-align: center;
  font-family: Rubik;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 16px;
}
.custom-days {
  display: flex;
  align-items: center;
  margin-top: 8px;
  gap: 8px;
  color: var(--Blue-B400, #0052cc);
}
.action-buttons[data-v-8ab8bb9d] {
  border-top: none !important;
}
:deep(.el-calendar) {
  --el-calendar-border: none;
}
</style>
