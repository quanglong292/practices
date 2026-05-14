# Shadow DOM & Web Components

> **"A self-contained piece of UI that owns its styles, its DOM subtree, and its behaviour — without needing a framework."**

---

## Table of Contents

1. [The Problem They Solve](#1-the-problem-they-solve)  
2. [Shadow DOM](#2-shadow-dom)  
   - 2.1 [What it is](#21-what-it-is)  
   - 2.2 [Key Concepts](#22-key-concepts)  
   - 2.3 [Style Encapsulation](#23-style-encapsulation)  
   - 2.4 [DOM Isolation](#24-dom-isolation)  
   - 2.5 [Open vs Closed mode](#25-open-vs-closed-mode)  
3. [Web Components](#3-web-components)  
   - 3.1 [The Four APIs](#31-the-four-apis)  
   - 3.2 [Custom Elements](#32-custom-elements)  
   - 3.3 [Lifecycle Callbacks](#33-lifecycle-callbacks)  
   - 3.4 [HTML `<template>`](#34-html-template)  
   - 3.5 [`<slot>` — Content Projection](#35-slot--content-projection)  
4. [Architecture Diagram](#4-architecture-diagram)  
5. [React + Web Components](#5-react--web-components)  
6. [CSS Custom Properties as Style Hooks](#6-css-custom-properties-as-style-hooks)  
7. [Comparison Table](#7-comparison-table)  
8. [When to Use What](#8-when-to-use-what)  
9. [Quick Reference](#9-quick-reference)

---

## 1. The Problem They Solve

In a plain web app, **global CSS bleeds everywhere**:

```css
/* This affects EVERY button on the page */
button { background: red; }
```

And `document.querySelector` can reach **any** element, making widget internals public:

```js
// An external script can silently mutate widget internals
document.querySelector('.widget-internal-btn').style.display = 'none';
```

**Shadow DOM** and **Web Components** solve this by creating a hard boundary around a component's internals.

---

## 2. Shadow DOM

### 2.1 What it is

Shadow DOM is a browser API that lets you attach a **hidden, separate DOM tree** to any HTML element (the *host*). That subtree is called the **shadow tree**.

```js
const host = document.querySelector('#my-widget');
const shadowRoot = host.attachShadow({ mode: 'open' });
shadowRoot.innerHTML = `
  <style>p { color: hotpink; }</style>   <!-- scoped! -->
  <p>I'm inside the shadow.</p>
`;
```

The `<p>` inside the shadow gets `color: hotpink`, but no `<p>` outside is affected.

---

### 2.2 Key Concepts

| Term | Meaning |
|------|---------|
| **Host** | The regular DOM element that has a shadow root attached |
| **Shadow Root** | The root node of the shadow tree (returned by `attachShadow`) |
| **Shadow Tree** | The hidden DOM subtree that lives under the shadow root |
| **Light DOM** | The regular document DOM — everything NOT in a shadow tree |
| **Flattened Tree** | The combined view the browser uses for rendering (light + shadow merged via slots) |

---

### 2.3 Style Encapsulation

```
Light DOM CSS  ─────────────────────────╮
                                        │  ← CANNOT cross the boundary
                                ┌───────┴────────┐
                                │   Shadow DOM   │
                                │  <style>       │ ← scoped to shadow only
                                │  p { … }       │
                                └───────┬────────┘
                                        │  ← CANNOT leak out
Shadow CSS ─────────────────────────────╯
```

**Exception — CSS Custom Properties cross the boundary intentionally:**

```css
/* Light DOM (or :root) */
:root { --brand-color: #6366f1; }

/* Inside Shadow DOM */
:host { background: var(--brand-color); }   /* ✅ works! */
```

This is the recommended way to let consumers *theme* your component from the outside.

---

### 2.4 DOM Isolation

```js
// From outside:
document.querySelector('#secret');   // → null ❌ (even in "open" mode)

// From inside (open mode only):
host.shadowRoot.querySelector('#secret');  // → <div id="secret"> ✅
```

> **Key insight:** `document.querySelector` traverses the light DOM. It stops at shadow host boundaries. Shadow DOM is not part of the document's main tree query traversal.

---

### 2.5 Open vs Closed mode

```js
// Open — JS can still reach inside via host.shadowRoot
const shadow = host.attachShadow({ mode: 'open' });
host.shadowRoot;  // → ShadowRoot ✅

// Closed — .shadowRoot returns null; no external access at all
const shadow = host.attachShadow({ mode: 'closed' });
host.shadowRoot;  // → null 🔐
```

| Mode | `host.shadowRoot` | Use case |
|------|-------------------|----------|
| `open` | Returns the ShadowRoot | Most components — allows DevTools inspection |
| `closed` | `null` | High-security widgets (payment iframes, DRM) |

---

## 3. Web Components

Web Components is an umbrella term for **four browser standards** that together let you build fully self-contained custom HTML elements.

### 3.1 The Four APIs

| API | Purpose |
|-----|---------|
| **Custom Elements** | Define new HTML tags backed by a class |
| **Shadow DOM** | Encapsulate DOM & styles |
| **HTML Templates** | Declare inert, reusable HTML fragments |
| **Slots** | Project light-DOM content into shadow DOM |

---

### 3.2 Custom Elements

```js
class UserCard extends HTMLElement {
  // Declare which attributes to watch
  static observedAttributes = ['name', 'role'];

  // Called when the element is inserted into the DOM
  connectedCallback() {
    this._render();
  }

  // Called when a watched attribute changes
  attributeChangedCallback(name, oldValue, newValue) {
    this._render();
  }

  _render() {
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const name = this.getAttribute('name') ?? 'Anonymous';
    shadow.innerHTML = `<p>Hello, ${name}!</p>`;
  }
}

// Register the tag name
customElements.define('user-card', UserCard);
```

Usage (works in any HTML file, React, Vue, Angular…):

```html
<user-card name="Long" role="Engineer"></user-card>
```

---

### 3.3 Lifecycle Callbacks

| Callback | Fired when… |
|----------|-------------|
| `constructor()` | Element is created |
| `connectedCallback()` | Element is inserted into the document |
| `disconnectedCallback()` | Element is removed from the document |
| `attributeChangedCallback(name, old, new)` | A watched attribute changes |
| `adoptedCallback()` | Element is moved to a new document |

```js
class MyEl extends HTMLElement {
  constructor() {
    super(); // always call super first!
  }

  connectedCallback()    { console.log('mounted');   }
  disconnectedCallback() { console.log('unmounted'); }

  static observedAttributes = ['value'];
  attributeChangedCallback(name, oldVal, newVal) {
    console.log(`${name}: ${oldVal} → ${newVal}`);
  }
}
```

---

### 3.4 HTML `<template>`

A `<template>` element is **parsed but not rendered**. It's the most efficient way to stamp out repeated shadow DOM structures.

```html
<!-- Defined once in HTML (or created in JS) -->
<template id="card-tpl">
  <style>
    :host { display: block; padding: 16px; }
  </style>
  <slot name="title"></slot>
  <slot></slot>
</template>
```

```js
connectedCallback() {
  const shadow = this.attachShadow({ mode: 'open' });
  const tpl = document.getElementById('card-tpl');
  // cloneNode(true) = deep clone
  shadow.appendChild(tpl.content.cloneNode(true));
}
```

**Why not just use `innerHTML`?**

| | `innerHTML` | `<template>` |
|---|---|---|
| Parsing cost | Every time | Once, at definition |
| Performance | Slower for many instances | ✅ Faster |
| XSS risk | Higher | Lower (inert DOM) |

---

### 3.5 `<slot>` — Content Projection

Slots let consumers **inject their own content** into a specific place inside your shadow DOM.

```html
<!-- Shadow DOM template -->
<div class="card">
  <header><slot name="title">Default title</slot></header>
  <main><slot></slot></main>              <!-- default (unnamed) slot -->
  <footer><slot name="actions"></slot></footer>
</div>
```

```html
<!-- Consumer usage (Light DOM) -->
<my-card>
  <h2 slot="title">My Article</h2>       <!-- → goes into name="title" slot -->
  <p>Body content here…</p>             <!-- → goes into default slot -->
  <button slot="actions">Read more</button>
</my-card>
```

**Styling slotted content:**

```css
/* Inside shadow DOM — styles slotted elements from outside */
::slotted(button) {
  background: #6366f1;
  color: white;
}
```

> `::slotted()` only reaches the **direct** slotted child, not its descendants.

---

## 4. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      document (Light DOM)                   │
│                                                             │
│   <div id="app">          ← regular DOM tree               │
│     <my-widget>           ← Custom Element (host)           │
│       │                                                     │
│       └──● Shadow Root  (mode: open | closed)              │
│            │  ┌─────────────────────────────────────────┐  │
│            │  │          Shadow DOM subtree             │  │
│            │  │                                         │  │
│            │  │  <style> ← scoped, won't leak out       │  │
│            │  │  <slot>  ← projects Light DOM children  │  │
│            │  │  <div class="internal">…</div>          │  │
│            │  └─────────────────────────────────────────┘  │
│   </div>                                                    │
└─────────────────────────────────────────────────────────────┘

Web Component = Custom Elements + Shadow DOM + HTML Templates
```

---

## 5. React + Web Components

React and Web Components interoperate well. The main trick is passing attributes (not props) to custom elements:

```tsx
// ✅ Use ref + setAttribute for complex values
const cardRef = useRef<HTMLElement>(null);

useEffect(() => {
  cardRef.current?.setAttribute('name', name);
  cardRef.current?.setAttribute('color', color);
}, [name, color]);

return <user-card ref={cardRef} />;
```

**React 19+** will natively support passing objects/arrays as props to custom elements via the new JSX transform. For now, use `ref` + `setAttribute`.

**Listening to custom events:**

```tsx
useEffect(() => {
  const el = ref.current;
  const handler = (e: CustomEvent) => console.log(e.detail);
  el?.addEventListener('my-event', handler);
  return () => el?.removeEventListener('my-event', handler);
}, []);
```

---

## 6. CSS Custom Properties as Style Hooks

The most idiomatic way to allow external theming of a Web Component:

```css
/* Component's shadow CSS */
:host {
  --btn-bg: #6366f1;       /* default value */
  --btn-radius: 8px;
}

button {
  background: var(--btn-bg);
  border-radius: var(--btn-radius);
}
```

```css
/* Consumer overrides (light DOM / React styles) */
my-widget {
  --btn-bg: hotpink;
  --btn-radius: 0;
}
```

This is intentional — custom properties **do** cross the shadow boundary, giving consumers a controlled theming surface.

---

## 7. Comparison Table

| Aspect | Shadow DOM | Web Components |
|--------|-----------|----------------|
| What is it? | Hidden encapsulated DOM subtree | Bundle: Custom Elements + Shadow DOM + Templates |
| Style isolation | ✅ Scoped | ✅ Via Shadow DOM |
| DOM isolation | ✅ querySelector blocked | ✅ Inherited |
| Reusability | Low-level API | ✅ Ship as a single HTML tag |
| Content projection | `<slot>` | `<slot>` |
| Framework needed? | ❌ Native | ❌ Framework-agnostic |
| SSR support | Limited | Limited (improving) |

---

## 8. When to Use What

### ✅ Use Shadow DOM / Web Components when:

- Building a **design system** shared across multiple teams/frameworks
- Embedding a widget in a **3rd-party page** (chatbots, payment widgets)
- You need **zero-dependency** reusable components
- Building **micro-frontends** where teams use different frameworks

### ⚠️ Consider your framework when:

- Your app is already fully React/Vue/Angular
- You need **server-side rendering** (frameworks handle this better)
- You need **fine-grained reactive state** (frameworks win here)
- Team is more familiar with framework component model

---

## 9. Quick Reference

```js
// ── Shadow DOM ──────────────────────────────────────────
const shadow = host.attachShadow({ mode: 'open' });
shadow.innerHTML = `<style>…</style><p>…</p>`;

// Access from outside (open mode only)
host.shadowRoot.querySelector('p');

// ── Custom Element ───────────────────────────────────────
class MyEl extends HTMLElement {
  static observedAttributes = ['value'];
  connectedCallback()    { /* mount   */ }
  disconnectedCallback() { /* unmount */ }
  attributeChangedCallback(name, old, val) { /* update */ }
}
customElements.define('my-el', MyEl);

// ── Template ─────────────────────────────────────────────
const tpl = document.getElementById('my-tpl');
shadow.appendChild(tpl.content.cloneNode(true));

// ── Slot ─────────────────────────────────────────────────
// In shadow: <slot name="icon">🔔</slot>
// Consumer:  <my-el><span slot="icon">🚀</span></my-el>

// ── CSS Custom Property hook ──────────────────────────────
// In shadow: background: var(--brand, #6366f1);
// Outside:   my-el { --brand: hotpink; }
```

---

> **Author note:** All four demos on the `WebAPIs` page in this practice repo are built with **zero libraries** — pure browser APIs wired into React via `useRef` + `useEffect`. That's the whole point: these APIs live in the browser, not in npm.
