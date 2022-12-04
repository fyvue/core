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
