function binarySearch(arr, target) {
  // Sorting array
  const middleIndex = Math.floor(arr.length / 2);
  const middleItem = arr[middleIndex];

  if (middleItem === target) return middleIndex;

  const pointer = middleItem > target ? 0 : middleIndex;
  let returnVal = -1;
  for (let i = pointer; i < arr.length; i++) {
    const el = arr[i];

    if (el === target) return i;
  }

  return returnVal;
}

// console.log(binarySearch([1, 2, 3, 6, 9, 11], 6));
// console.log(binarySearch([1, 2, 3, 12, 14, 16], 5));
console.log(binarySearch([1, 2, 3, 10, 11, 20], 2));
console.log("end");
