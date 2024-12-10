<template>
  <div class="topbar">
    <div class="user-info">
      <el-avatar :size="40" :src="userAvatar" />
      <h6 class="user-name">{{ userName }}</h6>
    </div>

    <div class="actions">
      <el-select
        v-model="selectedTime"
        class="time-dropdown custom-select"
        popper-class="time-dropdown-popper"
        :fit-input-width="false"
      >
        <el-option
          v-for="option in timeOptions"
          :key="option"
          :value="option"
          :label="option"
          class="custom-option"
        />
      </el-select>

      <LogTime class="custom-log-button" @log-time="logTime" />

      <el-dropdown placement="bottom-end" id="el-drop-down" trigger="click">
        <el-button class="ellipsis-button custom-ellipsis" @click="toggleMenu">
          <svg viewBox="0 0 24 24" width="24" height="24" class="ellipsis-svg">
            <circle cx="5" cy="12" r="2" fill="black" />
            <circle cx="12" cy="12" r="2" fill="black" />
            <circle cx="19" cy="12" r="2" fill="black" />
          </svg>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu id="el-drop-down-list">
            <span class="dropdown-main-menu">EXPORT TIMESHEET</span>
            <el-dropdown-item @click="ExportPDF">
              <span class="badge">.PDF</span>Report Data
            </el-dropdown-item>
            <el-dropdown-item @click="ExportCSV">
              <span class="badge">.CSV</span>Report Data
            </el-dropdown-item>
            <el-dropdown-item @click="ExportExcel">
              <span class="badge">.XLS</span>Report Data
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import { ref } from "vue";
import LogTime from "./LogTime";
const props = defineProps({
  dateRange: true,
  logData: true,
  totalLogged: true,
});

const dateRangeData = computed(() => props.dateRange);
const userName = ref("Divya Shah");
const userAvatar = ref("");
const selectedTime = ref("Days");
const timeOptions = ["Days", "Weeks", "Months"];
let sharedData = computed(() => props.logData);

// Export to PDF
const ExportPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(
    "Period: " +
      dayjs(dateRangeData.value[0]).format("DD/MMM/YY") +
      " - " +
      dayjs(dateRangeData.value[1]).format("DD/MMM/YY"),
    10,
    10
  );
  doc.text(
    "Total Logged: " + (props.totalLogged / 60).toFixed(2),
    170,
    10,
    null,
    null,
    "right"
  );
  doc.setLineWidth(0.5);
  doc.line(10, 15, 200, 15);

  let yPosition = 25;
  sharedData.value?.forEach((task) => {
    if (task.timeEntries?.length) {
      const totalMinutes = task.timeEntries.reduce(
        (sum, entry) => sum + entry.minutes,
        0
      );
      const totalHours = (totalMinutes / 60).toFixed(2);

      doc.setFontSize(12);
      doc.text(`${task.task_key} - ${task.title}`, 10, yPosition);
      doc.text(totalHours, 190, yPosition, null, null, "right");
      yPosition += 10;

      task.timeEntries.forEach((entry) => {
        const entryDate = new Date(entry.entry_time).toLocaleDateString();
        doc.text(
          `- ${entry.notes} (${entryDate}) by ${entry.username}`,
          15,
          yPosition
        );
        yPosition += 8;
      });
      yPosition += 5;
    }
  });

  doc.save("task_report.pdf");
};

// Export to CSV
const ExportCSV = () => {
  const headers = ["Task ID", "Task Key", "Title", "Total Minutes", "Entries"];
  const rows = sharedData.value
    ?.map((task) => {
      const totalMinutes = task.timeEntries.reduce(
        (sum, entry) => sum + entry.minutes,
        0
      );
      const entriesString = task.timeEntries
        .map(
          (entry) =>
            `${entry.notes} (${(entry.minutes / 60).toFixed(2)} hrs by ${
              entry.username
            })`
        )
        .join(" | ");

      return [
        task.task_id,
        task.task_key,
        task.title,
        (totalMinutes / 60).toFixed(2),
        entriesString,
      ];
    })
    .filter((item) => {
      return item[3] !== "0.00";
    });
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "task_report.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to Excel
const ExportExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Task Report");

  worksheet.columns = [
    { header: "Task ID", key: "task_id", width: 10 },
    { header: "Task Key", key: "task_key", width: 10 },
    { header: "Title", key: "title", width: 30 },
    { header: "Total Minutes", key: "total_minutes", width: 15 },
    { header: "Entries", key: "entries", width: 50 },
  ];

  sharedData.value?.forEach((task) => {
    const totalMinutes = task.timeEntries.reduce(
      (sum, entry) => sum + entry.minutes,
      0
    );
    const entriesString = task.timeEntries
      .map(
        (entry) =>
          `${entry.notes} (${(entry.minutes / 60).toFixed(2)} hrs by ${
            entry.username
          })`
      )
      .join(" | ");

    if (totalMinutes !== 0)
      worksheet.addRow({
        task_id: task.task_id,
        task_key: task.task_key,
        title: task.title,
        total_minutes: totalMinutes,
        entries: entriesString,
      });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "task_report.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 16px;
  background-color: #fff;
}
.user-info {
  display: flex;
  align-items: center;
}
.user-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-left: 8px;
}
.actions {
  display: flex;
  align-items: center;
  padding-right: 16px;
}
.custom-select {
  width: 90px;
}
:deep(.custom-select .el-input) {
  width: 90px;
}
:deep(.custom-select .el-input__wrapper) {
  width: 90px;
  background-color: #f4f5f7;
  border: 1px solid #dfe1e6;
  padding: 8px 12px;
  box-sizing: border-box;
  box-shadow: none;
}
:deep(.custom-select .el-input__wrapper:hover) {
  border-color: #b7b7b7;
}
:deep(.custom-select .el-input__wrapper.is-focus) {
  border-color: #5a94ce;
  box-shadow: none;
}
:deep(.el-select-dropdown.time-dropdown-popper) {
  background-color: #fff;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  min-width: 120px;
  width: auto;
}
:deep(.el-select-dropdown__list) {
  padding: 4px 0;
}
:deep(.el-select-dropdown__item) {
  padding: 0 16px;
  height: 34px;
  line-height: 34px;
  white-space: nowrap;
  font-size: 14px;
  color: #5a94ce;
}
:deep(.el-select-dropdown__item:hover) {
  background-color: #f4f5f7;
}
:deep(.el-select-dropdown__item.selected) {
  color: #4f94e2;
  font-weight: bold;
  background-color: #fff;
}
.custom-log-button {
  width: 80px;
  display: inline-block;
  margin: 0 24px;
}
:deep(.custom-log-button button) {
  width: 100%;
}
.custom-ellipsis {
  width: 32px;
  height: 32px;
  border: 1px solid #b7b7b7;
  border-radius: 3px;
  background-color: transparent;
  padding: 0;
  margin: 0 14px 0 0px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.custom-ellipsis:hover {
  background-color: #f4f5f7;
  border-color: #a5a5a5;
}
.ellipsis-svg {
  width: 24px;
  height: 24px;
}
.dropdown-main-menu {
  margin: 10px;
  margin-left: 15px;
  color: #6b778c;
  font-size: 11px;
  font-weight: 700;
  line-height: 16px;
}
.badge {
  white-space: nowrap !important;
  display: inline-block;
  background: #006644;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  padding: 1px 6px 1px 6px;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #ffffff !important;
  margin-right: 8px;
}
</style>
