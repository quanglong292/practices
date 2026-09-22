# Step 03: Transforming N-ary Tree into LCRS Tree (Left-Child Right-Sibling)

## 1. Context & Motivation

In **Step 02**, we used an explicit `stack = []` to avoid the native Call Stack. However, that approach still suffered from severe limitations:

- It required maintaining an auxiliary dynamic array on the Heap.
- It required a reverse `for` loop to push children into the stack.
- It did not eliminate the memory overhead of `node.children = []` on every single element.

To solve this, React switched from an **N-ary Tree** (`children: []`) to an **LCRS Binary Tree** (_Left-Child Right-Sibling_), augmented with a `return` (parent) pointer.

By converting the children array into a **Singly Linked List**, a node only needs to reference its **first child** (`child`), while that child references its next peer via `sibling`.

---

## 2. Structural Transformation

### N-ary Tree Representation (Mental Model: DOM / JSX)

Each node contains an array of direct children.

```text
          [ div ]
         /       \
      [ h1 ]    [ h2 ]
      /    \
    [ p ]  [ a ]
```

### LCRS Tree Representation (Mental Model: Fiber Tree)

Each node contains at most two pointers:

- `child`: Points to its **first child** only.
- `sibling`: Points to its **immediate next sibling**.
- `return`: Points back to its **parent** (doubly-linked back to ancestor).

```text
       [ div ]
          |
        child
          |
          v
       [ h1 ]  ---- sibling ---->  [ h2 ]
          |
        child
          |
          v
        [ p ]  ---- sibling ---->  [ a ]
```

Notice: The N-ary tree has been transformed into an asymmetric **Binary Tree** where left branches mean "go deeper" and right branches mean "go to next sibling".

---

## 3. Schemas

### Input Schema (N-ary Node)

```typescript
interface NaryNode {
  val: string;
  children: NaryNode[];
}
```

### Output Schema (LCRS / Fiber Node)

```typescript
interface LcrsNode {
  val: string;
  child: LcrsNode | null;
  sibling: LcrsNode | null;
  return: LcrsNode | null; // React uses 'return' instead of 'parent'
}
```

---

## 4. Problem Statement

Implement a function `transformToLCRS(naryRoot)` that takes an N-ary tree root and converts the entire hierarchy into an LCRS tree structure.

### Conversion Rules

1. If node has no children: `child = null`.
2. `child` always points to `children[0]`.
3. For each child at `i`:
   - `child[i].sibling = child[i + 1]`.
   - Last child's `sibling = null`.
4. Every child must set its `return` pointer back to the parent node.

---

## 5. Implementation

```javascript
/**
 * Factory to create an LCRS Fiber-like Node
 * @param {string} val
 * @param {Object|null} parent
 * @returns {Object}
 */
function createLcrsNode(val, parent = null) {
  return {
    val,
    child: null,
    sibling: null,
    return: parent,
  };
}

/**
 * Transforms an N-ary tree into an LCRS tree with parent pointers.
 * @param {Object|null} naryNode
 * @param {Object|null} parent
 * @returns {Object|null}
 */
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

// ------------------- Verification -------------------

const naryTree = {
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

const fiberRoot = transformToLCRS(naryTree);

// Verify pointers:
console.log("Root:", fiberRoot.val); // "div"
console.log("Root child:", fiberRoot.child.val); // "h1"
console.log("h1 sibling:", fiberRoot.child.sibling.val); // "h2"
console.log("h1 child:", fiberRoot.child.child.val); // "p"
console.log("p sibling:", fiberRoot.child.child.sibling.val); // "a"
console.log("p return (parent):", fiberRoot.child.child.return.val); // "h1"
console.log("h2 return (parent):", fiberRoot.child.sibling.return.val); // "div"
```

---

## 6. How Didact / React Reconciler Does This Dynamically

In real React (and in the Didact tutorial's `performUnitOfWork`), we do **not** convert the whole tree upfront. Instead, as we visit each node, we read its JSX `element.props.children` and construct the `child` and `sibling` pointers on the fly:

```javascript
// Excerpt from Didact Step IV
const elements = fiber.props.children;
let index = 0;
let prevSibling = null;

while (index < elements.length) {
  const element = elements[index];

  const newFiber = {
    type: element.type,
    props: element.props,
    parent: fiber, // React core: fiber.return
    dom: null,
    child: null,
    sibling: null,
  };

  if (index === 0) {
    fiber.child = newFiber;
  } else {
    prevSibling.sibling = newFiber;
  }

  prevSibling = newFiber;
  index++;
}
```

Notice the exact $1:1$ equivalence between our standalone transformation logic and the core reconciliation loop of Didact.

---

## 7. Key Trade-offs: N-ary Tree vs. LCRS Tree

| Feature                          | Standard N-ary (`children: []`)                | LCRS Tree (`child`, `sibling`, `return`)                               |
| :------------------------------- | :--------------------------------------------- | :--------------------------------------------------------------------- |
| **Data representation**          | Array of object references                     | Singly linked list per hierarchy level                                 |
| **Child lookup by index ($k$)**  | $O(1)$ directly: `node.children[k]`            | $O(k)$ traversing `.sibling` pointer chain                             |
| **Child insertion / reorder**    | $O(n)$ due to array element shifting           | $O(1)$ pointer redirection (linked list)                               |
| **Traversability without stack** | Impossible (requires stack to hold loop index) | **Trivial** via `child` $\rightarrow$ `sibling` $\rightarrow$ `return` |
| **Memory footprint**             | 1 Node Object + 1 Array Object per parent      | Flat Node Object with 3 raw reference fields                           |

---

## 8. Summary Checklist Before Moving to Step 4

- [x] You know how an N-ary tree is mapped onto a binary LCRS tree.
- [x] You understand why `children[0]` is assigned to `.child` and `children[1..n]` are chained via `.sibling`.
- [x] You understand the critical purpose of the `.return` pointer (the back-link to parent).

$\rightarrow$ **Next Milestone:** _Step 04: Stackless DFS Traversal with Parent Pointer (Rebuilding React's performUnitOfWork)._
