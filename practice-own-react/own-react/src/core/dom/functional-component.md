# Step 08: Function Components & `useState` Hook (TODO 4)

## 1. Architectural Challenge

Up to Step 07, our engine assumes every Fiber maps directly to a Real DOM node:

- `fiber.type` was always a `string` (e.g., `"div"`, `"h1"`, `"button"`).
- Every Fiber created a DOM node via `createDom(fiber)`.
- Appending a child always targeted `fiber.parent.dom`.

When introducing **Function Components**:

```jsx
function App() {
  return <h1>Hello World</h1>;
}
```

Two fundamental rules break:

1. **No direct DOM node:** A Function Component Fiber (`fiber.type === App`) does **not** have its own Real DOM node. It is purely a logical wrapper.
2. **Disconnected DOM parent/child hierarchy:**
   - When finding where to append a node, we cannot simply read `fiber.parent.dom` because the parent might be a Function Component (whose `dom` is `null`). We must climb up the tree until we find a parent that has a DOM node.
   - When committing a deletion, if the node being deleted is a Function Component, we cannot call `domParent.removeChild(fiber.dom)`. We must traverse down to find its child DOM node.

---

## 2. Global State for Hooks

To manage hooks, the engine needs to track the Fiber currently being rendered and keep an index of how many hooks have been called during that render:

```javascript
let wipFiber = null; // The Fiber currently being evaluated by performUnitOfWork
let hookIndex = null; // Pointer to the current hook in wipFiber.hooks
```

---

## 3. Splitting `performUnitOfWork`

Instead of handling all fibers identically, we inspect `fiber.type`:

- If `typeof fiber.type === "function"` $\rightarrow$ Run `updateFunctionComponent`.
- Otherwise (HTML tags) $\rightarrow$ Run `updateHostComponent`.

```javascript
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // Traversal remains Stackless DFS via LCRS pointers:
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}
```

---

## 4. Host Components vs Function Components

### A. Host Component (`updateHostComponent`)

This retains the logic from earlier steps: ensure a DOM node exists, then reconcile its children directly from `fiber.props.children`.

```javascript
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}
```

### B. Function Component (`updateFunctionComponent`)

- Sets `wipFiber` and initializes `fiber.hooks = []`.
- Calls the function component directly (`fiber.type(fiber.props)`) to execute user code and retrieve the returned JSX children.
- Feeds the returned JSX into `reconcileChildren`.

```javascript
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = []; // Reset hooks array for the current render pass

  // Execute the component function to get its child elements
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
```

---

## 5. Implementing `useState`

Every call to `useState` inside a component executes this logic:

1. Check `alternate` to retrieve the previous state snapshot of this specific hook.
2. Replay all pending actions queued in `oldHook.queue` to calculate the new state.
3. Push the fresh hook instance into `wipFiber.hooks`.
4. Provide a `setState` function that pushes actions to the queue and triggers a re-render.

```javascript
export function useState(initial) {
  // 1. Retrieve the old hook from the previous commit
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  // 2. Initialize the hook state
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  // 3. Replay actions from the queue
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action instanceof Function ? action(hook.state) : action;
  });

  // 4. Dispatcher: Enqueues an action and requests a new render pass
  const setState = (action) => {
    hook.queue.push(action);

    // Trigger a new render starting from root
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  // 5. Save the hook and increment the index pointer
  wipFiber.hooks.push(hook);
  hookIndex++;

  return [hook.state, setState];
}
```

> **Why the "Rules of Hooks" Exist:**  
> Notice that hooks are identified **solely by their execution order** (`hookIndex`). They are stored in a flat array. If you put a hook inside an `if` statement or a loop, the order breaks, and React maps the state of one hook to a completely different hook on subsequent renders.

---

## 6. Upgrading `commitWork` for Virtual Boundaries

Because Function Components lack DOM nodes, our Commit Phase must handle non-DOM parent and child boundaries.

### A. Finding the Real DOM Parent

Climb up the `parent` chain until reaching a fiber that owns a DOM node:

```javascript
function commitWork(fiber) {
  if (!fiber) return;

  // 1. Climb up to find the closest real DOM container
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  // 2. Apply DOM mutations
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
    return;
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

### B. Committing Deletions for Component Trees

If a deleted fiber does not hold a DOM node (it is a Function Component), recursively dive down until you locate the real DOM node to remove:

```javascript
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    // If this fiber is a Function Component, remove its child's DOM node
    commitDeletion(fiber.child, domParent);
  }
}
```

---

## 7. Full Integration Test

Now you can run complete interactive React code with custom components and state:

```jsx
/** @jsx Didact.createElement */
import Didact, { useState } from "./didact";

function Counter() {
  const [count, setCount] = useState(1);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <p>Custom Didact Engine</p>
      <Counter />
    </div>
  );
}

const container = document.getElementById("root");
Didact.render(<App />, container);
```

---

## 8. Summary Checklist (TODO 4)

- [x] Discriminated between Host Components and Function Components via `typeof fiber.type`.
- [x] Implemented `updateFunctionComponent` to invoke functions and reconcile returned elements.
- [x] Built the `useState` hook using an ordered array (`hooks`) and action queue.
- [x] Patched `commitWork` with upward DOM search (`while (!domParentFiber.dom)`).
- [x] Patched `commitDeletion` with downward recursive search for real DOM nodes.
