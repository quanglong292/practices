// find most duplicate element in array

const findMostDuplicate = (
  array = [1, 3, 3, 3, 3, 3, 2, 8, 4, 4, 5, 5, 5, 9]
) => {
  let max = 0;
  let maxVal = 0;
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    let findMax = 0;
    for (let j = 0; j < array.length; j++) {
      const echItem = array[j];
      if (item === echItem) {
        findMax += 1;
      }
    }

    if (max < findMax) {
      max = findMax;
      maxVal = item;
    }
  }

  return maxVal;
};

console.log(findMostDuplicate());
