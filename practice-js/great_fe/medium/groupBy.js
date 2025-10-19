function groupBy(array, iteratee) {
  const returnVal = {};
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    const key = iteratee(element);

    if (!returnVal[key]) returnVal[key] = [element];
    else returnVal[key].push(element);
  }
  console.log(returnVal);

  return returnVal;
}

groupBy([6.1, 4.2, 6.3], Math.floor);
// => { '4': [4.2], '6': [6.1, 6.3] }

groupBy([{ n: 3 }, { n: 5 }, { n: 3 }], (o) => o.n);
// => { '3': [{ n: 3 }, { n: 3 }], '5': { n: 5 } }
groupBy([], (o) => o); // => {}

groupBy([{ n: 1 }, { n: 2 }], (o) => o.m); // => { undefined: [{ n: 1 }, { n: 2 }] }
console.log("end");
