// interface LcrsNode {
//   val: string;
//   child: LcrsNode | null;
//   sibling: LcrsNode | null;
//   return: LcrsNode | null; // React uses 'return' instead of 'parent'
// }

export const tree = {
  val: "div",
  children: [
    {
      val: "h1",
      children: [
        { val: "p", children: [] },
        { val: "a", children: [] },
        { val: "c", children: [] },
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

function createLcrsNode(val, parent = null) {
  return {
    val,
    child: null,
    sibling: null,
    return: parent,
  };
}

function transformToLCRS(naryNode, parent = null) {
  if (!naryNode) return null;

  // 1. Create the current LCRS node
  const lcrsNode = createLcrsNode(naryNode.val, parent);

  const children = naryNode.children || [];
  let prevSibling = null;

  // 2. Iterate through children to build the linked-list chain
  for (let i = 0; i < children.length; i++) {
    // Recursively convert the child, passing current lcrsNode as parent
    const childLcrsNode = transformToLCRS(children[i], lcrsNode);

    if (i === 0) {
      // First child becomes the 'child' of current node
      lcrsNode.child = childLcrsNode;
    } else {
      // Subsequent children are linked horizontally via 'sibling'
      prevSibling.sibling = childLcrsNode;
    }

    prevSibling = childLcrsNode;
  }

  return lcrsNode;
}

export const transformToLCRS2 = (naryNode, parent = null) => {
  if (!naryNode) return;

  const lcrsNode = createLcrsNode(naryNode.val, parent);
  const children = naryNode.children;
  let prevChild = null;

  for (let i = 0; i < children?.length; i++) {
    const child = transformToLCRS2(children[i], lcrsNode);

    if (i === 0) lcrsNode.child = child;
    else prevChild.sibling = child;

    prevChild = child;
  }

  return lcrsNode;
};

const fiberRoot = transformToLCRS2(tree);
