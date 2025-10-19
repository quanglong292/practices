Array.prototype.myConcat = function (...items) {
  if (!items?.length) return this;
  const newArr = [...this];

  for (let i = 0; i < items.length; i++) {
    const element = items[i];

    if (Array.isArray(element)) {
      newArr.push(...element);
      continue;
    }

    newArr.push(element);
  }
  return newArr;
};

console.log([1].myConcat(1, [2, 3], 4));
console.log("-end");
