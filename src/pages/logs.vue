<template>
  <div class="log-container">
    <TopBar
      :dateRange="dateRange"
      :logData="logData"
      :totalLogged="totalLogged"
    ></TopBar>
    <FilterBar @dateRange="updateSelectedDate"></FilterBar>
    <LogTable
      :dateRange="dateRange"
      @log-details="getReportLogDetailsFromAPI"
      @totalLogged="getTotalLogged"
    ></LogTable>
  </div>
</template>
<script setup>
import FilterBar from "/components/FilterBar.vue";
import LogTable from "/components/LogTable.vue";
import TopBar from "/components/TopBar.vue";
definePageMeta({
  layout: "with-sidebar",
});
const dateRange = ref(null);
const logData = ref(null);
const totalLogged = ref(0);
onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://connect-cdn.atl-paas.net/all.js";
  script.async = true;
  document.head.appendChild(script);
});

const updateSelectedDate = (date) => {
  dateRange.value = date;
};
const getReportLogDetailsFromAPI = (data) => {
  logData.value = data;
};
const getTotalLogged = (data) => {
  totalLogged.value = data;
};
</script>

<style scoped>
.log-container {
  display: grid;
}
</style>
