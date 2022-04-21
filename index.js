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

  getIndex(text, lang) {
    return this.resource[lang].indexOf(text);
  }
  getText(index) {
    return this.resource[this.language][index];
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

  translateNodeTree(root, originalLanguage) {
    const allNode = getAllTextNodes(root);
    allNode.forEach((node) => {
      this.translateTextNode(node, originalLanguage);
    });
  }
  translateTextNode(node, originalLanguage) {
    const text = this.getText(this.getIndex(node.data, originalLanguage));
    if (text) {
      node.data = text;
    }
  }
}

export default I18n;
