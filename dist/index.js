import { getAllTextNodes } from "./utils/index.js";
import { getDefaultLanguage, defaultDetectOptions, saveSelectedLanguage, } from "./utils/detect.js";
const observerNodeOptions = {
    childList: true,
    subtree: true,
};
const observerTextOptions = {
    subtree: true,
    characterData: true,
};
class I18nDOM {
    constructor({ attachNode, htmlLanguage, resource, language, fallbackLng, detection, }) {
        this.attachNode = attachNode || document.body;
        this.htmlLanguage = htmlLanguage || document.documentElement.lang || "en";
        this.resource = resource;
        this.fallbackLng = fallbackLng;
        this.detectOptions = Object.assign({}, defaultDetectOptions, detection);
        this.setLanguage(language || getDefaultLanguage(this.detectOptions), false);
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
                    }
                    else {
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
    setLanguage(lang, save = true) {
        const langList = Object.keys(this.resource);
        let result = this.fallbackLng || langList[0];
        if (langList.indexOf(lang) !== -1) {
            result = lang;
        }
        this.language = result;
        save && saveSelectedLanguage(result, this.detectOptions);
    }
    changeLanguage(lang) {
        if (this.language !== lang) {
            const originalLanguage = this.language;
            this.setLanguage(lang);
            this.stopObserve();
            this.translateNodeTree(this.attachNode, originalLanguage);
            this.startObserve();
        }
    }
    getMacroContent(text) {
        var _a, _b, _c;
        const matchedMacro = [
            ...text.matchAll(/\sI18NDOM_(\S+)\s((.(?!I18NDOM_))+)/g),
        ];
        const matchedIgnore = text.match(" I18NDOM_IGNORE");
        const isIgnore = !!matchedIgnore;
        const hasMacro = !!matchedMacro.length || isIgnore;
        let startIndex = (_a = matchedMacro[0]) === null || _a === void 0 ? void 0 : _a.index;
        if (isIgnore) {
            startIndex =
                ((_b = matchedMacro[0]) === null || _b === void 0 ? void 0 : _b.index) > matchedIgnore.index
                    ? matchedIgnore.index
                    : (_c = matchedMacro[0]) === null || _c === void 0 ? void 0 : _c.index;
        }
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
                }
                else if (key === "KEY") {
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
    clearMacroInfo(text) {
        const macroStartIndex = text.indexOf(" I18NDOM_");
        return macroStartIndex !== -1 ? text.substring(0, macroStartIndex) : text;
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
        const hasI18NDOMComment = (nextNode === null || nextNode === void 0 ? void 0 : nextNode.nodeType) === 8 && nextNode.data.includes("I18NDOM_");
        let textInResource = originalText;
        let comment = null;
        let dataContent = [];
        let ignoreMacro = false;
        const { hasMacro, matchedData, matchedKey, startIndex, isIgnore } = this.getMacroContent(originalText);
        if (hasMacro) {
            ignoreMacro = isIgnore;
            dataContent = matchedData;
            comment = document.createComment(originalText.substring(startIndex));
            textInResource = `${originalText.substring(0, startIndex)}${matchedKey}`;
        }
        else if (hasI18NDOMComment) {
            const { matchedKey, matchedData, isIgnore } = this.getMacroContent(nextNode.data);
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
        }
        else {
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
            }
            else {
                node.after(comment);
            }
        }
    }
}
export default I18nDOM;
