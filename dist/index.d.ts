import { IDetectOptions } from "./utils/detect.js";
interface IInit {
    attachNode?: Node;
    htmlLanguage?: string;
    resource: {
        [key: string]: string[];
    };
    fallbackLng?: string;
    detection?: IDetectOptions;
    language?: string;
}
interface IMacroContent {
    hasMacro: boolean;
    isIgnore: boolean;
    startIndex: number;
    matchedData: {
        key: string;
        value: string;
    }[];
    matchedKey: string;
}
declare class I18nDOM {
    attachNode: Node;
    htmlLanguage: string;
    resource: object;
    fallbackLng: string;
    detectOptions: IDetectOptions;
    textObserver: MutationObserver;
    nodeObserver: MutationObserver;
    language: string;
    constructor({ attachNode, htmlLanguage, resource, language, fallbackLng, detection, }: IInit);
    startTextObserve(): void;
    stopTextObserve(): void;
    startNodeObserve(): void;
    stopNodeObserve(): void;
    startObserve(): void;
    stopObserve(): void;
    setLanguage(lang: string, save?: boolean): void;
    changeLanguage(lang: string): void;
    getMacroContent(text: string): IMacroContent;
    clearMacroInfo(text: string): string;
    translateNodeTree(root: Node, originalLanguage: string): void;
    translateTextNode(node: Text, originalLanguage: string): void;
}
export default I18nDOM;
