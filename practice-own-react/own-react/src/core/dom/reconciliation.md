# Step 07: Reconciliation & Diffing Engine (TODO 3)

## 1. Architectural Goal

Up to this point, our engine can only mount new nodes using `appendChild`. If `render()` is triggered again, it blindly creates duplicate elements on top of the old ones.

In **TODO 3**, we implement **Reconciliation**:

- Compare the existing Fiber tree currently rendered on the screen (`currentRoot`) against the new React Elements provided to the Render Phase (`wipRoot`).
- Label each Fiber node with an **`effectTag`**:
  - `"PLACEMENT"`: New node $\rightarrow$ Insert into DOM.
  - `"UPDATE"`: Same node type $\rightarrow$ Keep existing DOM node, only mutate attributes/listeners.
  - `"DELETION"`: Node removed in new elements $\rightarrow$ Remove from DOM.

---

## 2. Core Concepts: Double Buffering & `alternate`

To compare the new tree with the old tree, every Fiber node gets a pointer named **`alternate`**:

- `wipFiber.alternate`: Points to the old Fiber node that corresponds to this position in the previous commit.
- `currentRoot`: Tracks the root Fiber of the last tree successfully committed to the Real DOM.

```text
[ Previous Render ]            currentRoot (Old Fiber Tree)
                                     ▲
                                     │ .alternate
                                     ▼
[ Current Render  ]            wipRoot     (New Fiber Tree in Progress)
```

We also introduce a global array `deletions = []`. Because deleted nodes are removed from the new tree, the commit phase will not visit them via `wipRoot`. We must explicitly track them in this array so we can remove their DOM nodes later.

---

## 3. Global State Updates

We declare two new tracking variables:

```javascript
let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null; // The tree currently on the screen
let deletions = null; // Nodes that need to be removed from the DOM
```

Update `render()` to initialize these trackers and wire up the root `alternate`:

```javascript
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot, // Link new root to old root
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}
```

---

## 4. The Diffing Algorithm: `reconcileChildren`

Inside `performUnitOfWork`, instead of simply generating new fibers, we extract that logic into `reconcileChildren(wipFiber, elements)`:

```javascript
function reconcileChildren(wipFiber, elements) {
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
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}
```

Then update `performUnitOfWork` to delegate to `reconcileChildren`:

```javascript
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  // Stackless DFS Pointer Traversal
  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
  return null;
}
```

---

## 5. Committing the Mutations: `updateDom`

When updating an existing DOM node, we need to:

1. Remove deleted or changed event listeners.
2. Remove deleted properties.
3. Set new or changed properties.
4. Add new event listeners.

```javascript
const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

function updateDom(dom, prevProps, nextProps) {
  // 1. Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // 2. Remove old properties that no longer exist
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });

  // 3. Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  // 4. Add new event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}
```

---

## 6. Upgrading the Commit Pipeline

Now update `commitRoot` and `commitWork` to execute according to `effectTag` and clear `deletions`:

```javascript
function commitRoot() {
  // 1. Commit all deletions first
  deletions.forEach(commitWork);

  // 2. Commit all placements and updates
  commitWork(wipRoot.child);

  // 3. Swap the buffer: Current tree becomes the new baseline
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  const domParent = fiber.parent.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
    return; // Node is removed; no need to traverse its children
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

---

## 7. Summary Checklist (TODO 3)

- [x] Stored the committed tree via `currentRoot`.
- [x] Connected corresponding fiber nodes using the `alternate` pointer.
- [x] Implemented `reconcileChildren` to determine `PLACEMENT`, `UPDATE`, or `DELETION`.
- [x] Built `updateDom` to safely swap listeners and attributes without recreating DOM nodes.
- [x] Flushed `deletions` in `commitRoot` and swapped the double buffer (`currentRoot = wipRoot`).

$\rightarrow$ **Next Milestone:** _TODO 4: Function Components (Handling component wrappers without dedicated DOM nodes)._
