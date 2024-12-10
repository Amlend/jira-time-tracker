<template>
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-title">Log time</h2>
    </div>
    <div class="modal-body">
      <form>
        <div class="search-container">
          <input
            type="text"
            placeholder="Search issues"
            v-model="ticketName"
            disabled="true"
          />
          <span class="search-icon">
            <img src="public/icons/search.svg" alt="Search" />
          </span>
        </div>

        <div class="form-row">
          <div class="date-input">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              format="DD/MMM/YY"
              value-format="DD/MMM/YY"
              :clearable="false"
              placement="right"
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
              v-model="loggedTime"
              @keydown="isValidTimeInput($event)"
              @focusout="formatTimeInputOnFocusOut"
              id="timeInput"
            />
            <span class="time-icon">
              <img src="public/icons/clock.svg" alt="Clock" />
            </span>
          </div>
        </div>

        <div class="description-input">
          <input type="text" placeholder="Description" v-model="comments" />
          <span class="description-icon">
            <img src="public/icons/description.svg" alt="Description" />
          </span>
        </div>

        <div class="button-row">
          <el-button class="cancel-button" @click="handleCancel"
            >Cancel</el-button
          >
          <el-button class="log-time-button" type="submit" @click="submitLog"
            >Log time</el-button
          >
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
import { ElDatePicker } from "element-plus";
import { computed, onMounted, ref } from "vue";
import helperFunction from "/helper-functions/helperFunctions.js";
export default {
  name: "LogTimeModal",
  setup() {
    const ticketName = ref("");
    const customData = ref(null);
    const currentDate = computed(() => {
      return dayjs(new Date()).format("DD/MMM/YY");
    });
    const selectedDate = ref(currentDate.value);
    const loggedTime = ref("");
    const comments = ref("");
    const { isValidTimeInput, formatTimeInput, convertBackToMinutes } =
      helperFunction();
    onMounted(() => {
      const script = document.createElement("script");
      script.src = "https://connect-cdn.atl-paas.net/all.js";
      script.async = true;
      document.head.appendChild(script);
      setTimeout(fetchCustomData, 1000);
    });
    const fetchCustomData = () => {
      AP.dialog.getCustomData((data) => {
        if (data) {
          ticketName.value = data.name;
          customData.value = data;
        } else {
          console.log("No custom data received.");
        }
      });
    };
    const formatTimeInputOnFocusOut = () => {
      loggedTime.value = formatTimeInput(loggedTime.value);
    };
    const handleCalendarClick = (event) => {
      const datePickerInput = event.target
        .closest(".date-input")
        .querySelector(".el-input__inner");
      if (datePickerInput) {
        datePickerInput.click();
      }
    };
    const submitLog = async () => {
      formatTimeInputOnFocusOut();

      const payload = {
        taskKey: customData.value.key,
        minutes: convertBackToMinutes(loggedTime.value),
        notes: comments.value || "",
        entryDate: dayjs(selectedDate.value).format("YYYY-MM-DD"),
      };
      await useFetch(`api/time/entry/create-one`, {
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
      AP.dialog.close();
      ticketName.value = "";
      selectedDate.value = currentDate.value;
      loggedTime.value = "";
      comments.value = "";
    };
    return {
      ticketName,
      selectedDate,
      loggedTime,
      comments,
      handleCalendarClick,
      submitLog,
      handleCancel,
      isValidTimeInput,
      formatTimeInputOnFocusOut,
      ElDatePicker,
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
.modal-content {
  background: #ffffff;
}
.modal-header {
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dfe1e6;
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
/* Hide default Element Plus icons */
:deep(.el-input__prefix),
:deep(.el-input__suffix),
:deep(.el-input__suffix-inner),
:deep(.el-input__icon) {
  display: none !important;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
}
/* Date Picker Popup Styles */
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
/* Button Styles */
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
/* Search Results Container (if needed) */
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #dfe1e6;
  border-radius: 3px;
  box-shadow: 0 4px 8px rgba(9, 30, 66, 0.25);
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}
/* Responsive Styles */
@media (max-width: 768px) {
  .el-dialog {
    width: 90%;
    max-width: none;
    margin: 20px auto;
  }
  .date-input,
  .time-input {
    width: 100%;
  }
  .modal-header {
    padding: 16px 20px;
  }
  .modal-body {
    padding: 16px 20px;
  }
  .modal-title {
    font-size: 20px;
  }
}
</style>
