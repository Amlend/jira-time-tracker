<template>
  <div class="tempo-section">
    <div class="header">
      <div>
        <el-icon :size="20">
          <CircleCheckFilled />
        </el-icon>
        <Heading as="h4">Time Tracking</Heading>
      </div>
      <BaseButton
        id="log-time-button"
        type="primary"
        display-text="Log Time"
        @click="openLogHoursDialog"
      ></BaseButton>
    </div>

    <el-divider />

    <div class="tracking-details">
      <div class="tracking-item">
        <span class="label">Estimated:</span>
        <el-progress
          :percentage="100"
          class="progress-bar"
          :show-text="false"
          color="#172b4d"
        ></el-progress>
        <span class="value">{{
          convertMinutesToHoursAndMinutes(loggedDetails?.estimated) ||
          "Not Specified"
        }}</span>
      </div>

      <div class="tracking-item">
        <span class="label">Remaining:</span>
        <el-progress
          :percentage="progressPercentageRemaining"
          class="progress-bar"
          :show-text="false"
          color="#172b4d"
        ></el-progress>
        <span class="value">{{
          convertMinutesToHoursAndMinutes(
            loggedDetails?.estimated - loggedDetails?.logged
          ) || "Not Specified"
        }}</span>
      </div>

      <div class="tracking-item">
        <span class="label">Logged:</span>
        <el-progress
          :percentage="progressPercentageLogged"
          class="progress-bar"
          :show-text="false"
          color="#172b4d"
        ></el-progress>
        <span class="value">{{
          convertMinutesToHoursAndMinutes(loggedDetails?.logged) ||
          "Not Specified"
        }}</span>
      </div>
    </div>

    <div class="collaborators-section">
      <div>
        <el-icon :size="20">
          <UserFilled />
        </el-icon>
        <span>Collaborators</span>
      </div>
    </div>

    <el-divider />

    <div class="tracking-details">
      <div
        v-for="(row, index) in loggedDetails?.result"
        :key="index"
        class="tracking-item"
      >
        <span class="label">{{ row.displayName || "-" }}</span>
        <el-progress
          :percentage="100"
          class="progress-bar"
          :show-text="false"
          color="#172b4d"
        ></el-progress>
        <span class="value">{{
          convertMinutesToHoursAndMinutes(row.totalTime)
        }}</span>
      </div>
    </div>

    <div class="trackers-section">
      <div>
        <el-icon :size="20">
          <Clock />
        </el-icon>
        <span>Trackers</span>
      </div>
      <BaseButton type="primary" display-text="Add" />
    </div>

    <el-divider />
  </div>
</template>

<script setup>
import { CircleCheckFilled, Clock, UserFilled } from "@element-plus/icons-vue";
import { ElDivider, ElIcon, ElProgress } from "element-plus";
import { computed, onMounted, ref } from "vue";
import BaseButton from "/components/ui-components/BaseButton.vue";
import helperFunction from "/helper-functions/helperFunctions.js";
const issueKey = ref(null);
const loggedDetails = ref(null);
const ticketDetails = ref(null);
const { convertMinutesToHoursAndMinutes } = helperFunction();

onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://connect-cdn.atl-paas.net/all.js";
  script.async = true;
  document.head.appendChild(script);
  setTimeout(fetchLogDetails, 100);
});

const progressPercentageLogged = computed(() => {
  if (!loggedDetails.value?.estimated || loggedDetails.value?.estimated === 0) {
    return 0;
  }
  return Math.min(
    (loggedDetails.value?.logged / loggedDetails.value?.estimated) * 100,
    100
  );
});

const progressPercentageRemaining = computed(() => {
  let remaining = loggedDetails.value?.estimated - loggedDetails.value?.logged;
  if (!loggedDetails.value?.estimated || loggedDetails.value?.estimated === 0) {
    return 0;
  }
  return Math.min((remaining / loggedDetails.value?.estimated) * 100, 100);
});

const fetchLogDetails = async () => {
  if (typeof window.AP === "undefined") {
    console.error(
      "AP is not defined. Ensure the Atlassian JavaScript API script is loaded."
    );
    return;
  }

  AP.context.getContext(async (context) => {
    issueKey.value = context?.jira?.issue?.key;

    fetchCollaborators();

    const {
      data: taskData,
      pending: taskPending,
      refresh: taskDataRefresh,
      error: taskError,
    } = await useFetch(`/api/task/${issueKey.value}`, {
      initialCache: false,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    ticketDetails.value = taskData.value?.data;
    if (taskData.value?.error) {
      message.error(taskData.value?.error.message);
      return;
    }
  });
};

const fetchCollaborators = async () => {
  const {
    data: logData,
    pending: logDataPending,
    refresh: logDataRefresh,
    error: logError,
  } = await useFetch(`/api/collaborators/${issueKey.value}`, {
    initialCache: false,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { data, error } = logData.value;
  loggedDetails.value = data;
};

const openLogHoursDialog = () => {
  if (issueKey.value) {
    const dialog = AP.dialog.create({
      key: "log-hours-dialog",
      width: "540px",
      height: "550px",
      chrome: false,
      customData: {
        key: ticketDetails.value.key,
        name: ticketDetails.value.name,
      },
    });
    if (dialog && typeof dialog.on === "function") {
      dialog.on("close", () => {
        fetchCollaborators();
      });
    }
  }
};
</script>
<style scoped>
.header,
.trackers-section,
.collaborators-section {
  display: flex;
  align-items: central;
  justify-content: space-between;
  padding: 18px 0px;
}
.header div,
.trackers-section div,
.collaborators-section div {
  display: flex;
  align-items: center;
  color: #172b4d;
  gap: 8px;
}
.tracking-details {
  margin: 20px 20px 20px 20px;
}
.tracking-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  color: #172b4d;
}
.label {
  flex-shrink: 0;
  width: 60px;
  font-size: 14px;
}
.value {
  flex-shrink: 0;
  width: 50px;
  text-align: left;
  font-size: 14px;
}
.progress-bar {
  flex-grow: 1;
  margin: 0 10px;
  min-width: 0;
}
.el-divider {
  margin: 0px;
}
</style>
