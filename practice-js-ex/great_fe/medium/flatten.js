function flatten(value, returnValue = []) {
  if (!value.length) return returnValue;

  for (let i = 0; i < value.length; i++) {
    const element = value[i];
    const isObject = typeof element === "object" && element !== null;

    if (!element?.length && isObject) continue;

    if (element?.length && isObject) flatten(element, returnValue);
    else {
      returnValue.push(element);
    }
  }

  return returnValue;
}

console.log(flatten([1, 2, 3])); // [1, 2, 3]

// Inner arrays are flattened into a single level.
console.log(flatten([1, [2, 3]])); // [1, 2, 3]
console.log(
  flatten([
    [1, 2],
    [3, 4],
  ])
);

// Flattens recursively.
console.log(flatten([1, [2, [3, [4, [5]]]]])); // [1, 2, 3, 4, 5]
console.log(flatten([[], [[]], [[], [[[]]]]]));
// console.log([]);
console.log(flatten([null, true, undefined]));
