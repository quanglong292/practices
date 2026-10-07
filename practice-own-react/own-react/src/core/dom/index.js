import { reconcileChildren, deletions } from "./reconcile.js";
import { createDom, createElement, updateDom } from "./dom.js";
import { prepareHooks, useState } from "../hooks/useState.js";

// Global State Definitions
let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;

/**
 * Schedules a new render pass starting from the currentRoot tree.
 * Enqueued when setState is dispatched by a hook.
 */
export function scheduleRerender() {
  if (!currentRoot) return;

  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };
  deletions.length = 0;
  nextUnitOfWork = wipRoot;
}

/**
 * Synchronously commits the entire work-in-progress Fiber tree to the Real DOM.
 */
function commitRoot() {
  // 1. Commit all deletions first
  deletions.forEach(commitWork);

  // 2. Commit all placements and updates
  if (wipRoot && wipRoot.child) {
    commitWork(wipRoot.child);
  }

  // 3. Swap the buffer: Current tree becomes the new baseline
  currentRoot = wipRoot;
  wipRoot = null;
  deletions.length = 0;
}

/**
 * Recursively mounts or updates fiber DOM nodes to their parent DOM.
 * Handles Function Components by traversing upwards to find the closest real DOM container.
 * @param {Object|null} fiber
 */
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
    updateDom(
      fiber.dom,
      fiber.alternate ? fiber.alternate.props : {},
      fiber.props
    );
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
    return; // Subtree unmounted; stop traversing this branch
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

/**
 * Recursively deletes real DOM nodes down the fiber subtree.
 * Descends through Function Components that do not possess their own DOM node.
 * @param {Object|null} fiber
 * @param {HTMLElement} domParent
 */
function commitDeletion(fiber, domParent) {
  if (!fiber) return;

  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    // If this fiber is a Function Component, recursively remove its children's DOM nodes
    let child = fiber.child;
    while (child) {
      commitDeletion(child, domParent);
      child = child.sibling;
    }
  }
}

/**
 * The core engine loop.
 * @param {IdleDeadline} deadline - Provided by requestIdleCallback
 */
function workLoop(deadline) {
  let shouldYield = false;

  // 1. Process fibers as long as we have time and work
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 2. Render Phase Complete -> Trigger Commit Phase
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  // 3. Re-schedule the loop for the next idle period
  requestIdleCallback(workLoop);
}

// Kickstart the engine
requestIdleCallback(workLoop);

/**
 * Executes one unit of work (processes one Fiber node).
 * Discriminates between Function Components and Host Components.
 * @param {Object} fiber - The current unit of work
 * @returns {Object|null} - The next fiber to process
 */
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

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
 * Processes a Host Component (native DOM tags like div, h1, button, etc.).
 * @param {Object} fiber
 */
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
}

/**
 * Processes a Function Component.
 * Initializes hooks, invokes the function to retrieve children, and reconciles them.
 * @param {Object} fiber
 */
function updateFunctionComponent(fiber) {
  prepareHooks(fiber);

  // Execute the component function to get its child elements
  const result = fiber.type(fiber.props);
  const children =
    result != null && result !== false
      ? Array.isArray(result)
        ? result
        : [result]
      : [];

  reconcileChildren(fiber, children);
}

/**
 * Entry point for rendering a JSX element to a container.
 * @param {Object} element
 * @param {HTMLElement} container
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

/**
 * Logical grouping component that renders children directly without extra DOM wrapper.
 */
export function Fragment(props) {
  return props.children;
}

export const Didact = {
  createElement,
  render,
  useState,
  Fragment,
};

export const Act = Didact;

export {
  createElement,
  render,
  useState,
  commitRoot,
  commitWork,
  commitDeletion,
  performUnitOfWork,
  workLoop,
};

export default Didact;
