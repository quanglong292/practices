// Leetcode: 589. N-ary Tree Preorder Traversal
// root = [1, null, 3, 2, 4, null, 5, 6]
//        1
//     /  |  \
//    3   2   4
//   / \
//  5   6
// Result: [1,3,5,6,2,4]
// ---
// build root: 1
// go to chilren 1.chilren -> loop -> push 3 2 4 -> 3.children -> push 5 6.

// Đây là những gì biến `root` thực sự nắm giữ khi code của bro thực thi
// const root = {
//   val: 1,
//   children: [
//     {
//       val: 3,
//       children: [
//         { val: 5, children: [] },
//         { val: 6, children: [] }
//       ]
//     },
//     {
//       val: 2,
//       children: []
//     },
//     {
//       val: 4,
//       children: []
//     }
//   ]
// };

function preorder(root) {
  const result = [];

  if (!root) return result;

  const push = (children) => {
    if (!children || !children.length) return;

    for (let i = 0; i < children.length; i++) {
      const node = children[i];

      if (typeof node?.val === "number") result.push(node.val);
      if (node.children) push(node.children);
    }
  };

  result.push(root.val);

  push(root.children);

  return result;
}
