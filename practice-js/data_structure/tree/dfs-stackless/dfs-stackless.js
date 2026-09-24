const { transformToLCRS2, tree } = require("../n-ary-lcrs/n-ary-lcrs");

const fiberNode = transformToLCRS2(tree);

const performWorkUnit = (node, result = []) => {
  result.push(node.val);

  if (node.child) node = node.child;
  else {
    while (node) {
      if (node.sibling) {
        node = node.sibling;
        break;
      }
      node = node.return;
    }
  }

  return node;
};

const traversing = (root) => {
  if (!root) return;

  let currentNode = root;
  const result = [];

  while (currentNode) {
    currentNode = performWorkUnit(currentNode, result);
  }

  return result;
};

console.log({ fiberNode, values: traversing(fiberNode) });

debugger;
