// [ADVANCED] - DYNAMIC CURRY FUNCTION
function curry(func) {
  return function curried(...args) {
    if (func.length !== args.length) {
      return curried.bind(this, ...args);
    }

    return func.call(this, ...args);
  };
}

const sum3 = (x, y, z) => x + y + z;
const totalSumCurried = curry(sum3);
console.log(totalSumCurried(1)(2)(3));

// [BASIC] - CURRY FUNCTION
const processOrder =
  (fn) =>
  (...args) => {
    console.log(`Processing order #${args[0]}`);
    return fn(...args);
  };

function curry1(arg1) {
  return (arg2) => {
    return (arg3) => {
      return `${arg1}-${arg2}-${arg3}`;
    };
  };
}

const curry2 = (arg1) => (arg2) => (arg3) => `${arg1}-${arg2}-${arg3}`;

const myChain = curry1("chain1")("chain2")("chain3");
const myChain2 = curry2("chain1")("chain2")("chain3");

// console.log(myChain);
// console.log(myChain2);
