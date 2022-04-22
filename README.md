# i18n-dom

The most worry-free i18n tool in the browser.

## Introduction

i18n-dom implements functions based on text nodes, so you only need to initialize the tool. No need to modify node properties, no need to introduce translated api.

When you add nodes or modify nodes, the tool will silently convert for you in the background, you only need to use your default language to develop.

⭐️ No need to assign a separate key to each text;
⭐️ Very small, only 673B after compression;
⭐️ Independent of framework, based on web api, can be used in browser environment.

## Install

```sh
npm install i18n-dom
```

## Load from CDN

```html
<script src="https://unpkg.com/i18n-dom/dist/i18n-dom.min.js"></script>
```

You can access I18n through the global class I18nDOM

## Usage

```js
import I18n from "i18n-dom";

// If it is in the browser, you need to change I18n to I18nDOM
const i18n = new I18n({
  resource: {
    en: ["Hello World!", "Second paragraph of text"],
    zh: ["你好世界！", "第二段文本"],
    ru: ["Привет, мир!", "Второй абзац текста"],
  },
});
```

Just use your default language normally in your code

```html
<p>Hello World!</p>
<p><span></span></p>
<script>
  i18n.changeLanguage("zh"); // Change the language to zh
  document.querySelector("span").innerText = "Second paragraph of text"; // "第二段文本" will automatically appear on the page!
</script>
```

That's all!

## API

### I18n Options

| Key          | Type        | Default                             | Description                                                                                                                                           |
| ------------ | ----------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| resource     | object      | {}                                  | The key is the language shorthand, and the value is an array containing all the text. The order of text needs to be consistent in different languages |
| attachNode   | HTMLElement | document.body                       | The root node of the text node that needs to be translated                                                                                            |
| htmlLanguage | string      | document.documentElement.lang or en | Default language for web pages                                                                                                                        |
| language     | string      | htmlLanguage                        | The current language of the page                                                                                                                      |

### i18n.changeLanguage(lang: string)

Change the language displayed on the page to lang.

## Macro

Macros are mainly used to solve some more complex functions or problems, such as synonyms, dynamic replacement text, etc.

🦌More macros are in development!

### I18NDOM_KEY

Fix translation errors caused by synonyms

It is more common for the same text to have different meanings, such as animal:

```js
const i18n = new I18n({
  resource: {
    en: ["animal", "animal"],
    zh: ["动物", "野兽"],
    ru: ["животное", "зверь"],
  },
});
```

Because there are two identical animals in the English list, there will be an error when switching languages.

The first solution, recommended, is not to use the same words, but to use synonyms instead. For example:

```js
const i18n = new I18n({
  resource: {
    en: ["animal", "beast"],
    zh: ["动物", "野兽"],
    ru: ["животное", "зверь"],
  },
});
```

The second way is to use I18NDOM_KEY. Add a special tag `I18NDOM_KEY + KeyName` to each language list for synonyms. For example:

```js
const i18n = new I18n({
  resource: {
    en: ["animal", "animal I18NDOM_KEY anyString"],
    zh: ["动物", "野兽 I18NDOM_KEY anyString"],
    ru: ["животное", "зверь I18NDOM_KEY anyString"],
  },
});
```

Then use the modified text in the code, the display will automatically hide the macro related content.

```html
<span>animal</span> <span>animal I18NDOM_KEY anyString</span>
```

## Need help or need more features

You can visit [the issue page of the code repository](https://github.com/XDXXDXXDXXDXXDX/i18n-dom/issues) and leave a message, I will check it regularly and look forward to your visit.
