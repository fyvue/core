import type { App, Plugin } from "vue";
import { inject } from "vue";
import mitt, { Emitter } from "mitt";
import i18next, { BackendModule } from "i18next";
import type { Events } from "./types";
import {
  useServerRouter,
  SSRRender,
  initVueClient,
  getServerInitialState,
  isServerRendered,
} from "./ssr";

function createFyCore(): Plugin {
  const eventBus: Emitter<Events> = mitt<Events>();

  return {
    install(app: App) {
      if (app.config.globalProperties) {
        // eventBus (mitt)
        app.config.globalProperties.$eventBus = eventBus;
        app.provide("fyEventBus", eventBus);

        // i18next
        app.config.globalProperties.$t = i18next.t;
        app.provide("fyTranslate", i18next.t);
      }
    },
  };
}

function useEventBus() {
  const eventBus = inject<Emitter<Events>>("fyEventBus");

  if (!eventBus) throw new Error("Did you apply app.use(fycore)?");

  return eventBus;
}

function useTranslation() {
  const translate =
    inject<(key: string, v?: any | undefined) => string>("fyTranslate");
  if (!translate) throw new Error("Did you apply app.use(fycore)?");

  return translate;
}

function i18nextPromise(
  backend: BackendModule,
  locale: string = "en-US",
  debug: boolean = false,
  ns: string = "translation"
) {
  return i18next.use(backend).init({
    ns: [ns],
    defaultNS: ns,
    debug: debug,
    lng: locale,
    load: "currentOnly",
    initImmediate: false,
  });
}

export {
  createFyCore,
  // Core:
  useTranslation,
  useEventBus,
  i18nextPromise,
  // SSR:
  useServerRouter,
  getServerInitialState,
  SSRRender,
  initVueClient,
  isServerRendered,
};
