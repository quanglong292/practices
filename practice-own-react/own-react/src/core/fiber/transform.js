export const transformToLCRS = (naryNode, parent = null) => {
  if (!naryNode) return;

  const lcrsNode = createLcrsNode(naryNode.val, parent);
  const children = naryNode.children;
  let prevChild = null;

  for (let i = 0; i < children?.length; i++) {
    const child = transformToLCRS(children[i], lcrsNode);

    if (i === 0) lcrsNode.child = child;
    else prevChild.sibling = child;

    prevChild = child;
  }

  return lcrsNode;
};
