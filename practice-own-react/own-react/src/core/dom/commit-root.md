# Step 06: The Commit Phase (TODO 2)

## 1. Context & Architectural Role

In **TODO 1 (Render Phase)**, our engine constructed the entire Fiber tree in memory, assigning `fiber.dom` via `createDom()`. We purposefully omitted `appendChild` inside `performUnitOfWork` to avoid painting partial, flickering UI.

Now, once `workLoop` determines that:

1. `nextUnitOfWork === null` (all fibers in the tree are calculated), and
2. `wipRoot !== null` (there is an uncommitted tree ready in memory),

the engine triggers the **Commit Phase**.

Unlike the Render Phase, the Commit Phase is **synchronous and uninterruptible**. It executes immediately in a single pass to ensure all visual updates hit the screen within the same browser frame.

---

## 2. Trigger Point inside `workLoop`

Here is where the engine switches from the asynchronous Render Phase to the synchronous Commit Phase:

```javascript
function workLoop(deadline) {
  let shouldYield = false;

  // Render Phase: Interruptible via shouldYield
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // --- TRANSITION POINT ---
  // When no more work remains, commit the complete WIP tree to the Real DOM
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}
```

---

## 3. The Commit Functions: `commitRoot` & `commitWork`

The Commit Phase is handled by two simple functions:

### 3.1. `commitRoot()`

Acts as the entry point and boundary manager:

1. Calls `commitWork` on the first child of the root (`wipRoot.child`).
2. Clears `wipRoot` so the engine knows the current work cycle is officially finished.

```javascript
/**
 * Synchronously commits the entire work-in-progress Fiber tree to the Real DOM.
 */
function commitRoot() {
  // wipRoot itself represents the container (e.g., #root).
  // We commit starting from its first actual rendered child.
  commitWork(wipRoot.child);

  // Reset WIP root: Work is complete
  wipRoot = null;
}
```

### 3.2. `commitWork(fiber)`

Recursively traverses down the completed Fiber tree and attaches each node's DOM element to its parent's DOM element:

```javascript
/**
 * Recursively mounts fiber DOM nodes to their parent DOM.
 * @param {Object|null} fiber
 */
function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  // 1. Locate the parent DOM node
  // In simple host trees, fiber.parent always contains a valid .dom
  const domParent = fiber.parent.dom;

  // 2. Perform the DOM mutation
  if (fiber.dom) {
    domParent.appendChild(fiber.dom);
  }

  // 3. Recursively commit child branch first (DFS)
  commitWork(fiber.child);

  // 4. Recursively commit sibling branch
  commitWork(fiber.sibling);
}
```

---

## 4. End-to-End Execution Flow

Here is the exact lifecycle from calling `render()` to seeing pixels on screen:

```text
Didact.render(element, container)
         │
         ▼
[ RENDER PHASE (Asynchronous & Can Pause) ]
  - Sets wipRoot & nextUnitOfWork
  - workLoop() processes units of work
  - performUnitOfWork():
      ├── Calls createDom(fiber) -> builds HTMLElement in memory
      ├── Converts children array into LCRS fiber nodes (child/sibling)
      └── Returns next pointer (child -> sibling -> parent.sibling)
  - Interrupted if deadline.timeRemaining() < 1, resumes on next idle callback
  - When nextUnitOfWork === null -> Render Phase Complete!
         │
         ▼
[ COMMIT PHASE (Synchronous & Atomic) ]
  - commitRoot() is called
  - commitWork(wipRoot.child) runs recursively:
      ├── Appends fiber.dom to domParent
      ├── Visits all children & siblings without yielding
  - wipRoot = null
         │
         ▼
[ BROWSER REPAINT ]
  - Hardware VSync triggers -> Browser paints complete DOM in one single pass.
  - Zero UI tearing, zero half-baked elements.
```

---

## 5. Verifiable Implementation (Runnable Code)

Bro can run this complete snippet directly in the browser console or Node.js (with DOM simulation like JSDOM):

```javascript
// --- 1. Element Descriptors ---
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child),
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

// --- 2. State & Engine ---
let nextUnitOfWork = null;
let wipRoot = null;

function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  const domParent = fiber.parent.dom;
  if (fiber.dom) {
    domParent.appendChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
}

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
  return null;
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
```

---

## 6. The Limitation of This Step (Why we need TODO 3)

Right now, our Commit Phase only knows how to do **one thing**: `appendChild()`.

If you call `render()` a second time with modified props or reordered elements:

1. It does not update existing nodes.
2. It does not remove deleted nodes.
3. It simply stacks new DOM elements right below the old ones inside the container.

To make our library truly reactive, we must introduce **Reconciliation (Diffing)** in the next step to compare the old tree against the new tree before committing.

---

## 7. Summary Checklist (TODO 2)

- [x] Defined `commitRoot()` to serve as the entry boundary for real DOM updates.
- [x] Implemented recursive `commitWork()` to mount child and sibling nodes to their parent DOM.
- [x] Linked the completion of `performUnitOfWork` (`!nextUnitOfWork && wipRoot`) to `commitRoot()`.
- [x] Reset `wipRoot = null` to conclude the commit cycle.

$\rightarrow$ **Next Milestone:** _TODO 3: Reconciliation & Diffing (The `alternate` pointer, `effectTag`, and `deletions` array)._
