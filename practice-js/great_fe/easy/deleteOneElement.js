// Build an array method that
// can delete one element with callback function

// [1,2,3,4,5].del(i => i === 5)

Array.prototype.del = function (fn) {
  for (let i = 0; i < this.length; i++) {
    const el = this[i];
    const isTrueToDelete = fn(el);

    if (isTrueToDelete) {
      this.splice(i, 1);
    }
  }

  return this
};

const array = [1, 2, 3, 4, 5];
console.log(array.del((i) => i === 5));

