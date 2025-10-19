const selectionSort = (array = [2, 3, 1, 4, 1, 3213]) => {
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    for (let index2 = index + 1; index2 < array.length; index2++) {
      const element2 = array[index2];
      if (element2 < element) {
        array[index2] = array[index];
        array[index] = element2;
      }
    }
  }

  return array;
};

// console.log(selectionSort()); // O(n*n)

const mergeSort = (array = [2, 3, 1, 4, 1, 3213]) => {
  const length = array.length;
  if (!length || length === 1) return array;

  const splitNumber = Math.floor(length / 2);
  const left = array.slice(0, splitNumber);
  const right = array.slice(splitNumber);

  const mergeSort = (left, right) => {};
  const sort = (array) => {};

  return mergeSort(sort(left), sort(right));
};

// console.log(mergeSort());

const quickSort = (array) => {
  const length = array.length;
  if (!length || length === 1) return array;

  const randomIndex = Math.floor(Math.random() * length);
  const lastIndex = array.length - 1;
  let pivot = array[randomIndex];
  array[randomIndex] = array[lastIndex];
  array[lastIndex] = pivot;

  let left = []; // all elements that >= pivit
  let right = []; // all elements that <= pivot

  for (let index = 0; index < array.length - 1; index++) {
    let leftBound = array[index];
    let rightBound = array[array.length - 2 - index];

    if (leftBound > pivot) {
      left.push(leftBound);
    } else {
      right.push(rightBound);
    }
  }

  return { array, left, right };
};

const quickSort2 = (arr, position) => {
  if (arr.length <= 1) {
    return arr;
  }

  let pivot = arr[0];
  let leftArr = [];
  let rightArr = [];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < pivot) {
      leftArr.push(arr[i]);
    } else {
      rightArr.push(arr[i]);
    }
  }

  console.log(`array ${position}: `, arr);
  console.log("l | r", leftArr, rightArr);
  // console.log("process: ", [...leftArr, pivot, ...rightArr]);

  return [...quickSort2(leftArr, "left"), pivot, ...quickSort2(rightArr, "right")];
};

console.log(quickSort2([5, 1, 6, 4, 2, 3], "origin"));
// (1). 6 - [5] - 1 4 2 3
// (2). 6 - (5 - [1] - 4 2 3)
// (3). 6 - (5 - (1 - (4 2 3)))
// (3). 6 - (5 - (1 - (2 3 - [4] - ...))))
// (3). 6 - (5 - (1 - ((... - [2] - 3) - 4 - ...))))
// (3). 6 - (5 - (1 - ((... - [2] - 3) - 4 - ...))))
