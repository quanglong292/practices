function makeCounter(initialValue = 0) {
  let val = initialValue;

  return {
    get: () => val,
    increment: () => ++val,
    decrement: () => --val,
    reset: () => (val = initialValue),
  };
  // My code
  return {
    get: () => val,
    increment: () => {
      val += 1;
      return val;
    },
    reset: () => {
      val = initialValue;
      return val;
    },
    decrement: () => {
      val -= 1;
      return val;
    },
  };
}

const counter = makeCounter();
console.log(typeof counter.get);

console.log(counter.get()); // 0
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.get()); // 2
console.log(counter.reset()); // 0
console.log(counter.decrement()); // -1
console.log("end");
