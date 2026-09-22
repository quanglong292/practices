// interface LcrsNode {
//   val: string;
//   child: LcrsNode | null;
//   sibling: LcrsNode | null;
//   return: LcrsNode | null; // React uses 'return' instead of 'parent'
// }

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

// function traverseTreeIterative(root) {
//   if (!root) return;

//   const stack = [root];
//   const result = [];

//   while (stack.length) {
//     const node = stack.pop();
//     console.log({ node });

//     result.push(node.val);

//     for (let i = node.children?.length - 1; i >= 0; i--) {
//       const child = node.children?.[i];

//       stack.push(child);
//       console.log({ child });
//     }
//   }

//   return result;
// }

const transformToLCRS = (root, parent = null) => {
  if (!root) return;

  if (!parent) {
    parent = {
      val: root.val,
      child: root.children[0],
      sibling: root.children[1] || null,
      return: root,
    };
  }
};
