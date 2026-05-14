# Reconciliation Algorithm

> A learning guide structured as **What → Why → How**, paired with `reconciliation.js`.

---

## Table of Contents

1. [What is Reconciliation?](#1-what-is-reconciliation)
2. [Why Does It Exist?](#2-why-does-it-exist)
3. [How Does It Work?](#3-how-does-it-work)
   - 3.1 [Virtual DOM](#31-virtual-dom)
   - 3.2 [Diffing Algorithm](#32-diffing-algorithm)
   - 3.3 [Children Diffing — Without Keys](#33-children-diffing--without-keys)
   - 3.4 [Children Diffing — With Keys](#34-children-diffing--with-keys)
   - 3.5 [Component-Level Reconciliation](#35-component-level-reconciliation)
   - 3.6 [Patch & Commit](#36-patch--commit)
4. [React Fiber — Taking It Further](#4-react-fiber--taking-it-further)
5. [Common Mistakes & Gotchas](#5-common-mistakes--gotchas)
6. [Mental Model Cheatsheet](#6-mental-model-cheatsheet)
7. [Practice Exercises](#7-practice-exercises)

---

## 1. What is Reconciliation?

**Reconciliation** is the process of computing the **minimal set of changes** needed to update the real DOM when your UI state changes.

In plain terms:

```
Old UI state  ──diff──▶  New UI state  ──patch──▶  Real DOM updated
```

React (and similar frameworks like Vue, Preact, Solid) maintain a **Virtual DOM** — a lightweight copy of the real DOM tree stored as plain JavaScript objects. When state changes:

1. A **new** virtual tree is created from scratch.
2. It is **diffed** against the previous virtual tree.
3. Only the **differences (patches)** are applied to the real DOM.

### Key vocabulary

| Term | Meaning |
|------|---------|
| **Virtual DOM (vDOM)** | Plain JS object tree mirroring the real DOM |
| **Fiber** | React's internal unit of work (post v16) |
| **Diffing** | Comparing old vDOM vs new vDOM |
| **Patch** | A description of one atomic DOM change |
| **Commit** | Actually writing patches to the real DOM |
| **Reconciler** | The subsystem that owns the diff + commit loop |

---

## 2. Why Does It Exist?

### The problem: DOM mutations are slow

The real DOM is a complex C++ object. Every time you touch it the browser may trigger:

- **Style recalculation** — recompute CSS for affected elements
- **Layout (reflow)** — recalculate geometry of the page
- **Paint** — redraw pixels
- **Compositing** — layer the painted regions

Doing this naïvely (e.g., replacing `innerHTML` on every state change) is catastrophic for performance.

### The naive alternative

```js
// 🔴 Bad — replaces the ENTIRE DOM subtree on every render
container.innerHTML = renderToString(newState);
```

Problems:
- All existing DOM nodes are destroyed and recreated — O(n) real DOM mutations even if only 1 thing changed.
- Browser loses focus, scroll position, input state.
- All animations and transitions reset.

### Why virtual DOM + diffing?

```
Virtual DOM diff  →  only 2 changed nodes out of 1,000
Real DOM patch    →  only 2 DOM mutations
```

- Diffing two plain JS objects is **orders of magnitude cheaper** than touching the real DOM.
- The reconciler batches and minimises real DOM operations.
- The framework can re-render your component code as often as it wants; the real DOM is only touched when something actually changed.

---

## 3. How Does It Work?

### 3.1 Virtual DOM

> **Code reference:** `reconciliation.js` §1 — `createElement`, `createTextElement`

A virtual node (vnode) is simply:

```js
{
  type: "div",           // tag name, or a component function/class
  props: { id: "app" }, // HTML attributes / component props
  children: [ ... ]     // array of child vnodes
}
```

`createElement` is the factory that builds vnodes:

```js
function createElement(type, props = {}, ...children) {
  return { type, props, children: children.flat() };
}

// Usage (JSX compiles to exactly this)
const vnode = createElement("ul", { id: "list" },
  createElement("li", {}, "Apple"),
  createElement("li", {}, "Banana"),
);
```

**JSX → createElement:**

```jsx
// JSX (what you write)
const el = <ul id="list"><li>Apple</li></ul>;

// Compiled output (what the browser runs)
const el = createElement("ul", { id: "list" },
  createElement("li", null, "Apple")
);
```

---

### 3.2 Diffing Algorithm

> **Code reference:** `reconciliation.js` §2 — `diff`, `diffProps`

React's diffing is **O(n)** thanks to two heuristics:

#### Heuristic 1 — Elements of different type produce different trees

If the type changes, **replace the entire subtree**. Don't try to reconcile children.

```
Old: <div>               New: <span>
       <p>Hello</p>              <p>Hello</p>
     </div>                    </span>

Result: REPLACE <div> with <span>  (children are not diffed)
```

#### Heuristic 2 — Keys identify stable children across renders

(Covered in §3.4.)

#### Patch types produced by `diff()`

| Patch type | When generated |
|-----------|---------------|
| `INSERT` | Node exists in new tree, absent in old |
| `REMOVE` | Node exists in old tree, absent in new |
| `REPLACE` | Same position but different element type |
| `UPDATE_PROPS` | Same type, one or more props changed |
| `UPDATE_TEXT` | Text node value changed |
| `MOVE` | Keyed child relocated to a new position |

```js
diff(oldTree, newTree);
// → [
//   { type: "UPDATE_PROPS", path: "root", changes: { className: { old: "container", new: "container updated" } } },
//   { type: "UPDATE_TEXT", path: "root[1][0]", oldValue: "World", newValue: "React" }
// ]
```

Only **2 patches** for a tree with 5 nodes — the rest are skipped because they didn't change.

---

### 3.3 Children Diffing — Without Keys

> **Code reference:** `reconciliation.js` §3 — `naiveDiffChildren`

Without keys, children are matched **by position** (index 0 ↔ index 0, etc.).

#### The insertion problem

```
Old: [ A, B, C ]
New: [ X, A, B, C ]   ← X inserted at front
```

Positional matching sees:

```
pos 0:  A vs X  → REPLACE
pos 1:  B vs A  → REPLACE
pos 2:  C vs B  → REPLACE
pos 3:  ∅ vs C  → INSERT
```

**4 operations** for what is logically **1 INSERT**. Worse, A, B, C lose all their DOM state (focus, scroll, animations).

#### When is positional diffing acceptable?

- Static lists that **never reorder**.
- Very short lists where performance is not a concern.
- Lists where items genuinely have no stable identity.

---

### 3.4 Children Diffing — With Keys

> **Code reference:** `reconciliation.js` §4 — `keyedDiffChildren`

Assign a stable `key` prop to each child:

```jsx
<li key="a">Apple</li>
<li key="b">Banana</li>
<li key="c">Cherry</li>
```

The reconciler builds a **hash-map** `key → old DOM node`, then for each new child:

```
newChild.key → look up in map → found? patch it : mount it
```

Same scenario with keys:

```
Old: [ key:A, key:B, key:C ]
New: [ key:X, key:A, key:B, key:C ]
```

```
key:X → not in map → INSERT
key:A → found → keep (maybe MOVE)
key:B → found → keep (maybe MOVE)
key:C → found → keep (maybe MOVE)
```

**1 INSERT + 3 potential MOVEs** (MOVEs are cheap — just `insertBefore`). The nodes for A, B, C are **reused**, preserving their DOM state.

#### Key rules

| Rule | Reason |
|------|--------|
| Keys must be **stable** | Don't use `Math.random()` or dates |
| Keys must be **unique among siblings** | Not globally unique |
| **Don't use array index** for reorderable lists | Defeats the whole purpose |
| Keys are **not passed as props** | They're consumed by the reconciler only |

```jsx
// 🔴 Bad — index as key in a dynamic list
{items.map((item, i) => <li key={i}>{item}</li>)}

// ✅ Good — stable, unique business ID
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

---

### 3.5 Component-Level Reconciliation

> **Code reference:** `reconciliation.js` §5 — `reconcileComponent`

Components add another layer: the reconciler must decide whether to **update** an existing instance or **replace** it.

```
Same type  →  UPDATE   (keep instance, update props, re-render)
Diff type  →  REPLACE  (unmount old, mount new)
```

```
Old render: <Counter value={5} />
New render: <Counter value={6} />   → UPDATE — Counter instance kept, state preserved

Old render: <Counter value={5} />
New render: <Timer elapsed={10} />  → REPLACE — Counter unmounted, Timer mounted fresh
```

#### Why "same type" matters

React uses **referential equality** on the `type` field. This is why defining a component inside another component's render body is dangerous:

```jsx
// 🔴 Bad — Inner is recreated on every render
function Outer() {
  function Inner() { return <p>Hi</p>; } // new function reference each time
  return <Inner />;
}
// React sees: type changed (old Inner !== new Inner) → unmount + remount every render

// ✅ Good — Inner is defined once, reference is stable
function Inner() { return <p>Hi</p>; }
function Outer() { return <Inner />; }
```

---

### 3.6 Patch & Commit

> **Code reference:** `reconciliation.js` §6 — `mount`, `patch`, `reconcileChildren`

After diffing, patches are **committed** to the real DOM in two phases (in React):

```
┌─────────────────────────────────────────────────┐
│  RENDER PHASE  (can be interrupted)             │
│  - Run component functions                      │
│  - Build new vDOM                               │
│  - Diff old vs new                              │
│  - Collect patch list (no DOM mutations yet)    │
└───────────────────────┬─────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────┐
│  COMMIT PHASE  (synchronous, cannot interrupt)  │
│  - Apply all patches to real DOM                │
│  - Run useLayoutEffect / componentDidMount      │
│  - Run useEffect (async, after paint)           │
└─────────────────────────────────────────────────┘
```

**Mini reconciler flow (§6 simplified):**

```js
// 1. Mount: vnode → real DOM element
const dom = mount(vnode);

// 2. On state change: compute new vnode, then patch
const newVnode = createElement("ul", {}, ...updatedItems);
patch(dom, newVnode); // only touches what changed
```

---

## 4. React Fiber — Taking It Further

React 16 introduced **Fiber**, a complete rewrite of the reconciler. The algorithm stays the same, but the **execution model** changes.

### Before Fiber (Stack Reconciler)

- Diffing was one deep recursive call.
- Could not be interrupted — long trees could block the main thread for hundreds of milliseconds.
- Users experienced janky UI and dropped frames.

### With Fiber

- The tree is broken into **Fiber nodes** — one per vnode.
- Work is processed **one fiber at a time** inside a loop.
- The browser can **interrupt** between fibers to handle user input.
- **Priority lanes** — urgent updates (e.g., keyboard input) jump ahead of background work.

```
Fiber work loop (simplified):
  while (nextFiber && !shouldYield()) {
    nextFiber = performUnitOfWork(nextFiber);
  }
  if (nextFiber) scheduleCallback(workLoop); // resume later
```

This enables **Concurrent Mode** features: `useTransition`, `useDeferredValue`, Suspense streaming.

---

## 5. Common Mistakes & Gotchas

| Mistake | What goes wrong | Fix |
|---------|----------------|-----|
| Using array index as key in dynamic list | Wrong elements reused on reorder/insert | Use stable business IDs |
| Defining components inside render | Type reference changes → unmount every render, state lost | Define outside component |
| Mutating state directly | React doesn't detect change → no re-render | Always use `setState` / state setter |
| Using `Math.random()` as key | New key every render → always REPLACE, never UPDATE | Stable key |
| Missing key warning ignored | Falls back to positional diffing silently | Always key dynamic lists |
| Assuming key is a prop | `component.props.key` is `undefined` | Use a separate `id` prop if you need it |

---

## 6. Mental Model Cheatsheet

```
UI = f(state)          Every render is a pure function of state.

vDOM diff is cheap     Plain JS object comparison — microseconds.
Real DOM write is slow CSS/layout/paint — milliseconds.

Different type  →  REPLACE entire subtree (never reconcile across types).
Same type       →  UPDATE props, recurse into children.

No key          →  positional match  →  O(n) patches for front-insertion.
With key        →  hash-map lookup   →  O(1) per child.

Render phase    →  interruptible (Fiber).
Commit phase    →  synchronous (all-or-nothing DOM write).
```

---

## 7. Practice Exercises

Work through these in `reconciliation.js` or a new file.

### Exercise 1 — Read the diff output
Run the file and read the patch list from §2. Trace back each patch to the two virtual trees manually.

### Exercise 2 — Break the key rule
In §4, change the keys of `oldListKeyed` and `newListKeyed` to use array index instead.
Compare the patch output to §3. What do you notice?

### Exercise 3 — Add a deletion
In the §6 mini-reconciler demo, remove `key: "a"` (Apple) from `v2`.
Verify the DOM output no longer contains Apple.

### Exercise 4 — Extend `diff()` with key support
The `diff` function in §2 uses positional matching for children. Refactor `diff` to use the keyed diffing logic from §4.

### Exercise 5 — Simulate Fiber's yield
Modify the §6 `reconcileChildren` to process one child per "tick" using `setTimeout(fn, 0)`.
Observe how the DOM builds incrementally.

### Exercise 6 — Component state survival
Using §5's `reconcileComponent`, simulate:
- Counter rendered twice with same type → verify the `count` state survives.
- Counter replaced by Timer → verify state is reset.

---

> **Next steps:** Read the [React Reconciliation docs](https://legacy.reactjs.org/docs/reconciliation.html) and the [Fiber Architecture notes](https://github.com/acdlite/react-fiber-architecture) by Andrew Clark (React core team).
