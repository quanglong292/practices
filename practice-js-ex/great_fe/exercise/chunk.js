// Group elements into chunks

const chunk = (arr, n = 1) => {
  const returnVal = [];
  let range = [];

  for (let i = 0; i < arr.length; i += n) {
    for (let j = i; j < n + i; j++) {
      const el2 = arr[j];
      if (el2) range.push(el2);
    }

    returnVal.push(range);
    range = [];
  }

  return returnVal;
};

console.log(chunk([1, 2, 3, 4, 5], 2));
