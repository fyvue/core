import { createApp } from "./main";
import { KlbHandleSSR } from "@fy-/components";

export async function render(cb: Function) {
  return await KlbHandleSSR(createApp, cb, { url: undefined });
}
