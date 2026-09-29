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

function commitRoot() {
  // 1. Commit all deletions first
  deletions.forEach(commitWork);

  // 2. Commit all placements and updates
  commitWork(wipRoot.child);

  // 3. Swap the buffer: Current tree becomes the new baseline
  currentRoot = wipRoot;
  wipRoot = null;
}

const isEvent = (key) => key.startsWith("on");
const isProperty = (key) => key !== "children" && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (_, next) => (key) => !(key in next);

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

/**
 * Recursively mounts fiber DOM nodes to their parent DOM.
 * @param {Object|null} fiber
 */
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

// Global State Definitions
let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

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

/**
 * Executes one unit of work (processes one Fiber node).
 * @param {Object} fiber - The current unit of work
 * @returns {Object|null} - The next fiber to process
 */
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

/**
 * Entry point for rendering a JSX element to a container.render
 */
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };

  deletions = [];
  nextUnitOfWork = wipRoot;
}

export const Act = {
  createElement,
  render,
};
