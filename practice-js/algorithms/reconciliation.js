/**
 * ============================================================
 * RECONCILIATION ALGORITHM - Learning Examples
 * ============================================================
 *
 * Reconciliation is the process React (and similar frameworks) use to
 * diff the previous virtual DOM tree against the new one, then apply
 * the minimal set of changes to the real DOM.
 *
 * Core idea:
 *   1. Build a lightweight virtual DOM (plain JS objects).
 *   2. On update, diff old vDOM vs new vDOM.
 *   3. Produce a patch list.
 *   4. Apply patches to the real DOM.
 *
 * Topics covered:
 *   1. Virtual DOM basics
 *   2. Simple diffing (same-type elements)
 *   3. Children diffing WITHOUT keys  ← O(n²) naive
 *   4. Children diffing WITH keys     ← O(n) optimised
 *   5. Component-level reconciliation
 *   6. Full mini-reconciler putting it all together
 */

// ─────────────────────────────────────────────────────────────
// 1.  VIRTUAL DOM BASICS
// ─────────────────────────────────────────────────────────────
/**
 * A virtual node is just a plain object:
 *   { type, props, children }
 *
 * createElement is a tiny factory (like React.createElement).
 */

function createElement(type, props = {}, ...children) {
  return {
    type,
    props,
    // Flatten nested arrays and convert primitives to text-nodes
    children: children.flat().map((child) =>
      typeof child === "object" ? child : createTextElement(child)
    ),
  };
}

function createTextElement(text) {
  return { type: "TEXT_ELEMENT", props: { nodeValue: String(text) }, children: [] };
}

// Example virtual trees
const oldTree = createElement(
  "div",
  { id: "root", className: "container" },
  createElement("h1", {}, "Hello"),
  createElement("p", {}, "World")
);

const newTree = createElement(
  "div",
  { id: "root", className: "container updated" }, // class changed
  createElement("h1", {}, "Hello"),               // unchanged
  createElement("p", {}, "React")                 // text changed
);

console.log("--- 1. Virtual DOM Basics ---");
console.log("Old tree:", JSON.stringify(oldTree, null, 2));
console.log("New tree:", JSON.stringify(newTree, null, 2));


// ─────────────────────────────────────────────────────────────
// 2.  SIMPLE DIFFING  (same-type, no children reorder)
// ─────────────────────────────────────────────────────────────
/**
 * Rules:
 *   - If type changes  → REPLACE entirely.
 *   - If type is same  → UPDATE props + recurse into children.
 *   - If node removed  → REMOVE.
 *   - If node added    → INSERT.
 */

const PATCH_TYPES = {
  REPLACE: "REPLACE",
  UPDATE_PROPS: "UPDATE_PROPS",
  UPDATE_TEXT: "UPDATE_TEXT",
  INSERT: "INSERT",
  REMOVE: "REMOVE",
  MOVE: "MOVE",
};

/**
 * diff(oldNode, newNode) → array of patch operations
 */
function diff(oldNode, newNode, patches = [], path = "root") {
  // Case A: both are absent – nothing to do
  if (!oldNode && !newNode) return patches;

  // Case B: new node added
  if (!oldNode) {
    patches.push({ type: PATCH_TYPES.INSERT, node: newNode, path });
    return patches;
  }

  // Case C: old node removed
  if (!newNode) {
    patches.push({ type: PATCH_TYPES.REMOVE, path });
    return patches;
  }

  // Case D: text node content changed
  if (oldNode.type === "TEXT_ELEMENT" && newNode.type === "TEXT_ELEMENT") {
    if (oldNode.props.nodeValue !== newNode.props.nodeValue) {
      patches.push({
        type: PATCH_TYPES.UPDATE_TEXT,
        path,
        oldValue: oldNode.props.nodeValue,
        newValue: newNode.props.nodeValue,
      });
    }
    return patches;
  }

  // Case E: element type changed → replace whole subtree
  if (oldNode.type !== newNode.type) {
    patches.push({ type: PATCH_TYPES.REPLACE, node: newNode, path });
    return patches;
  }

  // Case F: same type → check props + recurse children
  const propPatches = diffProps(oldNode.props, newNode.props);
  if (Object.keys(propPatches).length > 0) {
    patches.push({ type: PATCH_TYPES.UPDATE_PROPS, path, changes: propPatches });
  }

  // Recurse into children (naive – positional matching)
  const maxLen = Math.max(oldNode.children.length, newNode.children.length);
  for (let i = 0; i < maxLen; i++) {
    diff(oldNode.children[i], newNode.children[i], patches, `${path}[${i}]`);
  }

  return patches;
}

function diffProps(oldProps, newProps) {
  const changes = {};
  // Detect changed/added props
  for (const key of Object.keys(newProps)) {
    if (oldProps[key] !== newProps[key]) changes[key] = { old: oldProps[key], new: newProps[key] };
  }
  // Detect removed props
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps)) changes[key] = { old: oldProps[key], new: undefined };
  }
  return changes;
}

console.log("\n--- 2. Simple Diffing ---");
const patches = diff(oldTree, newTree);
console.log("Patches:", JSON.stringify(patches, null, 2));


// ─────────────────────────────────────────────────────────────
// 3.  CHILDREN DIFFING  — WITHOUT KEYS  (naïve, O(n²))
// ─────────────────────────────────────────────────────────────
/**
 * Problem:  When children reorder, positional matching produces MANY
 *           unnecessary patches because every item after the insertion
 *           point is compared with its wrong counterpart.
 *
 * Example:  [A, B, C]  →  [X, A, B, C]
 *   Positional diff sees:
 *     pos 0: A vs X  → REPLACE
 *     pos 1: B vs A  → REPLACE
 *     pos 2: C vs B  → REPLACE
 *     pos 3: ∅ vs C  → INSERT
 *   Result: 4 operations instead of 1 INSERT at front.
 */

function naiveDiffChildren(oldChildren, newChildren) {
  const patches = [];
  const maxLen = Math.max(oldChildren.length, newChildren.length);
  for (let i = 0; i < maxLen; i++) {
    const o = oldChildren[i];
    const n = newChildren[i];
    if (!o) {
      patches.push({ type: "INSERT", node: n, index: i });
    } else if (!n) {
      patches.push({ type: "REMOVE", index: i });
    } else if (o.type !== n.type || o.props?.key !== n.props?.key) {
      patches.push({ type: "REPLACE", node: n, index: i });
    } else {
      // same – might still update props/text
      const propDiff = diffProps(o.props, n.props);
      if (Object.keys(propDiff).length) patches.push({ type: "UPDATE_PROPS", changes: propDiff, index: i });
    }
  }
  return patches;
}

console.log("\n--- 3. Without Keys (naïve) ---");
const oldList = [
  createElement("li", {}, "A"),
  createElement("li", {}, "B"),
  createElement("li", {}, "C"),
];
const newList = [
  createElement("li", {}, "X"), // inserted at front
  createElement("li", {}, "A"),
  createElement("li", {}, "B"),
  createElement("li", {}, "C"),
];
console.log("Without keys – patches:", naiveDiffChildren(oldList, newList));
// You'll see 4 operations instead of 1.


// ─────────────────────────────────────────────────────────────
// 4.  CHILDREN DIFFING  — WITH KEYS  (optimised, O(n))
// ─────────────────────────────────────────────────────────────
/**
 * When every child has a stable `key` prop, we can build a hash-map
 * of the old children, look up each new child in O(1), and detect
 * moves/inserts/removes correctly.
 *
 * Same scenario:  [A, B, C]  →  [X, A, B, C]
 *   With keys we see:
 *     X is new → INSERT
 *     A, B, C exist → keep (possibly reorder)
 *   Result: 1 operation.
 */

function keyedDiffChildren(oldChildren, newChildren) {
  const patches = [];

  // Build index map: key → old node
  const oldKeyMap = new Map();
  oldChildren.forEach((child, i) => {
    const key = child.props?.key ?? i; // fall back to index if no key
    oldKeyMap.set(key, { node: child, index: i });
  });

  const newKeyOrder = [];

  newChildren.forEach((newChild, newIndex) => {
    const key = newChild.props?.key ?? newIndex;
    const oldEntry = oldKeyMap.get(key);

    if (!oldEntry) {
      // New node – INSERT
      patches.push({ type: "INSERT", node: newChild, beforeKey: key });
    } else {
      // Existing node – check props
      const propDiff = diffProps(oldEntry.node.props, newChild.props);
      if (Object.keys(propDiff).length)
        patches.push({ type: "UPDATE_PROPS", key, changes: propDiff });
      oldKeyMap.delete(key); // mark as consumed
    }

    newKeyOrder.push(key);
  });

  // Anything left in oldKeyMap was not in the new list → REMOVE
  for (const [key] of oldKeyMap) {
    patches.push({ type: "REMOVE", key });
  }

  // Detect moves by comparing position in old vs new order
  // (simplified: just flag if order changed)
  const oldKeys = oldChildren.map((c, i) => c.props?.key ?? i);
  newKeyOrder.forEach((key, newIdx) => {
    const oldIdx = oldKeys.indexOf(key);
    if (oldIdx !== -1 && oldIdx !== newIdx) {
      patches.push({ type: "MOVE", key, fromIndex: oldIdx, toIndex: newIdx });
    }
  });

  return patches;
}

console.log("\n--- 4. With Keys (optimised) ---");
const oldListKeyed = [
  createElement("li", { key: "A" }, "A"),
  createElement("li", { key: "B" }, "B"),
  createElement("li", { key: "C" }, "C"),
];
const newListKeyed = [
  createElement("li", { key: "X" }, "X"), // new
  createElement("li", { key: "A" }, "A"),
  createElement("li", { key: "B" }, "B"),
  createElement("li", { key: "C" }, "C"),
];
console.log("With keys – patches:", keyedDiffChildren(oldListKeyed, newListKeyed));
// You'll see only 1 INSERT + 3 MOVEs – much fewer DOM mutations.


// ─────────────────────────────────────────────────────────────
// 5.  COMPONENT-LEVEL RECONCILIATION
// ─────────────────────────────────────────────────────────────
/**
 * React distinguishes between HOST elements (div, span …) and
 * COMPONENT elements (MyComponent).
 *
 * Rules:
 *   - Same component type → UPDATE (re-render with new props, keep instance).
 *   - Different type      → UNMOUNT old + MOUNT new (no reuse).
 *
 * This is why you should NEVER define components inside render –
 * each render creates a new function reference, making React think
 * the type changed every time!
 */

// Simulate component instances
class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
  }
  setState(partial) {
    this.state = { ...this.state, ...partial };
    console.log(`[${this.constructor.name}] setState → re-render`);
  }
}

class Counter extends Component {
  render() {
    return createElement("div", {}, `Count: ${this.state.count ?? 0}`);
  }
}

function reconcileComponent(oldInstance, NewType, newProps) {
  if (oldInstance instanceof NewType) {
    // Same type → update props, keep instance alive
    oldInstance.props = newProps;
    console.log("[reconcileComponent] Same type → UPDATE props, keep instance");
    return oldInstance;
  } else {
    // Different type → destroy old, create new
    console.log("[reconcileComponent] Different type → UNMOUNT + MOUNT");
    return new NewType(newProps);
  }
}

console.log("\n--- 5. Component-Level Reconciliation ---");
const instance1 = new Counter({ initial: 0 });
instance1.setState({ count: 5 });

// Re-render with same type (Counter) → instance kept
const instance2 = reconcileComponent(instance1, Counter, { initial: 0 });
console.log("Same instance?", instance1 === instance2); // true

// Re-render with different type → new instance
class Timer extends Component {}
const instance3 = reconcileComponent(instance1, Timer, {});
console.log("Same instance?", instance1 === instance3); // false


// ─────────────────────────────────────────────────────────────
// 6.  MINI RECONCILER  (putting it all together)
// ─────────────────────────────────────────────────────────────
/**
 * A minimal but complete reconciler that:
 *   1. Creates real DOM nodes from virtual nodes.
 *   2. On update, diffs and patches only what changed.
 *
 * NOTE: This runs in Node.js without a real DOM, so we simulate
 *       a DOM with plain objects. In a browser you'd use
 *       document.createElement, element.setAttribute, etc.
 */

// ── Simulated DOM (works in Node.js) ──
class FakeElement {
  constructor(tag) {
    this.tag = tag;
    this.attributes = {};
    this.children = [];
    this.textContent = null;
    this._vnode = null; // store last vnode for diffing
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  removeAttribute(k) { delete this.attributes[k]; }
  appendChild(child) { this.children.push(child); }
  removeChild(child) { this.children = this.children.filter((c) => c !== child); }
  insertBefore(newChild, refChild) {
    const idx = this.children.indexOf(refChild);
    if (idx === -1) this.children.push(newChild);
    else this.children.splice(idx, 0, newChild);
  }
  toString(indent = 0) {
    const pad = " ".repeat(indent);
    if (this.tag === "TEXT") return `${pad}"${this.textContent}"`;
    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => ` ${k}="${v}"`)
      .join("");
    const kids = this.children.map((c) => c.toString(indent + 2)).join("\n");
    return kids
      ? `${pad}<${this.tag}${attrs}>\n${kids}\n${pad}</${this.tag}>`
      : `${pad}<${this.tag}${attrs} />`;
  }
}

const fakeDocument = {
  createElement: (tag) => new FakeElement(tag),
  createTextNode: (text) => {
    const el = new FakeElement("TEXT");
    el.textContent = text;
    return el;
  },
};

// ── Mount: vnode → real DOM ──
function mount(vnode, doc = fakeDocument) {
  if (vnode.type === "TEXT_ELEMENT") {
    const el = doc.createTextNode(vnode.props.nodeValue);
    el._vnode = vnode;
    return el;
  }
  const el = doc.createElement(vnode.type);
  // Set props (skip children, key, ref …)
  for (const [k, v] of Object.entries(vnode.props)) {
    if (k !== "children" && k !== "key") el.setAttribute(k, v);
  }
  // Mount children
  for (const child of vnode.children) {
    el.appendChild(mount(child, doc));
  }
  el._vnode = vnode;
  return el;
}

// ── Patch: reconcile real DOM element against new vnode ──
function patch(domEl, newVnode, doc = fakeDocument) {
  const oldVnode = domEl._vnode;

  // Type changed → replace
  if (oldVnode.type !== newVnode.type) {
    const newEl = mount(newVnode, doc);
    domEl.parentElement?.children.splice(
      domEl.parentElement.children.indexOf(domEl),
      1,
      newEl
    );
    return newEl;
  }

  // Text node
  if (newVnode.type === "TEXT_ELEMENT") {
    if (domEl.textContent !== newVnode.props.nodeValue) {
      domEl.textContent = newVnode.props.nodeValue;
    }
    domEl._vnode = newVnode;
    return domEl;
  }

  // Update props
  const allPropKeys = new Set([
    ...Object.keys(oldVnode.props),
    ...Object.keys(newVnode.props),
  ]);
  for (const k of allPropKeys) {
    if (k === "children" || k === "key") continue;
    if (newVnode.props[k] === undefined) domEl.removeAttribute(k);
    else if (newVnode.props[k] !== oldVnode.props[k]) domEl.setAttribute(k, newVnode.props[k]);
  }

  // Reconcile children (keyed)
  reconcileChildren(domEl, oldVnode.children, newVnode.children, doc);

  domEl._vnode = newVnode;
  return domEl;
}

function reconcileChildren(parentEl, oldChildren, newChildren, doc) {
  // Build key → domEl map
  const oldKeyToDom = new Map();
  parentEl.children.forEach((domChild, i) => {
    const key = domChild._vnode?.props?.key ?? i;
    oldKeyToDom.set(key, domChild);
  });

  const newDomChildren = [];

  newChildren.forEach((newChild, i) => {
    const key = newChild.props?.key ?? i;
    const oldDomEl = oldKeyToDom.get(key);

    if (oldDomEl) {
      // Exists → patch in place
      newDomChildren.push(patch(oldDomEl, newChild, doc));
      oldKeyToDom.delete(key);
    } else {
      // New → mount
      newDomChildren.push(mount(newChild, doc));
    }
  });

  // Remove stale nodes
  for (const [, domEl] of oldKeyToDom) {
    parentEl.removeChild(domEl);
  }

  // Reorder children on parent
  parentEl.children = newDomChildren;
}

// ── Demo ──
console.log("\n--- 6. Mini Reconciler ---");

const v1 = createElement(
  "ul",
  { id: "list" },
  createElement("li", { key: "a" }, "Apple"),
  createElement("li", { key: "b" }, "Banana"),
  createElement("li", { key: "c" }, "Cherry")
);

const realDOM = mount(v1);
console.log("Initial DOM:\n" + realDOM.toString());

// Update: remove Banana, add Durian at top, rename Cherry → Cherry Pie
const v2 = createElement(
  "ul",
  { id: "list" },
  createElement("li", { key: "d" }, "Durian"),   // new
  createElement("li", { key: "a" }, "Apple"),     // moved
  createElement("li", { key: "c" }, "Cherry Pie") // text updated
  // "b" (Banana) removed
);

patch(realDOM, v2);
console.log("\nAfter patch:\n" + realDOM.toString());


// ─────────────────────────────────────────────────────────────
// SUMMARY — Key Takeaways
// ─────────────────────────────────────────────────────────────
/**
 * 1. VIRTUAL DOM
 *    Lightweight JS objects mirroring the real DOM tree.
 *    Cheap to create/throw away; actual DOM mutations are expensive.
 *
 * 2. DIFFING HEURISTICS (React's O(n) assumptions)
 *    a. Two elements of DIFFERENT TYPE produce completely different trees.
 *       → Replace entirely; do not try to reconcile sub-trees.
 *    b. Keys help identify which children changed across renders.
 *       → Without keys, React falls back to positional matching (O(n²) worst).
 *
 * 3. KEY RULES
 *    - Keys must be STABLE (don't use Math.random() or array index for dynamic lists).
 *    - Keys must be UNIQUE among siblings (not globally).
 *    - Keys are NOT passed as props to the component.
 *
 * 4. FIBER  (React 16+)
 *    Real React uses a "Fiber" architecture that breaks reconciliation
 *    into small units of work ("fibers") so the browser can interrupt
 *    long renders and handle user input first (Concurrent Mode).
 *    The core ALGORITHM is still the same diff logic shown here.
 *
 * 5. COMMON MISTAKES
 *    - Defining component functions INSIDE render → type reference changes
 *      every render → React unmounts + remounts → state lost, effects re-run.
 *    - Using array index as key in a reorderable list → wrong element reuse.
 *    - Mutating state directly → React can't detect the change → no re-render.
 */
