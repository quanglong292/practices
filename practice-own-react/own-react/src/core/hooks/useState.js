import { scheduleRerender } from "../dom/index.js";

// Global State for Hooks (Step 08)
let wipFiber = null;
let hookIndex = null;

/**
 * Initializes hook tracking before evaluating a Function Component.
 * Sets wipFiber and resets hookIndex and the hooks array for the current render pass.
 * @param {Object} fiber - The Function Component fiber being processed.
 */
export function prepareHooks(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
}

/**
 * @returns {Object|null} The fiber currently executing hooks.
 */
export function getWipFiber() {
  return wipFiber;
}

/**
 * @returns {number|null} The current hook index.
 */
export function getHookIndex() {
  return hookIndex;
}

/**
 * Manages local component state and queues state actions across renders.
 * 
 * 1. Retrieves the previous hook snapshot from wipFiber.alternate.hooks[hookIndex].
 * 2. Replays all queued actions to compute the new state.
 * 3. Enqueues new actions via setState and schedules a re-render pass.
 * 4. Pushes the hook into wipFiber.hooks and increments the hookIndex pointer.
 * 
 * @param {*} initial - Initial state value or lazy factory function.
 * @returns {[*, Function]} [state, setState]
 */
export function useState(initial) {
  if (!wipFiber) {
    throw new Error("useState can only be called inside a Function Component.");
  }

  // 1. Retrieve the old hook from the previous commit
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  // 2. Initialize the hook state
  const hook = {
    state: oldHook
      ? oldHook.state
      : typeof initial === "function"
      ? initial()
      : initial,
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
    scheduleRerender();
  };

  // 5. Save the hook and increment the index pointer
  wipFiber.hooks.push(hook);
  hookIndex++;

  return [hook.state, setState];
}
