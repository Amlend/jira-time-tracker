<template>
  <div>
    <el-button class="log-time-button" @click="open = true">Log Time</el-button>
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
        <div class="modal-header">
          <button class="back-button" @click="goBack" v-if="isSearchMode">
            <img src="public/icons/back.svg" alt="Back Icon" />
          </button>
          <h2 class="modal-title">
            {{ isSearchMode ? "Search Issue" : "Log Time" }}
          </h2>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="search-container">
              <el-input
                type="text"
                placeholder="Search issues"
                v-model="searchTerm"
                @focus="activateSearchMode"
                @input="handleSearch"
              />
              <span class="search-icon">
                <img src="public/icons/search.svg" alt="Search" />
              </span>
            </div>

            <!-- Conditionally render components based on search mode -->
            <div v-if="!isSearchMode">
              <div class="form-row">
                <div class="date-input">
                  <el-date-picker
                    v-model="date"
                    type="date"
                    placeholder="DD/MMM/YY"
                    format="DD/MMM/YY"
                    value-format="DD/MMM/YY"
                    :clearable="false"
                    class="custom-date-picker"
                    popper-class="custom-date-popper"
                  />
                  <span class="calendar-icon" @click="handleCalendarClick">
                    <img src="public/icons/calendar-icon.svg" alt="calendar" />
                  </span>
                </div>
                <div class="time-input">
                  <input
                    type="text"
                    placeholder="0h"
                    v-model="endTime"
                    @keydown="isValidTimeInput($event)"
                    @focusout="formatTimeInputOnFocusOut"
                  />
                  <span class="time-icon">
                    <img src="public/icons/clock.svg" alt="Clock" />
                  </span>
                </div>
              </div>

              <div class="description-input">
                <input
                  type="text"
                  placeholder="Description"
                  v-model="comments"
                />
                <span class="description-icon">
                  <img src="public/icons/description.svg" alt="Description" />
                </span>
              </div>

              <div class="button-row">
                <button
                  class="cancel-button"
                  @click.prevent.stop="handleCancel"
                >
                  Cancel
                </button>
                <button
                  class="log-time-button"
                  type="submit"
                  @click="submitLog"
                >
                  Log time
                </button>
              </div>
            </div>

            <!-- Display search results -->
            <div
              v-if="isSearchMode && suggestions.length > 0"
              class="search-results"
            >
              <ul class="suggestions-list">
                <li
                  v-for="(issue, index) in suggestions"
                  :key="issue.id"
                  @click="selectSuggestion(issue)"
                  class="suggestion-item"
                >
                  <img
                    :src="baseURL + issue.img"
                    alt=""
                    class="suggestion-icon"
                  />
                  <span class="suggestion-text"
                    >{{ issue.key }} - {{ issue.summaryText }}</span
                  >
                </li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { computed, ref } from "vue";
import helperFunction from "/helper-functions/helperFunctions.js";

export default {
  name: "LogTimeModal",
  setup() {
    const open = ref(false);
    const searchTerm = ref("");
    const isSearchMode = ref(false);
    const suggestions = ref([]);
    const currentDate = computed(() => dayjs(new Date()).format("DD/MMM/YY"));
    const date = ref(currentDate.value);
    const endTime = ref("");
    const comments = ref("");
    const { isValidTimeInput, formatTimeInput, convertBackToMinutes } =
      helperFunction();
    const baseURL = ref("");

    const activateSearchMode = () => {
      isSearchMode.value = true;
    };

    const handleCalendarClick = (event) => {
      const datePickerInput = event.target
        .closest(".date-input")
        .querySelector(".el-input__inner");
      if (datePickerInput) {
        datePickerInput.click();
      }
    };

    const formatTimeInputOnFocusOut = () => {
      endTime.value = formatTimeInput(endTime.value);
    };

    const handleSearch = async () => {
      if (!searchTerm.value) {
        suggestions.value = [];
        return;
      }

      try {
        const response = await $fetch(
          `/api/task/search?value=${encodeURIComponent(searchTerm.value)}`,
          {
            initialCache: false,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data);

        if (response.data && response.data.sections) {
          baseURL.value = response.data.baseURL;
          console.log(baseURL.value);

          const currentSearchSection = response.data.sections.find(
            (section) => section.id === "cs"
          );
          suggestions.value = currentSearchSection
            ? currentSearchSection.issues
            : [];
        } else {
          baseURL.value = response.data.baseURL;
          suggestions.value = [];
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        suggestions.value = [];
      }
    };

    const selectSuggestion = (issue) => {
      searchTerm.value = `${issue.key} - ${issue.summaryText}`;
      suggestions.value = [];
      isSearchMode.value = false;
    };

    const goBack = () => {
      isSearchMode.value = false;
    };

    const handleSubmit = async () => {
      handleCancel();
    };

    const submitLog = async () => {
      formatTimeInputOnFocusOut();
      const payload = {
        taskKey: searchTerm.value.split(" ")[0],
        minutes: convertBackToMinutes(endTime.value),
        notes: comments.value || "",
        entryDate: dayjs(date.value).format("YYYY-MM-DD"),
      };
      console.log(searchTerm.value);
      console.log("Report payload:", payload);
      await $fetch(`api/time/entry/create-one`, {
        initialCache: false,
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
      handleCancel();
    };

    const handleCancel = () => {
      open.value = false;
      searchTerm.value = "";
      date.value = new Date();
      endTime.value = "";
      comments.value = "";
      isSearchMode.value = false;
    };

    return {
      open,
      searchTerm,
      isValidTimeInput,
      date,
      endTime,
      comments,
      isSearchMode,
      suggestions,
      baseURL,
      goBack,
      activateSearchMode,
      handleSearch,
      selectSuggestion,
      handleCalendarClick,
      handleSubmit,
      submitLog,
      handleCancel,
    };
  },
};
</script>

<style scoped>
.el-dialog {
  width: 35%;
  max-width: 500px;
  border-radius: 6px;
  overflow: hidden;
}
.modal-header {
  padding: 20px 30px;
  display: flex;
  align-items: center;
  background-color: #ffffff;
}
.modal-title {
  font-size: 24px;
  color: #172b4d;
  margin: 0;
  font-weight: 500;
}
.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #42526e;
}
.modal-body {
  padding: 20px 30px;
  background-color: #ffffff;
}
.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}
.date-input,
.time-input {
  flex: 1;
}
.search-container,
.date-input,
.time-input,
.description-input {
  position: relative;
  margin-bottom: 15px;
}
input {
  width: 100%;
  height: 40px;
  padding: 10px 30px 10px 12px;
  border: 1px solid #dfe1e6;
  border-radius: 3px;
  font-size: 14px;
  color: #172b4d;
  background-color: #ffffff;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}
input:hover {
  border-color: #c1c7d0;
}
input:focus {
  border-color: #0052cc;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 82, 204, 0.2);
}
input::placeholder {
  color: #7a869a;
}
.search-icon,
.time-icon,
.description-icon,
.calendar-icon {
  position: absolute;
  right: 10px;
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
.calendar-icon {
  pointer-events: auto;
  cursor: pointer;
}
.custom-date-picker {
  width: 100%;
}
:deep(.el-input) {
  width: 100%;
  margin-top: 4px;
}
:deep(.el-input__wrapper) {
  background-color: white !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
}
:deep(.el-input__inner) {
  width: 100%;
  height: 40px !important;
  padding: 10px 30px 10px 12px !important;
  border: 1px solid #dfe1e6 !important;
  border-radius: 3px;
  font-size: 14px !important;
  color: #172b4d;
  background-color: white;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}
:deep(.el-input__inner:hover) {
  border-color: #c1c7d0 !important;
}
:deep(.el-input__inner:focus) {
  border-color: #0052cc !important;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 82, 204, 0.2);
}
:deep(.el-input__prefix),
:deep(.el-input__suffix),
:deep(.el-input__suffix-inner),
:deep(.el-input__icon) {
  display: none !important;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
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
:global(.custom-date-popper .el-picker-panel__icon-btn) {
  display: none !important;
}
.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
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
.search-results {
  background: #ffffff;
  overflow-y: auto;
  z-index: 1000;
}
@media (max-width: 768px) {
  .el-dialog {
    width: 90%;
    max-width: none;
    margin: 20px auto;
  }
  .form-row {
    flex-direction: column;
    gap: 15px;
  }
  .date-input,
  .time-input {
    width: 100%;
  }
  .modal-header {
    padding: 16px 20px;
    display: flex;
    align-items: center;
  }
  .modal-body {
    padding: 16px 20px;
  }
  .back-button {
    background-color: transparent;
    border: 10px solid transparent;
    font-size: 16px;
    cursor: pointer;
    margin-right: 10px;
  }

  .back-button:hover {
    text-decoration: underline;
  }

  .suggestions-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .suggestion-item:hover {
    background-color: rgba(0, 82, 204, 0.1);
  }

  .suggestion-icon {
    width: 24px;
    height: 24px;
    margin-right: 10px;
  }

  .suggestion-text {
    font-size: 14px;
  }
}
</style>
