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
import I18nDOM from "i18n-dom";

const i18n = new I18nDOM({
  htmlLanguage: "en", // The language in which the web page is written
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

Fix translation errors caused by synonyms.

It is more common for the same text to have different meanings, such as animal:

```js
const i18n = new I18nDOM({
  htmlLanguage: "en",
  resource: {
    en: ["animal", "animal"],
    zh: ["动物", "野兽"],
    ru: ["животное", "зверь"],
  },
});
```

Because there are two identical animals in the English list, there will be an error when switching languages.

The first solution, recommended, is not to use the same words, but to use synonyms instead, e.g.

```js
const i18n = new I18nDOM({
  htmlLanguage: "en",
  resource: {
    en: ["animal", "beast"],
    zh: ["动物", "野兽"],
    ru: ["животное", "зверь"],
  },
});
```

The second way is to use I18NDOM_KEY. Add a special tag `I18NDOM_KEY + KeyName` to each language list for synonyms, e.g.

```js
const i18n = new I18nDOM({
  htmlLanguage: "en",
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

### I18NDOM_DATA

There is dynamic data in the string.

In situations such as displaying user information, you may need to dynamically replace certain words in a sentence.

First, use the symbol `%` to wrap the content that needs to be dynamically replaced:

```js
const i18n = new I18nDOM({
  htmlLanguage: "en",
  resource: {
    en: ["Welcome %name%! Your age is %age%"],
    zh: ["欢迎%name%！你的年龄是%age%"],
    ru: ["Добро пожаловать, %имя%! Ваш возраст: %age%"],
  },
});
```

Then use I18NDOM_DATA to insert the data content in the code, dynamically replace the content behind name= and age=

```html
<span
  >Welcome %name%! Your age is %age% I18NDOM_DATA name=Jay Chou I18NDOM_DATA
  age=18</span
>
```

When you use some data-responsive frameworks like React, you need to use some hacks to combine the text into a node to use this macro, the following is used in react:

```html
<span
  >{"Welcome %name%! Your age is %age% I18NDOM_DATA name=${name} I18NDOM_DATA
  age=${age}"}</span
>
```

## Need help or need more features

You can visit [the issue page of the code repository](https://github.com/XDXXDXXDXXDXXDX/i18n-dom/issues) and leave a message, I will check it regularly.
