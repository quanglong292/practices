/**
 * Write code that enhances all arrays such that you can call the array.last() method on any array and it will return the last element.
 * If there are no elements in the array, it should return -1.
 * You may assume the array is the output of JSON.parse.
 */
function lastElement() {
  let lastItem = null;
  if (!this.length) return -1;
  for (let i = 0; i < this.length; i++) {
    const item = this[i];
    if (i === this.length - 1) lastItem = item;
  }

  return lastItem;
}
Array.prototype.last = lastElement;

// console.log([null, {}, 3, 4].last());
