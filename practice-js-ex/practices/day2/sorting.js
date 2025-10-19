const quickSort = (arr) => {
  if (arr.length <= 1) return arr;

  let pivot = arr[0];
  let left = [];
  let right = [];

  for (let i = 1; i < arr.length; i++) {
    let element = arr[i];

    if (element > pivot) left.push(element);
    else right.push(element);
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
};
console.log(quickSort([1, 3, 2, 4, 5, 1, 2, 3, 0, 9, 10, 4, 5]));
