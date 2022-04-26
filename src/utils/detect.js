import { setCookie, getCookie, setSearch, getSearch } from "./index.js";
export const defaultDetectOptions = {
  order: [
    "querystring",
    "cookie",
    "localStorage",
    "sessionStorage",
    "navigator",
    "htmlTag",
  ],
  lookupQuerystring: "lng",
  lookupCookie: "i18n_dom",
  lookupLocalStorage: "i18nDOMLng",
  lookupSessionStorage: "i18nDOMLng",
  caches: ["localStorage"],
};
export function getDefaultLanguage(options) {
  const {
    order,
    lookupQuerystring,
    lookupCookie,
    lookupLocalStorage,
    lookupSessionStorage,
  } = options;
  let language = "";
  for (let i = 0; i < order.length; i++) {
    const key = order[i];
    if (key === "querystring") {
      language = getSearch(lookupQuerystring);
    } else if (key === "cookie") {
      language = getCookie(lookupCookie);
    } else if (key === "localStorage") {
      language = localStorage[lookupLocalStorage];
    } else if (key === "sessionStorage") {
      language = sessionStorage[lookupSessionStorage];
    } else if (key === "navigator") {
      language = navigator.language;
    } else if (key === "htmlTag") {
      language = document.documentElement.lang;
    }
    if (language) {
      break;
    }
  }
  return language;
}
export function saveSelectedLanguage(lang, detectOptions) {
  const {
    caches,
    lookupQuerystring,
    lookupCookie,
    lookupLocalStorage,
    lookupSessionStorage,
  } = detectOptions;
  caches.forEach((key) => {
    if (key === "localStorage") {
      localStorage[lookupLocalStorage] = lang;
    } else if (key === "sessionStorage") {
      sessionStorage[lookupSessionStorage] = lang;
    } else if (key === "cookie") {
      setCookie(lookupCookie, lang);
    } else if (key === "querystring") {
      setSearch(lookupQuerystring, lang);
    }
  });
}
