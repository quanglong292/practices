function makeCounter(initialValue = 0) {
  let count = initialValue;

  return () => {
    let currentCount = count;
    count += 1;
    return currentCount;
  };
}

const counter = makeCounter();

console.log("makeCounter() :>> ", counter());
console.log("makeCounter() :>> ", counter());
console.log("makeCounter() :>> ", counter());
console.log("makeCounter() :>> ", counter());
