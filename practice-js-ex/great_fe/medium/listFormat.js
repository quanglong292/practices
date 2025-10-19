function listFormat(items, options) {
  items = items.filter((i) => i);
  if (items.length === 1) return `${items[0]}`;

  if (options?.sorted) {
    items = items.sort((a, b) => a.localeCompare(b));
  }

  if (options?.unique) {
    items = items.filter((item, i) => items.indexOf(item) === i);
  }

  const maxLength =
    options?.length >= items.length || options?.length < 0
      ? 0
      : options?.length;
  const subTract = items.length - maxLength;
  const arrLength = maxLength
    ? items.length - (maxLength ? subTract : 0)
    : items.length - 1;
  let output = [];

  console.log({ items, arrLength });

  for (let i = 0; i < arrLength; i++) {
    const item = items[i];
    const isNextToLast = i === arrLength - 1;
    // console.log(item, i);
    if (isNextToLast) {
      if (maxLength) {
        output.push(`${item} and ${subTract} other${subTract > 1 ? "s" : ""}`);
      } else output.push(item + " and " + items[i + 1]);
    } else output.push(item);
  }

  return output.join(", ");
}

// console.log(listFormat([])); // ''

// console.log(listFormat(["Bob"])); // 'Bob'
// console.log(listFormat(["Bob", "Alice"])); // 'Bob and Alice'

// console.log(listFormat(["Bob", "Ben", "Tim", "Jane", "John"]));
// // 'Bob, Ben, Tim, Jane and John'

// console.log(
//   listFormat(["Bob", "Ben", "Tim", "Jane", "John"], {
//     length: 3,
//   })
// ); // 'Bob, Ben, Tim and 2 others'

// console.log(
//   listFormat(["Bob", "Ben", "Tim", "Jane", "John"], {
//     length: 4,
//   })
// ); // 'Bob, Ben, Tim, Jane and 1 other'

// console.log(
//   listFormat(["Bob", "Ben", "Tim", "Jane", "John"], {
//     length: 3,
//     sorted: true,
//   })
// ); // 'Ben, Bob, Jane and 2 others'

// console.log(listFormat(["Bob", "Ben", "Tim", "Jane", "John", "Bob"], {
//     length: 3,
//     unique: true,
//   })); // 'Bob, Ben, Tim and 2 others'

// listFormat(["Bob", "Ben", "Tim", "Jane", "John"], {
//   length: 3,
//   unique: true,
// }); // 'Bob, Ben, Tim and 2 others'

// listFormat(["Bob", "Ben", "", "", "John"]); // 'Bob, Ben and John'
console.log(listFormat(["Bob", "Ben", "Tim", "Jane", "John"], { length: 100 }));

console.log("end");
