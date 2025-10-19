// Bubble
const bubbleSort = (arr) => {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      const element = arr[j];
      const element2 = arr[j + 1];

      if (element > element2) {
        arr[j] = element2;
        arr[j + 1] = element;
      }
      count++;
    }
  }
  console.log(count);
  return arr;
};

let count = 0;

// Quick
const quickSort = (arr) => {
  if (arr.length <= 1) return arr;

  let pivot = arr[0];
  let leftArr = [];
  let rightArr = [];

  for (let i = 1; i < arr.length; i++) {
      count++;
      if (arr[i] > pivot) {
      leftArr.push(arr[i]);
    } else {
      rightArr.push(arr[i]);
    }
  }

  console.log(count);
  return [...quickSort(leftArr), pivot, ...quickSort(rightArr)];
};
console.log(bubbleSort([1, 3, 2, 4, 5, 1, 2, 3, 0, 9, 10, 4, 5]));
console.log(quickSort([1, 3, 2, 4, 5, 1, 2, 3, 0, 9, 10, 4, 5]));
// console.log(bubbleSort([1, 3, 2, 4, 5, 1, 2, 3]));
