function intersectionBy(cb, ...arrays) {
  const obj = {
    // "1-3": [1.2],
    // "2-2": [2.3],
    // "2-1": [2.1],
    // "3-2": [3.4],
    // "4-2": [4.5],
    // `{cbVal}-{raw}`: <count>
  };
  const returnValue = [];

  for (let i = 0; i < arrays.length; i++) {
    const array = arrays[i];

    for (let j = 0; j < array.length; j++) {
      const element = array[j];
      const cbVal = cb(element);
      const key = `${cbVal}`;
      const markedV = `${i}-${j}-${element}`;
      if (obj[key]) {
        const isExist = obj[key].findIndex(v => v.split("-")[0] === `${i}`)
        if (isExist === -1) obj[key].push(markedV);
      } else {
        obj[key] = [markedV];
      }
    }
  }

  for (const key in obj) {
    const val = obj[key];

    if (val.length >= arrays.length) {
      const [level, index] = val[0].split("-")
      returnValue.push(arrays[level][index]);
    }
  }

  console.log({ obj, returnValue });
  return returnValue;
}

// Get the intersection based on the floor value of each number
// const result = intersectionBy(Math.floor, [1.2, 2.4], [2.5, 3.6]); // => [2.4]

// Get the intersection based on the lowercase value of each string
// const result2 = intersectionBy(
//   (str) => str.toLowerCase(),
//   ["apple", "banana", "ORANGE", "orange"],
//   ["Apple", "Banana", "Orange"]
// );
// => ['apple', 'banana', 'ORANGE']

// const arr1 = [1.2, 2.3, 3.4]; // [1, 2, 3]
// const arr2 = [2.1, 1.2, 4.5]; // [2, 1, 4]
// const arr3 = [1.2, 4.5, 2.3, 3.4]; // [1, 4, 2, 3]
// const iteratee = Math.floor;
// const result3 = intersectionBy(iteratee, arr1, arr2, arr3); // => [1.2, 2.3]

const arr1 = ["apple", "banana", "pear"];
const arr2 = ["orange", "kiwi", "banana"];
const arr3 = ["grape", "pear", "watermelon"];
const iteratee = (value) => value.length;
intersectionBy(iteratee, arr1, arr2, arr3); // => ['pear']

console.log("end");

function intersectionByWrong(iteratee, ...arrays) {
  const obj = {};
  const returnVal = [];

  arrays = arrays.flat();

  for (let i = 0; i < arrays.length; i++) {
    const element1 = arrays[i];
    const key = iteratee(element1);
    if (!obj[key]) {
      obj[key] = {
        raw: element1,
        value: 1,
      };
    } else {
      obj[key] = { ...obj[key], value: obj[key].value + 1 };
    }
  }

  const objValues = Object.values(obj);
  console.log({ objValues });

  for (let i = 0; i < objValues.length; i++) {
    const val = objValues[i];
    console.log({ val });

    if (val.value >= 2) returnVal.push(val.raw);
  }
  console.log({ returnVal });

  return returnVal;
}
