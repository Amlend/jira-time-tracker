<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script>
export default {
  setup() {
    onMounted(() => {
      const script = document.createElement("script");
      script.src = "https://connect-cdn.atl-paas.net/all.js";
      script.async = true;
      document.head.appendChild(script);
    });
  },
};
</script>
