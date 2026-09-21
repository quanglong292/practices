/**
 * Iterative Pre-order DFS using an explicit array stack on the Heap.
 * @param {TreeNode|null} root
 * @returns {string[]}
 */
function traverseTreeIterative(root) {
  if (!root) return;

  const stack = [root];
  const result = [];

  while (stack.length) {
    const node = stack.pop();
    console.log({ node });

    result.push(node.val);

    for (let i = node.children?.length - 1; i >= 0; i--) {
      const child = node.children?.[i];

      stack.push(child);
      console.log({ child });
    }
  }

  return result;
}

// Verification with Sample Tree
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

console.log("Iterative Traversal:", traverseTreeIterative(tree));
// Output: ["div", "h1", "p", "a", "h2"]
debugger;
