import type { App, Plugin } from "vue";
import { inject } from "vue";
import mitt from "mitt";
import i18next, { BackendModule } from "i18next";
import type { Events, I18nextTranslate, EventBus } from "./types";
import {
  useServerRouter,
  SSRRender,
  initVueClient,
  getServerInitialState,
  isServerRendered,
} from "./ssr";
import {
  cropText,
  formatBytes,
  formatTimeago,
  formatDatetime,
  jpZipcode,
  formatRecurringPaymentCycle,
  formatDate,
} from "./templating";
import { generateUUID, stringHash } from "./helpers";

import { ClientOnly } from "./components/ClientOnly";

function createFyCore(): Plugin {
  const eventBus: EventBus = mitt<Events>();

  return {
    install(app: App) {
      if (app.config.globalProperties) {
        // eventBus (mitt)
        app.config.globalProperties.$eventBus = eventBus;
        app.provide("fyEventBus", eventBus);

        // i18next
        app.config.globalProperties.$t = i18next.t;
        app.provide("fyTranslate", i18next.t);

        // Templating
        app.config.globalProperties.$cropText = cropText;
        app.config.globalProperties.$formatBytes = formatBytes;
        app.config.globalProperties.$formatTimeago = formatTimeago;
        app.config.globalProperties.$formatDatetime = formatDatetime;
        app.config.globalProperties.$jpZipcode = jpZipcode;
        app.config.globalProperties.$formatKlbRecurringPaymentCycle =
          formatRecurringPaymentCycle; // fyvue < 0.2
        app.config.globalProperties.$formatRecurringPaymentCycle =
          formatRecurringPaymentCycle;
        app.config.globalProperties.$formatDate = formatDate;

        // Components
        app.component("ClientOnly", ClientOnly);
      }
    },
  };
}

function useEventBus() {
  const eventBus = inject<EventBus>("fyEventBus");

  if (!eventBus) throw new Error("Did you apply app.use(fycore)?");

  return eventBus;
}

function useTranslation() {
  const translate = inject<I18nextTranslate>("fyTranslate");
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

const componentsList = ["ClientOnly"];

const fycoreResolver = (componentName: string) => {
  if (componentsList.includes(componentName))
    return { name: componentName, from: "@fy-/core" };
};

export {
  createFyCore,
  fycoreResolver,
  // Components
  ClientOnly,
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
  // Formatting
  cropText,
  formatBytes,
  formatTimeago,
  formatDatetime,
  jpZipcode,
  formatRecurringPaymentCycle,
  formatDate,
  // Helpers
  generateUUID,
  stringHash,
};

declare module "vue" {
  export interface ComponentCustomProperties {
    $t: I18nextTranslate;
    $eventBus: EventBus;
    $cropText: typeof cropText;
    $formatBytes: typeof formatBytes;
    $formatTimeago: typeof formatTimeago;
    $formatDatetime: typeof formatDatetime;
    $jpZipcode: typeof jpZipcode;
    $formatKlbRecurringPaymentCycle: typeof formatRecurringPaymentCycle; // fyvue < 0.2
    $formatRecurringPaymentCycle: typeof formatRecurringPaymentCycle;
    $formatDate: typeof formatDate;
  }
  export interface GlobalComponents {
    ClientOnly: typeof ClientOnly;
  }
}
