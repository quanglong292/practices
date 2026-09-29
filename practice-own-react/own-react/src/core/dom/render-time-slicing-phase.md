# Step 05: The Render Phase & Time Slicing (TODO 1)

## 1. Context & Motivation

In the previous steps, we successfully built a **Stackless DFS Traversal** using the `child`, `sibling`, and `return` pointers.

However, running a `while (nextUnitOfWork)` loop synchronously will still block the browser if the component tree is massive. We need to chunk the work and yield control back to the browser periodically. This phase—calculating the Fiber tree and creating DOM nodes in memory without attaching them to the screen—is called the **Render Phase**.

We achieve this using `requestIdleCallback` (the browser's native API that inspired React's `Scheduler` package).

---

## 2. Global State Definitions

To make our traversal interruptible, the execution state must live outside the function scope. We need two global variables:

1. `nextUnitOfWork`: A pointer tracking the current Fiber node being processed.
2. `wipRoot` (Work In Progress Root): A reference to the root of the Fiber tree we are currently building. We need this because once the loop finishes, we must know where the tree starts to commit it to the DOM.

```javascript
let nextUnitOfWork = null;
let wipRoot = null;
```

---

## 3. The Time-Sliced Work Loop

The `workLoop` is the heartbeat of React. It runs constantly when there is work to do, checking the browser's clock to decide whether to continue or pause.

```javascript
/**
 * The core engine loop.
 * @param {IdleDeadline} deadline - Provided by requestIdleCallback
 */
function workLoop(deadline) {
  let shouldYield = false;

  // 1. Process fibers as long as we have time and work
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // Yield if we have less than 1ms left before the browser needs to paint
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 2. Render Phase Complete -> Trigger Commit Phase
  if (!nextUnitOfWork && wipRoot) {
    commitRoot(); // (We will build this in TODO 2)
  }

  // 3. Re-schedule the loop for the next idle period
  requestIdleCallback(workLoop);
}

// Kickstart the engine
requestIdleCallback(workLoop);
```

---

## 4. Bridging LCRS with DOM Creation

Now we update `performUnitOfWork`. It does exactly three things:

1. Creates the real DOM node (in memory).
2. Converts JSX children into LCRS Fiber nodes.
3. Returns the next pointer using the `child -> sibling -> return` rules.

```javascript
/**
 * Executes one unit of work (processes one Fiber node).
 * @param {Object} fiber - The current unit of work
 * @returns {Object|null} - The next fiber to process
 */
function performUnitOfWork(fiber) {
  // 1. Create DOM node if it doesn't exist yet
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // NOTE: We DO NOT append the DOM node here anymore!
  // Appending here causes incomplete UI rendering (half-baked UI).
  // DOM mutation is strictly reserved for the Commit Phase.

  // 2. Reconcile Children (Convert N-ary children to LCRS Fiber nodes)
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber, // The 'return' pointer
      dom: null,
    };

    // Attach to LCRS tree
    if (index === 0) {
      fiber.child = newFiber; // First child
    } else {
      prevSibling.sibling = newFiber; // Subsequent children
    }

    prevSibling = newFiber;
    index++;
  }

  // 3. Find the next unit of work (Stackless DFS Traversal)
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent; // Climb up
  }

  return null;
}
```

---

## 5. Kickstarting the Render Phase

To start building a tree, we set the `wipRoot` and point `nextUnitOfWork` to it. The `workLoop` will automatically pick it up.

```javascript
/**
 * Entry point for rendering a JSX element to a container.
 */
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  };

  // Point the engine to the root to start the Render Phase
  nextUnitOfWork = wipRoot;
}
```

---

## 6. Summary Checklist (TODO 1)

- [x] Defined global state (`nextUnitOfWork`, `wipRoot`).
- [x] Implemented `requestIdleCallback` loop with time-slicing check (`deadline.timeRemaining() < 1`).
- [x] Removed synchronous `appendChild` mutations from `performUnitOfWork`.
- [x] Connected the LCRS generator to the stackless DFS traversal.

$\rightarrow$ **Next Milestone:** _TODO 2: The Commit Phase (Mounting the full tree to the Real DOM synchronously)._
