import { createApp } from "./main";
import { initVueClient, isServerRendered } from "@fy-/core";

createApp(isServerRendered()).then(({ app, router, pinia }) => {
  router.isReady().then(async () => {
    initVueClient(router, pinia);
    app.mount("#app");
  });
});
