<template>
  <div class="sidebar">
    <nav class="nav-menu">
      <div class="logo-container">
        <img :src="logo" alt="Logo" />
      </div>

      <button
        class="nav-item"
        :class="{ active: activeItem === 'logs' }"
        @click="setActiveItem('logs')"
      >
        <span class="icon groups-icon"></span>
      </button>

      <button
        class="nav-item"
        :class="{ active: activeItem === 'issue-context' }"
        @click="setActiveItem('issue-context')"
      >
        <span class="icon overview-icon"></span>
      </button>

      <button
        class="nav-item"
        :class="{ active: activeItem === 'settings' }"
        @click="setActiveItem('settings')"
      >
        <span class="icon settings-icon"></span>
      </button>
    </nav>

    <button
      class="nav-item bottom-icon"
      :class="{ active: activeItem === 'help' }"
      @click="setActiveItem('help')"
    >
      <span class="icon help-icon"></span>
    </button>
  </div>
</template>

<script>
import logo from "public/icons/timesheet-logo.png";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
export default {
  name: "Sidebar",
  setup() {
    const activeItem = ref("");
    const router = useRouter();
    const route = useRoute();
    const setInitialActiveItem = () => {
      if (route.path.includes("logs")) {
        activeItem.value = "logs";
      } else if (route.path.includes("settings")) {
        activeItem.value = "settings";
      } else if (route.path.includes("issue-context")) {
        activeItem.value = "issue-context";
      }
    };
    onMounted(() => {
      setInitialActiveItem();
    });
    const setActiveItem = (item) => {
      if (activeItem.value !== item) {
        activeItem.value = item;
        if (item === "logs") router.push("/logs");
        else if (item === "settings") router.push("/settings");
        else if (item === "issue-context") router.push("/issue-context");
      }
    };
    return {
      activeItem,
      setActiveItem,
      logo,
    };
  },
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0px;
  left: 0;
  height: 100vh;
  background-color: #f4f5f7;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e2e8f0;
  transition: width 0.3s ease;
}
.nav-menu {
  flex-grow: 1;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 8px 0;
}
img {
  width: 40px;
  height: auto;
}
.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 15px;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.nav-item:hover {
  background-color: #e2e8f0;
}
.icon {
  width: 24px;
  height: 24px;
  background-color: #4a5568;
  mask-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}
.groups-icon {
  mask-image: url("/icons/groups.svg");
  mask-size: cover;
}
.overview-icon {
  mask-image: url("/icons/overview.svg");
  mask-size: cover;
}
.settings-icon {
  mask-image: url("/icons/settings.svg");
  mask-size: cover;
}
.help-icon {
  mask-image: url("/icons/help.svg");
  mask-size: cover;
}
.nav-text {
  font-size: 16px;
  color: #4a5568;
}
.bottom-icon {
  margin-bottom: 16px;
}
@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
  .nav-text {
    display: none;
  }
  .icon {
    margin: 0;
  }
}
</style>
