export interface IDetectOptions {
  order?: (
    | "querystring"
    | "cookie"
    | "localStorage"
    | "sessionStorage"
    | "navigator"
    | "htmlTag"
  )[];
  lookupQuerystring?: string;
  lookupCookie?: string;
  lookupLocalStorage?: string;
  lookupSessionStorage?: string;
  caches?: ("querystring" | "cookie" | "localStorage" | "sessionStorage")[];
}
export declare const defaultDetectOptions: IDetectOptions;
export declare function getDefaultLanguage(options: IDetectOptions): string;
export declare function saveSelectedLanguage(
  lang: string,
  detectOptions: IDetectOptions
): void;
