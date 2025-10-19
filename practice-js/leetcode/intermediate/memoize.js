function memoize(fn) {
  const memo = {};
  return function (...args) {
    const key = JSON.stringify(args);

    if (memo[key] !== undefined) return memo[key];

    console.log({ this: this, args });
    memo[key] = fn.apply(this, args);

    return memo[key];
  };
}

let callCount = 0;
const memoizedFn = memoize(function (a, b) {
  callCount += 1;
  return a + b;
});

console.log("func ", memoizedFn(0, 0));
console.log("func ", memoizedFn(0, 0));
console.log(callCount);
// console.log("func ", memoizedFn(1, 2));
// console.log(callCount);
