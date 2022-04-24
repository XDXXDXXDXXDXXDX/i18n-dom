import { getAllTextNodes } from "./utils/index.js";

const observerNodeOptions = {
  childList: true,
  subtree: true,
};

const observerTextOptions = {
  subtree: true,
  characterData: true,
};

class I18n {
  constructor({ attachNode, htmlLanguage, resource, language }) {
    this.attachNode = attachNode || document.body;
    this.htmlLanguage = htmlLanguage || document.documentElement.lang || "en";
    this.language = language || this.htmlLanguage;
    this.resource = resource;

    this.textObserver = new MutationObserver((mutationList) => {
      this.stopTextObserve();
      mutationList.forEach((mutation) => {
        this.translateTextNode(mutation.target, this.htmlLanguage);
      });
      this.startTextObserve();
    });

    this.nodeObserver = new MutationObserver((mutationList) => {
      this.stopTextObserve();
      mutationList.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 3) {
            this.translateTextNode(node, this.htmlLanguage);
          } else {
            this.translateNodeTree(node, this.htmlLanguage);
          }
        });
      });
      this.startTextObserve();
    });

    this.startNodeObserve();
    this.startNodeObserve();
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

  changeLanguage(lang) {
    if (this.language !== lang) {
      const originalLanguage = this.language;
      this.language = lang;
      this.stopObserve();
      this.translateNodeTree(this.attachNode, originalLanguage);
      this.startObserve();
    }
  }

  getMacroContent(text) {
    const matchedMacro = [
      ...text.matchAll(/\sI18NDOM_(\S+)\s((.(?!I18NDOM_))+)/g),
    ];

    const hasMacro = !!matchedMacro.length;
    const startIndex = matchedMacro[0]?.index;
    let matchedData = [];
    let matchedKey = "";

    if (hasMacro) {
      matchedMacro.forEach((info) => {
        // info = ["match content", "main macro key", "main content"]
        let key = info[1];
        if (key === "DATA") {
          const matchedDetail = [...info[2].matchAll(/(\S+)=(.*)/g)][0];
          matchedData.push({
            key: matchedDetail[1],
            value: matchedDetail[2],
          });
        } else if (key === "KEY") {
          matchedKey = matchedKey + info[0];
        }
      });
    }

    return {
      hasMacro,
      startIndex,
      matchedData,
      matchedKey,
    };
  }

  translateNodeTree(root, originalLanguage) {
    const allNode = getAllTextNodes(root);
    allNode.forEach((node) => {
      this.translateTextNode(node, originalLanguage);
    });
  }
  translateTextNode(node, originalLanguage) {
    const originalText = node.data;
    const nextNode = node.nextSibling;
    const hasI18NDOMComment =
      nextNode?.nodeType === 8 && nextNode.data.includes("I18NDOM_");

    let textInResource = originalText;
    let comment = null;
    let dataContent = [];

    const { hasMacro, matchedData, matchedKey, startIndex } =
      this.getMacroContent(originalText);

    if (hasMacro) {
      dataContent = matchedData;
      comment = document.createComment(originalText.substring(startIndex));
      textInResource = `${originalText.substring(0, startIndex)}${matchedKey}`;
    } else if (hasI18NDOMComment) {
      const { matchedKey, matchedData } = this.getMacroContent(nextNode.data);
      dataContent = matchedData;
      if (matchedData.length) {
        matchedData.forEach((data) => {
          const { key, value } = data;
          textInResource = textInResource.replaceAll(value, `%${key}%`);
        });
      }
      textInResource = `${textInResource}${matchedKey}`;
    }

    const index = this.resource[originalLanguage].indexOf(textInResource);
    let result = textInResource;
    if (index !== -1) {
      result = this.resource[this.language][index];
      const macroStartIndex = result.indexOf(" I18NDOM_");
      if (macroStartIndex !== -1) {
        result = result.substring(0, macroStartIndex);
      }
    }

    if (dataContent.length) {
      dataContent.forEach((data) => {
        const { key, value } = data;
        result = result.replaceAll(`%${key}%`, value);
      });
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

export default I18n;
