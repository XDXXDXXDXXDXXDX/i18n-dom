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

    if (this.language !== this.htmlLanguage) {
      this.startNodeObserve();
      this.startNodeObserve();
    }
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

  changeLanguage(lang) {
    if (this.language !== lang) {
      this.startNodeObserve();
      this.startNodeObserve();
      const originalLanguage = this.language;
      this.language = lang;
      this.translateNodeTree(this.attachNode, originalLanguage);
    }
  }

  getIndex(node, lang) {
    const text = node.data;
    const nextNode = node.nextSibling;
    let macroKeyContent = "";
    if (nextNode && nextNode.nodeType === 8) {
      const comment = nextNode.data;
      const key = comment.match(/I18NDOM_KEY\s[^\sI18NDOM_]+/)[0];
      if (key) {
        macroKeyContent = ` ${key}`;
      }
    }

    return this.resource[lang].indexOf(`${text}${macroKeyContent}`);
  }

  translateNodeTree(root, originalLanguage) {
    const allNode = getAllTextNodes(root);
    allNode.forEach((node) => {
      this.translateTextNode(node, originalLanguage);
    });
  }
  translateTextNode(node, originalLanguage) {
    const index = this.getIndex(node, originalLanguage);
    const text = this.resource[this.language][index];

    let result = text;
    let comment = null;

    if (result) {
      const matchedMacro = [
        ...text.matchAll(/\sI18NDOM_([^\s]+)\s([^\sI18NDOM_]+)/g),
      ];

      if (matchedMacro.length) {
        matchedMacro.forEach((info) => {
          // info = ["match content", "main macro key", "main content"]
          let key = info[1];
          if ((key = "DATA")) {
            // TODO: Replace dynamic data in a string
          }
        });
        comment = document.createComment(text.substring(matchedMacro[0].index));
        result = text.substring(0, matchedMacro[0].index);
      }

      node.data = result;
    }

    if (comment) {
      node.after(comment);
    }
  }
}

export default I18n;
