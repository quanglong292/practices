const strings = ["a", "b", "c", "d"];
// 4*4 = 16 bytes of storage

strings.push("e"); // O(1) | O(n)

strings.unshift("x"); // O(n)

strings.splice(2, 0, "alien"); // O(n)

const reverseString = (str) => {
  if (typeof str !== "string" || str.length < 2) return str;

  let reverse = "";
  for (let i = 0; i < str.length; i++) {
    reverse += str[str.length - i - 1];
  }

  return reverse;
};

console.log(reverseString("Hi my name")); // => eman ym iH - O(n)

const sorting = (array) => {
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    const element2 = array[index + 1];

    if (element2 < element) {
      array[index] = element2;
      array[index + 1] = element;
    }
  }

  return array;
};

const mergeSortedArray = (a = [0, 3, 4, 31], b = [4, 6, 30]) => {
  const merged = [...a, ...b];

  return sorting(merged);
};

console.log(mergeSortedArray());
