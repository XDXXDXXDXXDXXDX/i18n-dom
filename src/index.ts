import { getAllTextNodes } from "./utils/index.js";
import {
  getDefaultLanguage,
  defaultDetectOptions,
  saveSelectedLanguage,
  IDetectOptions,
} from "./utils/detect.js";

const observerNodeOptions = {
  childList: true,
  subtree: true,
};

const observerTextOptions = {
  subtree: true,
  characterData: true,
};

const macroRegex = /\s(I18NDOM|I18N)_(\S+)\s((.(?!I18N))+)/g;
const macroIngoreRegex = /\s(I18NDOM_IGNORE|I18N_I)/;
const hasMacroRegex = /\s(I18NDOM_|I18N_)/;

interface IInit {
  attachNode?: Node;
  htmlLanguage?: string;
  resource: { [key: string]: string[] };
  fallbackLng?: string;
  detection?: IDetectOptions;
  language?: string;
}

interface IMacroContent {
  hasMacro: boolean;
  isIgnore: boolean;
  startIndex: number;
  matchedData: { key: string; value: string }[];
  matchedKey: string;
}

class I18nDOM {
  attachNode: Node;
  htmlLanguage: string;
  resource: object;
  fallbackLng: string;
  detectOptions: IDetectOptions;
  textObserver: MutationObserver;
  nodeObserver: MutationObserver;
  language: string;

  constructor({
    attachNode,
    htmlLanguage,
    resource,
    language,
    fallbackLng,
    detection,
  }: IInit) {
    this.attachNode = attachNode || document.body;
    this.htmlLanguage = htmlLanguage || document.documentElement.lang || "en";
    this.resource = resource;
    this.fallbackLng = fallbackLng;
    this.detectOptions = Object.assign({}, defaultDetectOptions, detection);
    this.setLanguage(language || getDefaultLanguage(this.detectOptions), false);

    this.textObserver = new MutationObserver((mutationList) => {
      this.stopTextObserve();
      mutationList.forEach((mutation) => {
        this.translateTextNode(mutation.target as Text, this.htmlLanguage);
      });
      this.startTextObserve();
    });

    this.nodeObserver = new MutationObserver((mutationList) => {
      this.stopTextObserve();
      mutationList.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 3) {
            this.translateTextNode(node as Text, this.htmlLanguage);
          } else {
            this.translateNodeTree(node, this.htmlLanguage);
          }
        });
      });
      this.startTextObserve();
    });

    this.startObserve();
  }

  startTextObserve() {
    this.textObserver.observe(this.attachNode, observerTextOptions);
  }
  stopTextObserve() {
    this.textObserver.disconnect();
  }

  startNodeObserve() {
    this.nodeObserver.observe(this.attachNode, observerNodeOptions);
  }
  stopNodeObserve() {
    this.nodeObserver.disconnect();
  }

  startObserve() {
    this.startTextObserve();
    this.startNodeObserve();
  }
  stopObserve() {
    this.stopTextObserve();
    this.stopNodeObserve();
  }

  setLanguage(lang: string, save: boolean = true) {
    const langList = Object.keys(this.resource);
    let result = this.fallbackLng || langList[0];
    if (langList.indexOf(lang) !== -1) {
      result = lang;
    }

    this.language = result;
    save && saveSelectedLanguage(result, this.detectOptions);
  }

  changeLanguage(lang: string) {
    if (this.language !== lang) {
      const originalLanguage = this.language;
      this.setLanguage(lang);
      this.stopObserve();
      this.translateNodeTree(this.attachNode, originalLanguage);
      this.startObserve();
    }
  }

  getMacroContent(text: string): IMacroContent {
    const matchedMacro = [...text.matchAll(macroRegex)];
    const matchedIgnore = text.match(macroIngoreRegex);

    const isIgnore = !!matchedIgnore;
    const hasMacro = !!matchedMacro.length || isIgnore;
    let startIndex = matchedMacro[0]?.index || -1;
    if (isIgnore) {
      startIndex =
        matchedMacro[0]?.index > matchedIgnore.index
          ? matchedIgnore.index
          : matchedMacro[0]?.index;
    }

    let matchedData = [];
    let matchedKey = "";

    if (hasMacro) {
      matchedMacro.forEach((info) => {
        // info = ["match content", "I18NDOM_IGNORE | I18N_I", "main macro key", "main content"]
        let key = info[2];
        if (key === "DATA" || key === "D") {
          const matchedDetail = [...info[3].matchAll(/(\S+)=(.*)/g)][0];
          matchedData.push({
            key: matchedDetail[1],
            value: matchedDetail[2],
          });
        } else if (key === "KEY" || key === "K") {
          matchedKey = matchedKey + info[0];
        }
      });
    }

    return {
      hasMacro,
      isIgnore,
      startIndex,
      matchedData,
      matchedKey,
    };
  }

  clearMacroInfo(text: string): string {
    const macroStartIndex = text.match(hasMacroRegex)?.index;
    return macroStartIndex !== undefined
      ? text.substring(0, macroStartIndex)
      : text;
  }

  translateNodeTree(root: Node, originalLanguage: string) {
    const allNode = getAllTextNodes(root);
    allNode.forEach((node) => {
      this.translateTextNode(node, originalLanguage);
    });
  }
  translateTextNode(node: Text, originalLanguage: string) {
    const originalText = node.data;
    const nextNode = node.nextSibling as Comment;
    const hasI18NDOMComment =
      nextNode?.nodeType === 8 && hasMacroRegex.test(nextNode.data);

    let textInResource = originalText;
    let comment = null;
    let dataContent = [];
    let ignoreMacro = false;

    const { hasMacro, matchedData, matchedKey, startIndex, isIgnore } =
      this.getMacroContent(originalText);

    if (hasMacro) {
      ignoreMacro = isIgnore;
      dataContent = matchedData;
      comment = document.createComment(originalText.substring(startIndex));
      textInResource = `${originalText.substring(0, startIndex)}${matchedKey}`;
    } else if (hasI18NDOMComment) {
      const { matchedKey, matchedData, isIgnore } = this.getMacroContent(
        nextNode.data
      );
      ignoreMacro = isIgnore;
      dataContent = matchedData;
      if (matchedData.length) {
        matchedData.forEach((data) => {
          const { key, value } = data;
          textInResource = textInResource.replaceAll(value, `%${key}%`);
        });
      }
      textInResource = `${textInResource}${matchedKey}`;
    }

    let result = textInResource;
    if (ignoreMacro) {
      result = this.clearMacroInfo(result);
    } else {
      const index = this.resource[originalLanguage].indexOf(textInResource);
      if (index !== -1) {
        result = this.clearMacroInfo(this.resource[this.language][index]);
      }

      if (dataContent.length) {
        dataContent.forEach((data) => {
          const { key, value } = data;
          result = result.replaceAll(`%${key}%`, value);
        });
      }
    }

    node.data = result;

    if (comment) {
      if (hasI18NDOMComment) {
        nextNode.replaceWith(comment);
      } else {
        node.after(comment);
      }
    }
  }
}

export default I18nDOM;
