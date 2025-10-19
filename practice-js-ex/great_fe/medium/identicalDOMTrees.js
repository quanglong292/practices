function identicalDOMTrees(nodeA, nodeB) {
  if (nodeA.nodeType !== nodeB.nodeType) {
    return false;
  }

  if (nodeA.nodeType === Node.TEXT_NODE) {
    return nodeA.textContent === nodeB.textContent;
  }

  // We can assume it's an element node from here on.
  if (nodeA.tagName !== nodeB.tagName) {
    return false;
  }

  const nodeAChilds = nodeA.childNodes;
  const nodeBChilds = nodeB.childNodes;

  if (nodeAChilds.length !== nodeBChilds.length) {
    return false;
  }

  if (nodeA.attributes.length !== nodeB.attributes.length) {
    return false;
  }

  const hasSameAttributes = nodeA.getAttributeNames().every((i) => {
    return nodeA.getAttribute(i) === nodeB.getAttribute(i);
  });

  if (!hasSameAttributes) return false;

  return Array.prototype.every.call(nodeAChilds, (childA, index) =>
    identicalDOMTrees(childA, nodeBChilds[index])
  );
}

const treeA = new DOMParser().parseFromString(
  `<div><span>Foo</span><p>Para</p><a href="link">Link</a></div>`,
  "text/html"
);
const treeB = new DOMParser().parseFromString(
  `<div><span>Bar</span><p>Para</p></div>`,
  "text/html"
);

console.log(identicalDOMTrees(treeA.body, treeB.body));
