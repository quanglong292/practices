// Array.prototype.filter creates a new array populated with the results of calling a provided function on every element in the calling array.

// For sparse arrays (e.g. [1, 2, , 4]), the empty values should be ignored while traversing the array (i.e. they should not be in the resulting array).

// Implement Array.prototype.filter. To avoid overwriting the actual Array.prototype.filter which is being used by the autograder, we shall instead implement it as Array.prototype.myFilter.

// Examples

// [1, 2, 3, 4].myFilter((value) => value % 2 == 0); // [2, 4]
// [1, 2, 3, 4].myFilter((value) => value < 3); // [1, 2]
// Notes
// The filter callback function takes in more than just the element! There's also a second parameter for Array.prototype.filter. You are recommended to read the specification for Array.prototype.filter on MDN Docs before attempting.

Array.prototype.myFilter = function (fn, thisArg) {
    let results = [];
    const array = this

    for (let index = 0; index < array.length; index++) {
        const element = array[index];

        const value = fn(element, index)

        if (
            Object.hasOwn(this, index) &&
            fn.call(thisArg, value, index, this)
        ) {
            results.push(value);
        }
    }

    return results
}

Array.prototype.myFilter = function (callbackFn, thisArg) {
    const len = this.length;
    const results = [];

    // Snapshot the original range so callback-side pushes do not extend the walk.
    for (let k = 0; k < len; k++) {
        const kValue = this[k];
        if (
            // Native filter skips holes entirely instead of invoking the predicate
            // with `undefined` for missing indexes.
            Object.hasOwn(this, k) &&
            callbackFn.call(thisArg, kValue, k, this)
        ) {
            results.push(kValue);
        }
    }

    return results;
};