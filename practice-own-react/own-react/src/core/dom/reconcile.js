export const deletions = [];

export function reconcileChildren(wipFiber, elements) {
  let index = 0;
  // Get the first child of the old fiber from alternate
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  // Loop through both new elements and old fiber siblings
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    // Check if the old fiber and new element have the same type
    const sameType = oldFiber && element && element.type === oldFiber.type;

    // CASE 1: UPDATE
    // Same type -> Keep the existing DOM node, update props
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom, // REUSE OLD DOM NODE
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    // CASE 2: PLACEMENT
    // Different type or new element -> Needs a brand-new DOM node
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    // CASE 3: DELETION
    // Old fiber exists, but no corresponding new element -> Delete old node
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber); // Track node for Commit Phase
    }

    // Advance to the next sibling in the old tree
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    // Link into LCRS structure
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      // Alwas start from index > 0
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
