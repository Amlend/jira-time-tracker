// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "path";
export default defineNuxtConfig({
  app: {
    head: {
      title: "AppForest",
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  srcDir: "src/",
  nitro: {
    preset: "vercel",
    publicAssets: [{ dir: path.resolve(__dirname, "public") }],
  },
  compatibilityDate: "2024-04-03",
  css: ["/public/assets/main.css"],
});
