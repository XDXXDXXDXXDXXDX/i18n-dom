export const defaultDetectOptions = {
  order: ["localStorage", "navigator", "htmlTag"],
  lookupLocalStorage: "i18nDOMLng",
  caches: ["localStorage"],
};

export function getDefaultLanguage(options) {
  const { order, lookupLocalStorage } = options;
  let language = "";
  for (let i = 0; i < order.length; i++) {
    if (order[i] === "localStorage") {
      language = localStorage[lookupLocalStorage];
    } else if (order[i] === "navigator") {
      language = navigator.language;
    } else if (order[i] === "htmlTag") {
      language = document.documentElement.lang;
    }

    if (language) {
      break;
    }
  }

  return language;
}
