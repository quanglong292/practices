# 🎓 Demystifying `Array.prototype.filter`: Why Polyfills are Surprising!

Hello! As your teacher today, I am excited to guide you through this fascinating implementation. 

If you look at the file [filter.js](file:///c:/Users/Le.Quang.Long/Desktop/practices/practice-js/great_fe/easy/filter.js), you will notice **two** implementations. The second one completely overwrites the first one. 

At first glance, a custom `filter` method seems like a simple `for` loop that checks each item. However, implementing `Array.prototype.filter` *correctly* to match the official ECMAScript (ES) specification requires handling several tricky JavaScript edge cases: **array mutations during iteration**, **sparse arrays (holes)**, and **execution context (`thisArg`)**.

Let's break down exactly why the simple way fails, analyze the major bugs in the first attempt, and understand why the second implementation is written the way it is.

---

## 🐛 1. The Broken First Attempt (Lines 14–32)

Let's look at the first implementation and why it is not only non-spec-compliant but also completely broken:

```javascript
Array.prototype.myFilter = function (fn, thisArg) {
    let results = [];
    const array = this

    for (let index = 0; index < array.length; index++) {
        const element = array[index];

        const value = fn(element, index) // ❌ Bug 1: Unbound call & early execution

        if (
            Object.hasOwn(this, index) &&
            fn.call(thisArg, value, index, this) // ❌ Bug 2: Passing a boolean as the element!
        ) {
            results.push(value); // ❌ Bug 3: Pushing the boolean return value!
        }
    }

    return results
}
```

### What went wrong here?
1. **Calling the callback twice**: The code runs `fn(element, index)` on line 21, and then calls it *again* on line 25 with `fn.call(...)`.
2. **Passing the wrong argument (The Boolean Trap)**: On line 21, `value` stores the return value of `fn(element, index)`, which is a boolean (e.g., `true` or `false`). Then, on line 25, it passes this boolean `value` as the *first argument* to `fn.call`. The callback ends up receiving `true` or `false` instead of the actual array element!
3. **Filtering out the actual data**: On line 27, it does `results.push(value)`. Instead of returning an array of filtered elements (like `[2, 4]`), this function returns an array of booleans (like `[true, true]`)!
4. **No protection against dynamic growth**: Using `index < array.length` means if the callback appends elements to the array, the loop boundary keeps growing, potentially causing an infinite loop.

---

## 🧠 2. The Robust Spec-Compliant Solution (Lines 34–52)

Now let's examine the second implementation. This is a production-grade polyfill that mirrors the native `Array.prototype.filter` behavior perfectly.

```javascript
Array.prototype.myFilter = function (callbackFn, thisArg) {
    const len = this.length; // 🔑 Point 1: Snapshotting length
    const results = [];

    for (let k = 0; k < len; k++) {
        const kValue = this[k];
        if (
            // 🔑 Point 2: Skipping empty slots (holes)
            Object.hasOwn(this, k) &&
            // 🔑 Point 3: Proper context and argument passing
            callbackFn.call(thisArg, kValue, k, this)
        ) {
            results.push(kValue);
        }
    }

    return results;
};
```

Let's dissect the three core design decisions that make this version correct and resilient.

---

### 🔑 Key Concept A: Snapshotting the Length (`const len = this.length`)

> [!IMPORTANT]  
> **The Spec Rule**: The range of elements processed by `filter` is set *before* the first invocation of `callbackFn`. Elements appended to the array after the call to `filter` begins will not be visited.

If you modify the array inside your callback, a naive loop can produce buggy behavior or crash. 

#### Example: Modifying the array mid-loop
```javascript
const numbers = [1, 2, 3];
numbers.myFilter((value, index, arr) => {
    arr.push(99); // Appending items during filtering!
    return value > 1;
});
```

* **Without snapshotting** (`index < this.length`): The loop checks the newly pushed `99`s, pushes more `99`s, and runs forever (OutOfMemory error!).
* **With snapshotting** (`k < len` where `len` is 3): The loop stops exactly at index 2, ignoring any elements added after `myFilter` started.

---

### 🔑 Key Concept B: Skipping Array Holes (`Object.hasOwn(this, k)`)

> [!IMPORTANT]  
> **The Spec Rule**: `filter()` does not run the callback function for empty slots (holes) in sparse arrays.

In JavaScript, there is a massive difference between an array slot containing `undefined` and an empty slot ("hole").

```javascript
const sparseArray = [1, , 3]; // Index 1 is a "hole" (empty slot)
const undefinedArray = [1, undefined, 3]; // Index 1 has a value of undefined
```

* For `undefinedArray`, `filter` **should** run the callback on index 1.
* For `sparseArray`, `filter` **must NOT** run the callback on index 1.

#### How `Object.hasOwn` works:
`Object.hasOwn(this, k)` checks if the array object actually has the property `k` defined on it. 
* For `sparseArray`, `Object.hasOwn(sparseArray, 1)` is `false`. The callback is skipped.
* For `undefinedArray`, `Object.hasOwn(undefinedArray, 1)` is `true`. The callback runs!

> [!NOTE]  
> Checking `this[k] !== undefined` is a common developer mistake because it would incorrectly skip indices where the value is explicitly set to `undefined`.

---

### 🔑 Key Concept C: Proper Context Binding (`thisArg` & `call`)

The standard `Array.prototype.filter` accepts an optional second argument: `thisArg`.

```javascript
const validator = {
    min: 10,
    isBigEnough(value) {
        return value >= this.min; // 'this' refers to validator
    }
};

const result = [5, 12, 8, 130, 44].filter(validator.isBigEnough, validator);
// result: [12, 130, 44]
```

If we don't bind `thisArg`, `this` inside `isBigEnough` would be `undefined` (or the global window object in non-strict mode), causing `this.min` to throw an error. 

By using `callbackFn.call(thisArg, kValue, k, this)`:
1. We explicitly set the `this` value inside the callback to `thisArg`.
2. We pass the exact three arguments mandated by the spec: the current value (`kValue`), the index (`k`), and the source array (`this`).

---

## 📊 Summary Comparison

| Feature | Naive / Broken Implementation | Spec-Compliant Polyfill |
| :--- | :--- | :--- |
| **Handles Sparse Arrays** | ❌ Runs callback with `undefined` on empty slots |  Skips holes using `Object.hasOwn(this, k)` |
| **Array Mutations (Pushes)** | ❌ Infinite loops if items are appended |  Locks boundary using `const len = this.length` |
| **Supports `thisArg`** | ❌ Hard to bind or bugs in parameter passing |  Perfect binding using `callbackFn.call(...)` |
| **Elements Returned** | ❌ Returns array of booleans or incorrect values |  Returns original values (`results.push(kValue)`) |

Now you know why standard array helper methods in JavaScript look much more detailed under the hood than standard `for` loops. Excellent coding practices always plan for these edge cases to ensure absolute reliability! Let me know if you want to explore other array polyfills like `map` or `reduce` next. 
