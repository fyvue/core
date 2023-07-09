import { createApp as createRegularApp, createSSRApp } from "vue";
import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from "vue-router";
import { createFyCore } from "@fy-/core";
import { createFyHead } from "@fy-/head";
import { createPinia } from "pinia";
import { getPrefix } from "@karpeleslab/klbfw";
import routes from "./routes";
import App from "./AppSuspender.vue";
import "./style.scss";
export const createApp = async (isSSR = false) => {
  const pinia = createPinia();
  const head = createFyHead();
  const fycore = createFyCore();
  const app = isSSR ? createSSRApp(App) : createRegularApp(App);
  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory(getPrefix())
      : createWebHistory(getPrefix()),
    routes,
    scrollBehavior(to) {
      if (to.hash) {
        return {
          el: to.hash,
        };
      }
    },
  });
  router.afterEach((to) => {
    if (typeof window !== "undefined" && !to.hash) window.scrollTo(0, 0);
  });
  app.use(router);
  app.use(fycore);
  app.use(head);
  app.use(pinia);
  app.config.globalProperties.$cleanScript = (txt: string) => {
    return txt
      .replace("_script_", '<script setup lang="ts">')
      .replace("_script_end_", "</script>");
  };

  return { app, router, head, pinia };
};
