import { useTranslation } from "./index";
import { format as formatDateTimeago } from "timeago.js";

const getLocale = () => {
  return "en-US";
};
const cropText = (str: string, ml = 100, end = "...") => {
  if (str.length > ml) {
    return `${str.slice(0, ml)}${end}`;
  }
  return str;
};

const formatRecurringPaymentCycle = (cycle?: string): string => {
  const translate = useTranslation();
  if (!cycle) {
    return translate("payment_cycles_one_time");
  }
  const unit = cycle.slice(-1);
  const quantity = parseInt(cycle.replace(unit, ""));
  switch (unit) {
    case "h":
      return translate("payment_cycles_hour", { count: quantity });
      break;
    case "d":
      return translate("payment_cycles_day", { count: quantity });
      break;
    case "m":
      return translate("payment_cycles_month", { count: quantity });
      break;
    case "y":
      return translate("payment_cycles_year", { count: quantity });
      break;
  }

  return "";
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const jpZipcode = (zip: string | number) => {
  const _zip = zip.toString();
  if (_zip.length != 7) return "";
  return "〒" + _zip.slice(0, 3) + "-" + _zip.slice(3, _zip.length);
};

const formatDate = (dt: Date | string | number) => {
  let _dt = dt as number;
  if (typeof dt === "string") {
    _dt = Date.parse(dt);
    if (Number.isNaN(_dt)) {
      _dt = parseInt(dt);
    }
  }

  const translate = useTranslation();
  return translate("global_datetime", {
    val: new Date(_dt),
    formatParams: {
      val: {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    },
  });
};
const formatDatetime = (dt: Date | string | number) => {
  let _dt = dt as number;
  if (typeof dt === "string") {
    _dt = Date.parse(dt);
    if (Number.isNaN(_dt)) {
      _dt = parseInt(dt);
    }
  }
  const translate = useTranslation();
  return translate("global_datetime", {
    val: new Date(_dt),
    formatParams: {
      val: {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      },
    },
  });
};
const formatTimeago = (dt: Date | string | number) => {
  let _dt = dt as number;
  if (typeof dt === "string") {
    _dt = Date.parse(dt);
    if (Number.isNaN(_dt)) {
      _dt = parseInt(dt);
    }
  }
  return formatDateTimeago(new Date(_dt), getLocale().replace("_", "-"));
};

export {
  cropText,
  formatBytes,
  formatTimeago,
  formatDatetime,
  jpZipcode,
  formatRecurringPaymentCycle,
  formatDate,
};
