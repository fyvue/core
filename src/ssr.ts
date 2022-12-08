import { defineStore, Pinia } from "pinia";
import { renderToString } from "@vue/server-renderer";
import type {
  SSRBase,
  ServerRouterState,
  FetchSharedState,
  FetchResult,
} from "./types";
import type { Router } from "vue-router";
import { stringHash } from "./helpers";

export const useFetchState = defineStore({
  id: "fetchState",
  state: (): FetchSharedState => ({
    results: {},
  }),
  actions: {
    addResult(key: number, result: FetchResult) {
      this.results[key] = result;
    },
    delResult(key: number) {
      delete this.results[key];
    },
    getByHash(key: number) {
      return this.results[key];
    },
  },
});

export function fyvueFetch<ResultType extends FetchResult>(
  url: string,
  method: string = "GET",
  params: object = {}
): Promise<ResultType> {
  const fetchState = useFetchState();
  const requestHash = stringHash(url + method + JSON.stringify(params));
  const hasResult = fetchState.getByHash(requestHash);
  if (isServerRendered() && hasResult) {
    const result = { ...hasResult } as ResultType;
    fetchState.delResult(requestHash);
    return new Promise<ResultType>((resolve, reject) => {
      if (result.fvReject) {
        delete result.fvReject;
        reject(result);
      } else resolve(result);
    });
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  let _params: any = params;
  if (method == "POST") {
    _params = JSON.stringify(params);
  } else if (method == "GET") {
    _params = undefined;
    if (params) {
      _params = "?" + new URLSearchParams(params as Record<string, string>);
    }
  }
  
  return new Promise<ResultType>((resolve, reject) => {
    fetch(`${url}${method == "GET" ? _params : ""}`, {
      method: method,
      body: method == "POST" ? _params : undefined,
      headers,
    })
      .catch((err) => {
        console.log("fetchError: ", err);
        reject({
          headers: {},
          data: { message: "fetchError", error: true },
          status: 500,
        });
      })
      .then((res) => {
        if (res) {
          const contentType = res.headers.get("content-type");
          if (!contentType || contentType.indexOf("application/json") == -1) {
            console.log("fetchError: notJSON");
            reject({
              headers: {},
              data: { message: "fetchError: notJSON", error: true },
              status: 500,
            });
          } else {
            const xHeaders: { [key: string]: string } = {};
            res.headers.forEach((v: string, k: string) => {
              if (k.startsWith("x-")) xHeaders[k] = v;
            });
            res
              .json()
              .then((v) => {
                const _res: FetchResult = {
                  headers: xHeaders,
                  data: v,
                  status: res.status,
                };
                if (getMode() == "ssr") {
                  fetchState.addResult(requestHash, _res);
                }
                resolve(_res as ResultType);
              })
              .catch((e) => {
                console.log("fetchError: jsonError" + ` (${e}) `);
                reject({
                  headers: xHeaders,
                  data: {
                    message: "fetchError: jsonError" + ` (${e}) `,
                    error: true,
                  },
                  status: 500,
                });
              });
          }
        }
      });
  });
}

export const useServerRouter = defineStore({
  id: "routerStore",
  state: () =>
    ({
      _router: null,
      status: 200,
      redirect: undefined,
    } as ServerRouterState),
  getters: {
    currentRoute: (state) => state._router!.currentRoute,
    route: (state) => state._router!.currentRoute,
  },
  actions: {
    setStatus(status: number) {
      this.status = status;
    },
    _setRouter(_router: Router | null) {
      (this._router as unknown as Router | null) = _router;
    },
    push(path: any, status = 302) {
      this.status = status;
      if (status != 302) this.redirect = path;
      return this._router?.push(path);
    },
    replace(path: any, status = 302) {
      this.status = status;
      if (status != 302) this.redirect = path;
      return this._router?.replace(path);
    },
    go(delta: number) {
      this._router?.go(delta);
    },
    back() {
      this._router?.go(-1);
    },
    forward() {
      this._router?.go(1);
    },
  },
});

export function isServerRendered() {
  const state = getServerInitialState();
  if (state && state.isSSR) return true;
  return false;
}
export function getServerInitialState() {
  // @ts-ignore
  return typeof FW !== "undefined" ? FW.initial : undefined;
}
export function getMode() {
  // @ts-ignore
  return typeof FW !== "undefined" ? FW.mode : undefined;
}

export function initVueClient(router: Router, pinia: Pinia) {
  const state = getServerInitialState();
  if (isServerRendered() && state && state.pinia) {
    pinia.state.value = state.pinia;
  }
  useServerRouter(pinia)._setRouter(router);
}

export async function SSRRender(
  createApp: Function,
  url: string,
  cb: Function = () => {},
  uuid?: string
) {
  const { app, router, head, pinia } = await createApp(true);
  await router.push(url);
  await router.isReady();
  const result: SSRBase = {
    uuid: uuid,
    initial: {
      isSSR: true,
      pinia: undefined,
    },
  };

  const serverRouter = useServerRouter(pinia);
  serverRouter._setRouter(router);

  if (url !== serverRouter.route.fullPath) {
    result.redirect = serverRouter.route.value.fullPath;
    result.statusCode = 307;
    cb(result);
    return result;
  }

  try {
    const html = await renderToString(app);
    const { headTags, htmlAttrs, bodyAttrs, bodyTags } =
      head.renderHeadToString();

    result.meta = headTags;
    result.bodyAttributes = bodyAttrs;
    result.htmlAttributes = htmlAttrs;
    result.bodyTags = bodyTags;
    result.app = html;

    if (serverRouter.status != 200) {
      if ([301, 302, 303, 307].includes(serverRouter.status)) {
        if (serverRouter.redirect) {
          result.statusCode = serverRouter.status;
          result.redirect = serverRouter.redirect;
        }
      } else {
        result.statusCode = serverRouter.status;
      }
    }
    serverRouter._router = null;
    result.initial.pinia = pinia.state.value;
    cb(result);
    return result;
  } catch (e) {
    if (e instanceof Error) {
      console.log("------SSRErrorStart------");
      console.log(e.message);
      console.log(e.stack);
      console.log("------SSRErrorEnd------");
    }
    cb(result);
    return result;
  }
}
