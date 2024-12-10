<template>
  <el-container class="time-tracking-container">
    <el-main class="time-tracking-table">
      <div v-if="isLoading" class="circle-loader align-data"></div>
      <p
        v-else-if="!issuesForTable.length || dateRangeData === null"
        class="align-data"
      >
        No logged data found.
      </p>
      <div v-else>
        <div class="table-wrapper">
          <el-table
            :data="issuesForTable"
            border
            class="log-table"
            max-height="75vh"
          >
            <el-table-column
              prop="task_key"
              label="Issue"
              class-name="issue-column"
              width="320"
              fixed="left"
            >
              <template #default="scope">
                <div class="issue-col">
                  <img
                    :src="scope.row.icon"
                    alt="Priority Icon"
                    class="priority-icon"
                  />
                  <span class="issue-id">{{ scope.row.task_key }}</span>
                  <span class="issue-summary">{{ scope.row.title }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column
              prop="logged"
              label="Logged"
              class-name="logged-column"
              width="80"
              fixed="left"
            >
              <template #default="scope">
                <span class="log-col">{{
                  scope.row.logged > 0 ? (scope.row.logged / 60).toFixed(2) : 0
                }}</span>
              </template>
            </el-table-column>

            <el-table-column
              v-for="(day, index) in days"
              :key="day.date"
              :prop="'day' + index"
              class-name="day-column"
              min-width="60"
              :class="{
                'weekend-column': day.day === 'SAT' || day.day === 'SUN',
              }"
            >
              <template #header>
                <div class="header-cell">
                  <div class="day-text">{{ day.day }}</div>
                  <div class="date-text">{{ day.date }}</div>
                </div>
              </template>
              <template #default="scope">
                <div
                  class="day-cell"
                  :class="{
                    'weekend-cell': day.day === 'SAT' || day.day === 'SUN',
                    'has-value': scope.row[`day${index}`] > 0,
                    highlighted: day.date === 15,
                  }"
                >
                  <el-button
                    @click="isDialogVisible = true"
                    style="border: none; background: none; align-items: end"
                    >{{
                      scope.row[`day${index}`]
                        ? (scope.row[`day${index}`] / 60).toFixed(2)
                        : ""
                    }}</el-button
                  >
                </div>
              </template>
            </el-table-column>

            <template #append>
              <el-table
                :data="[{ total: 'Total', totalValue: totalLogged }]"
                :show-header="false"
                style="table-layout: fixed; width: 100%; font-weight: bold"
                class="total-row"
              >
                <el-table-column width="381" fixed="left">
                  <template #default="{ row }">
                    <div class="total-row">
                      <div>{{ row.total }}</div>
                      <div class="total-logged-div">
                        {{
                          row.totalValue > 0
                            ? (row.totalValue / 60).toFixed(2)
                            : 0
                        }}
                      </div>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column
                  v-for="(day, index) in days"
                  :key="day.date"
                  :prop="'day' + index"
                  class-name="day-column"
                  min-width="60"
                  :class="{
                    'weekend-column': day.day === 'SAT' || day.day === 'SUN',
                  }"
                >
                  <template #default="">
                    {{
                      dayTotals[index] ? (dayTotals[index] / 60).toFixed(2) : 0
                    }}
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table>
        </div>
      </div>
      <EditLogTimeModal
        :visible="isDialogVisible"
        @closeEditModal="isDialogVisible = false"
      />
    </el-main>
  </el-container>
</template>

<script setup>
import axios from "axios";
import dayjs from "dayjs";
import { computed, ref, watch } from "vue";
import EditLogTimeModal from "/components/EditLogTimeModal.vue";
const emit = defineEmits(["log-details", "totalLogged"]);
const props = defineProps({
  dateRange: true,
});
const days = ref([]);

// Reactive state
const isLoading = ref(false);
const issues = ref([]);
const issuesForTable = ref([]);
const isDialogVisible = ref(false);
const totalLogged = computed(() =>
  dayTotals.value.reduce((sum, item) => sum + item, 0)
);
const dateRangeData = computed(() => props.dateRange);

const generateMonthData = (dateRangeData) => {
  if (dateRangeData?.length) {
    const startDate = new Date(dateRangeData[0]);
    const endDate = new Date(dateRangeData[1]);

    const data = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const day = currentDate.getDate();
      const weekday = currentDate.toLocaleString("en-US", { weekday: "short" });
      data.push({
        day: weekday.toUpperCase(),
        date: day,
        fullDate: dayjs(currentDate).format("YYYY-MM-DD"),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }
};

const dayTotals = computed(() =>
  days.value.map((_, index) =>
    issuesForTable.value.reduce(
      (sum, issue) => sum + (issue[`day${index}`] || 0),
      0
    )
  )
);

watch(dateRangeData, async () => {
  if (dateRangeData.value?.length) await getTableLogDetails();
});

watch(
  issues,
  (newIssues) => {
    totalLogged.value = newIssues.reduce((sum, issue) => sum + issue.logged, 0);
    emit("totalLogged", totalLogged.value);
  },
  { immediate: true }
);

const transformIssues = (issues, daysList) => {
  return issues
    .map((issue) => {
      const dailyLogs = {};

      daysList?.forEach((day, index) => {
        dailyLogs[`day${index}`] = 0;
      });
      dailyLogs["logged"] = 0;
      issue.timeEntries.forEach((entry) => {
        const entryDate = new Date(entry.entry_time)
          .toISOString()
          .split("T")[0];
        daysList?.forEach((day, index) => {
          if (entryDate === day.fullDate) {
            dailyLogs[`day${index}`] += entry.minutes;
            dailyLogs["logged"] += entry.minutes;
          }
        });
      });

      return { ...issue, ...dailyLogs };
    })
    .filter((issue) => {
      return issue.timeEntries?.length;
    });
};

const getTableLogDetails = async () => {
  try {
    days.value = generateMonthData(dateRangeData.value);
    isLoading.value = true;

    const response = await axios.get(`/api/reports`, {
      params: {
        userIds: "1,3",
        fromDate: dayjs(dateRangeData.value[0]).format("YYYY-MM-DD").toString(),
        toDate: dayjs(dateRangeData.value[1]).format("YYYY-MM-DD").toString(),
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.data || !response.data.data) {
      console.warn("API response is missing 'data':", response.data);
      issues.value = [];
    } else {
      issues.value = Object.values(response.data.data);
    }
    emit("log-details", issues.value);
    issuesForTable.value = transformIssues(issues.value, days.value);
  } catch (error) {
    console.error("Error fetching table log details:", error);
    issues.value = [];
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
@font-face {
  font-family: "Rubik";
  src: url("./fonts/Rubik-VariableFont_wght.ttf");
}

.table-wrapper {
  overflow-x: auto;
  position: relative;
  max-height: calc(100vh - 175px);
}

.time-tracking-table {
  font-family: "Rubik", Arial, sans-serif;
  padding: 0;
  overflow: hidden;
  margin-top: -10px;
}
:deep(.el-table) {
  border: 1px solid #dfe1e6;
  font-size: 12px;
  border-bottom: none;
  width: 100%;
  table-layout: fixed;
}
:deep(.el-table__body-wrapper) {
  overflow-x: hidden;
}
:deep(.el-table::before),
:deep(.el-table__inner-wrapper::before) {
  display: none;
}
:deep(.el-table th) {
  background-color: #fafbfc;
  border-bottom: 1px solid #dfe1e6;
  padding: 6.5px 0;
  font-weight: 400;
  color: #6b778c;
  height: 32px;
  text-align: center;
}
:deep(.el-table th.weekend-column) {
  background-color: #f4f5f7;
}

:deep(.el-table td) {
  border-bottom: 1px solid #dfe1e6;
  padding: 0;
  height: 40px;
  text-align: center;
}
:deep(.el-table td .cell) {
  height: 48px;
  display: grid;
  align-items: center;
}
:deep(.el-table td.weekend-column) {
  background-color: #f4f5f7;
}
:deep(.el-table td.has-value) {
  font-weight: 500;
}
:deep(.el-table td:hover),
:deep(.el-table tr.el-table__row:hover td) {
  background-color: #eaf3ff !important;
}
:deep(.el-table .cell) {
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.day-text,
.date-text {
  color: #6b778c;
  font-size: 11px;
}

.issue-col {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.priority-icon {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  position: relative;
  top: 1px;
  flex-shrink: 0;
}
.issue-id {
  color: #6b778c;
  font-weight: 600;
  padding-right: 8px;
  flex-shrink: 0;
}
.issue-summary {
  color: #172b4d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-cell {
  text-align: center;
  height: 100%;
  color: #172b4d;
  font-size: 12px;
}
.weekend-cell {
  background-color: #f4f5f7 !important;
}

.log-col {
  color: #172b4d;
  font-weight: 600;
  text-align: center;
  display: block;
  font-size: 12px;
  line-height: 14px;
}

:deep(.el-table:not(.el-table--border) .el-table__cell) {
  border-right: 1px solid #dfe1e6 !important;
}

.align-data {
  position: absolute;
  left: 50%;
  margin-top: 100px;
}

.el-button {
  padding: 0px !important;
}
.total-logged-div {
  align-self: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border-left: 1px solid #dfe1e6 !important;
  height: 100%;
  width: 80px;
}

.total-row {
  display: grid;
  align-items: center;
  grid-template-columns: 4fr 1fr;
  height: 100%;
}
</style>
