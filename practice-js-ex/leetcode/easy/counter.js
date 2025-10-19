/**
 * https://leetcode.com/problems/counter/
 * Given an integer n, return a counter function. This counter function initially returns n
 * and then returns 1 more than the previous value every subsequent time it is called (n, n + 1, n + 2, etc).
 */

const createCounter = (n) => {
  let isStartCount = false;
  return () => {
    if (!isStartCount) {
      isStartCount = true;
      return n;
    } else return (n += 1);
  };
};

const counter = createCounter(10);
console.log(counter());
console.log(counter());
console.log(counter());
console.log(counter());
