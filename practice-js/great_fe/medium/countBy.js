function countBy(array, iteratee) {
  const returnVal = {};

  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    const key = iteratee(element);

    if (returnVal[key]) returnVal[key] += 1;
    else returnVal[key] = 1;
  }
  console.log(returnVal);

  return returnVal;
}

countBy([6.1, 4.2, 6.3], Math.floor);
// => { '4': 1, '6': 2 }
countBy([{ n: 3 }, { n: 5 }, { n: 3 }], (o) => o.n);
// => { '3': 2, '5': 1 }
countBy([], (o) => o); // => {}
countBy([{ n: 1 }, { n: 2 }], (o) => o.m); // => { undefined: 2 }
