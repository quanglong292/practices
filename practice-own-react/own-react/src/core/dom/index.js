import { reconcileChildren, deletions } from "./reconcile";
import { createDom, createElement, updateDom } from "./dom";

function commitRoot() {
  // 1. Commit all deletions first
  deletions.forEach(commitWork);

  // 2. Commit all placements and updates
  commitWork(wipRoot.child);

  // 3. Swap the buffer: Current tree becomes the new baseline
  currentRoot = wipRoot;
  wipRoot = null;
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

/**
 * The core engine loop.
 * @param {IdleDeadline} deadline - Provided by requestIdleCallback
 */
function workLoop(deadline) {
  let shouldYield = false;

  // 1. Process fibers as long as we have time and work
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    console.log({ nextUnitOfWork });

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

  deletions.length = 0;
  nextUnitOfWork = wipRoot;
}

export const Act = {
  createElement,
  render,
};
