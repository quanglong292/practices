async function promiseAll(iterable) {
  const intoArray = new Array(...iterable);
  if (!intoArray.length) return;
  const returnValue = [];

  console.log("length -->", intoArray.length);

  for (let i = 0; i < intoArray.length; i++) {
    const element = intoArray[i];
    const isFn = typeof element === "function";
    const isPromise = Boolean(element?.then);

    if (isPromise) {
      try {
        const value = await element
          .then((j) => j)
          .catch((err) => console.error(err));
        returnValue.push(value);
      } catch (error) {
        console.error(error);
        throw error;
      }
    } else returnValue.push(element);
  }

  return returnValue;
}
const p0 = Promise.resolve(3);
const p1 = 42;
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("foo");
  }, 100);
});
// console.log(promiseAll([p0, p1, p2]).then((value) => value));
// console.log(promiseAll([p0, p1, p2]).then((value) => value)); // [3, 42, 'foo']
// console.log("end");

async function main() {
    const promiseA = new Promise((resolve) => {
        setTimeout(() => resolve('Promising'), 1000); // Resolve after 1 second
      });
  const promiseB = await promiseA.then((i) => {
    console.log(i); // Logs: "Promising"
    return i; // Ensure the then block returns the value
  });

  console.log(promiseB); // Logs: "Promising"
}

main(); // Call the async function to execute
