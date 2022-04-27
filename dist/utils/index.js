export function getAllTextNodes(el) {
    let node;
    const textNodes = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    while ((node = walk.nextNode()))
        textNodes.push(node);
    return textNodes;
}
export function setCookie(name, value, expiresDays = 30) {
    const time = new Date();
    time.setTime(time.getTime() + expiresDays * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${time.toUTCString()}`;
}
export function getCookie(name) {
    const key = `${name}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieList = decodedCookie.split(";");
    for (let i = 0; i < cookieList.length; i++) {
        let cookie = cookieList[i];
        while (cookie.charAt(0) == " ") {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(key) == 0) {
            return cookie.substring(key.length, cookie.length);
        }
    }
    return "";
}
export function setSearch(name, value) {
    const search = new URLSearchParams(window.location.search);
    search.set(name, value);
    window.location.search = search.toString();
}
export function getSearch(name) {
    const search = new URLSearchParams(window.location.search);
    return search.get(name);
}
