<template>
  <div class="date-range-container">
    <el-space :size="0" alignment="center">
      <el-button
        class="calendar-button left-calendar-button"
        @click="navigatePrevious"
      >
        <el-icon><ArrowLeft /></el-icon>
      </el-button>

      <div class="date-input-wrapper">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          unlink-panels
          range-separator=" - "
          format="M/D/YYYY"
          value-format="M/D/YYYY"
          :shortcuts="shortcuts"
          :size="size"
          class="el-date-range-input"
          @change="handleDateChange"
          popper-class="custom-date-picker date-range-custom"
          :clearable="false"
        >
        </el-date-picker>
      </div>

      <el-button
        class="calendar-button right-calendar-button"
        @click="navigateNext"
      >
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </el-space>
  </div>
</template>

<script setup>
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { ref } from "vue";
const emit = defineEmits(["dateRange"]);
const size = ref("default");
const dateRange = ref(null);
const initializeDateRange = () => {
  const today = dayjs();
  const startOfMonth = dayjs(today.startOf("month").toDate()).format(
    "M/D/YYYY"
  );
  const endOfMonth = dayjs(today.endOf("month").toDate()).format("M/D/YYYY");
  dateRange.value = [startOfMonth, endOfMonth];
};
initializeDateRange();
const shortcuts = [
  {
    text: "Current week",
    value: () => [
      dayjs().startOf("week").toDate(),
      dayjs().endOf("week").toDate(),
    ],
  },
  {
    text: "Last week",
    value: () => [
      dayjs().subtract(1, "week").startOf("week").toDate(),
      dayjs().subtract(1, "week").endOf("week").toDate(),
    ],
  },
  {
    text: "Current month",
    value: () => [
      dayjs().startOf("month").toDate(),
      dayjs().endOf("month").toDate(),
    ],
  },
  {
    text: "Last month",
    value: () => [
      dayjs().subtract(1, "month").startOf("month").toDate(),
      dayjs().subtract(1, "month").endOf("month").toDate(),
    ],
  },
  {
    text: "Current quarter",
    value: () => {
      const currentMonth = dayjs().month();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      return [
        dayjs().month(quarterStartMonth).startOf("month").toDate(),
        dayjs()
          .month(quarterStartMonth + 2)
          .endOf("month")
          .toDate(),
      ];
    },
  },
  {
    text: "Last quarter",
    value: () => {
      const currentMonth = dayjs().month();
      const lastQuarterStartMonth = Math.floor((currentMonth - 3) / 3) * 3;
      return [
        dayjs().month(lastQuarterStartMonth).startOf("month").toDate(),
        dayjs()
          .month(lastQuarterStartMonth + 2)
          .endOf("month")
          .toDate(),
      ];
    },
  },
];
const isFullMonth = (start, end) => {
  return (
    dayjs(start).startOf("month").isSame(dayjs(start)) &&
    dayjs(end).endOf("month").isSame(dayjs(end).endOf("day"))
  );
};

const navigatePrevious = () => {
  if (!dateRange.value) return;
  const [start, end] = dateRange.value;

  if (isFullMonth(start, end)) {
    const previousMonthStart = dayjs(start)
      .subtract(1, "month")
      .startOf("month");
    const previousMonthEnd = dayjs(start).subtract(1, "month").endOf("month");
    dateRange.value = [
      previousMonthStart.format("M/D/YYYY"),
      previousMonthEnd.format("M/D/YYYY"),
    ];
  } else {
    const duration = dayjs(end).diff(dayjs(start), "day");
    dateRange.value = [
      dayjs(
        dayjs(start)
          .subtract(duration + 1, "day")
          .toDate()
      ).format("M/D/YYYY"),
      dayjs(dayjs(start).subtract(1, "day").toDate()).format("M/D/YYYY"),
    ];
  }

  emit("dateRange", dateRange.value);
};

const navigateNext = () => {
  if (!dateRange.value) return;
  const [start, end] = dateRange.value;

  if (isFullMonth(start, end)) {
    const nextMonthStart = dayjs(start).add(1, "month").startOf("month");
    const nextMonthEnd = dayjs(start).add(1, "month").endOf("month");
    dateRange.value = [
      nextMonthStart.format("M/D/YYYY"),
      nextMonthEnd.format("M/D/YYYY"),
    ];
  } else {
    const duration = dayjs(end).diff(dayjs(start), "day");
    dateRange.value = [
      dayjs(dayjs(end).add(1, "day").toDate()).format("M/D/YYYY"),
      dayjs(
        dayjs(end)
          .add(duration + 1, "day")
          .toDate()
      ).format("M/D/YYYY"),
    ];
  }

  emit("dateRange", dateRange.value);
};
const handleDateChange = (value) => {
  dateRange.value = value || null;
  emit("dateRange", dateRange.value);
};
</script>

<style scoped>
.date-range-container {
  display: flex;
  align-items: center;
}
.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 280px;
}
.el-date-range-input {
  width: 100%;
}
.calendar-button {
  padding: 9px 12px;
  margin: 0;
  border: 1px solid #dcdfe6;
  background-color: white;
  color: #606266;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.calendar-button:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}
.left-calendar-button {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}
.right-calendar-button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.calendar-button :deep(.el-icon) {
  font-size: 14px;
}
:deep(.custom-date-picker) {
  .el-picker-panel__sidebar {
    width: 110px !important;
    border-right: 1px solid #ebeef5;
    padding: 0;
    margin-right: 8px;
  }
  .el-picker-panel__shortcut {
    color: #0052cc;
    font-weight: 500;
    padding: 8px 12px;
    width: 100%;
    text-align: left;
  }
  .el-picker-panel__footer {
    border-top: 1px solid #ebeef5;
    padding: 8px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .el-button--primary {
    background-color: #0052cc;
  }
  .el-date-range-picker__content {
    padding: 8px;
  }
  .el-date-table th {
    color: #606266;
    font-weight: 600;
  }
  .el-date-table td.current:not(.disabled) .el-date-table-cell__text {
    background-color: #0052cc;
    color: white;
    font-weight: 500;
  }
  .el-date-table td.in-range {
    background-color: #f0f7ff;
  }
  .el-date-table td.start-date .el-date-table-cell__text,
  .el-date-table td.end-date .el-date-table-cell__text {
    background-color: #0052cc;
    color: white;
  }
}
:deep(.el-input__wrapper) {
  padding: 0 8px;
}
:deep(.el-range-separator) {
  color: #606266;
  font-weight: 500;
}
</style>
