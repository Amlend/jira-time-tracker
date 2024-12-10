<template>
  <div>
    <h1>Issue Context</h1>
    <!-- <button @click="fetchData">Fetch Task Data</button>
    <pre v-if="response">{{ response }}</pre>-->
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const response = ref("");
onMounted(async () => {
  const script = document.createElement("script");
  script.src = "https://connect-cdn.atl-paas.net/all.js";
  script.async = true; // Set async attribute
  document.head.appendChild(script); // Append the script to the head
});
/*
const fetchData = async () => {
  try {
    console.log("Start",)
    const res = await fetch("/api/task/AT-1", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add any other necessary headers here
      },
    });

    if (!res.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await res.json();
    response.value = JSON.stringify(data, null, 2); // Format JSON for readability
  } catch (error) {
    console.error("Error fetching data:", error);
    response.value = "Error fetching data";
  }
};*/
</script>

<style scoped>
button {
  padding: 12px 32px;
  font-size: 16px;
  border-radius: 8px;
}
pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
}
</style>
