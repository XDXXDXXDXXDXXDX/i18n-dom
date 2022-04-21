export function getAllTextNodes(el) {
  let node;
  const textNodes = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  while ((node = walk.nextNode())) textNodes.push(node);
  return textNodes;
}
