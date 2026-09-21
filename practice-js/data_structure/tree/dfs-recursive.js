const tree = {
  val: "div",
  children: [
    {
      val: "h1",
      children: [
        { val: "p", children: [] },
        { val: "a", children: [] },
      ],
    },
    {
      val: "h2",
      children: [],
    },
  ],
};

const traversal = (node, results = []) => {
  if (!node) return null;

  results.push(node.val);

  for (let i = 0; i < node.children?.length; i++) {
    const child = node.children[i];

    if (child) traversal(child, results);
  }

  return results;
};

console.log({ tr1: traversal(tree) });

// The problem of single-thread
// Generator to build a deep, single-branch tree
function createDeepTree(depth) {
  let root = { val: `node-0`, children: [] };
  let current = root;
  for (let i = 1; i <= depth; i++) {
    const next = { val: `node-${i}`, children: [] };
    current.children.push(next);
    current = next;
  }
  return root;
}

const largeTree = createDeepTree(5000);
// 10000 -> Maximum call stack size.

console.time("Recursive-DFS-5000");
const traversalResult = traversal(largeTree);
console.timeEnd("Recursive-DFS-5000");
console.log("Total nodes visited:", traversalResult.length);
debugger;
