import type { Emitter } from "mitt";

export type Events = {
  [key: string]: any;
};
export interface SSRBase {
  initial: {
    isSSR: boolean;
    pinia?: string;
  };
  uuid?: string;
  meta?: string;
  link?: string;
  bodyAttributes?: string;
  htmlAttributes?: string;
  bodyTags?: string;
  app?: string;
  statusCode?: number;
  redirect?: string;
}
export interface ServerRouterState {
  _router: any | null;
  status: number;
  redirect?: string;
}
export interface FetchResult {
  [key: string]: any;
  fvReject?: boolean;
  data?: any;
  raw: any;
  status: any;
}
export type FetchRequestResult = {
  [key: number]: FetchResult | undefined;
};

export type FetchSharedState = {
  results: FetchRequestResult;
};
export type I18nextTranslate = (key: string, v?: any | undefined) => string;
export type EventBus = Emitter<Events>;
