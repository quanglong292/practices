let user = {
  age: 23,
  name: "Lyndon",
  saying: () => {
    console.log("I believe in myself!");
  },
};

user.age; // O(1)

// Collision issue is O(n/k) k = RAM size

// Map cho phép lưu key ở bất kì dạng dữ liệu
// Map có thứ tự
const a = new Map();

const findRecurringNumber = (a = [2, 5, 1, 3]) => {
  if (!a || !a.length) return;

  let recurringList = {};
  let returnValue;

  for (const element of a) {
    const isEixst = recurringList[element];

    if (isEixst) {
      recurringList[element] += 1;
    } else recurringList[element] = 1;

    if (recurringList[element] > 1) returnValue = element;
  }

  return returnValue;
};

// console.log(findRecurringNumber());
