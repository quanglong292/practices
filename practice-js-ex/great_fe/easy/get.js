function get(objectParam, pathParam, defaultValue) {
  const pathDetails = Array.isArray(pathParam)
    ? pathParam
    : pathParam?.split(".");
  let currentLocation = objectParam;

  pathDetails.forEach((path) => {
    currentLocation = currentLocation?.[path];
  });

  return currentLocation === undefined ? defaultValue : currentLocation;
}

// OPTIMIZED VERSION
function get(objectParam, pathParam, defaultValue) {
  // Early return for common cases
  if (objectParam === null || objectParam === undefined) {
    return defaultValue;
  }

  const path = Array.isArray(pathParam) ? pathParam : pathParam.split(".");

  // Loop with short-circuiting and optional chaining
  for (const key of path) {
    objectParam = objectParam?.[key];
    if (objectParam === undefined) {
      return defaultValue;
    }
  }

  return objectParam;
}

const john = {
  profile: {
    name: { firstName: "John", lastName: "Doe" },
    age: 20,
    gender: "Male",
  },
};

const jane = {
  profile: {
    age: 19,
    gender: "Female",
  },
};

console.log(get(john, "profile.name.firstName")); // 'John'
console.log(get(john, "profile.gender")); // 'Male'
console.log(get(jane, "profile.name.firstName")); // undefined
console.log(get({ a: [{ b: { c: 3 } }] }, "a.0.b.c")); // 3
console.log(get({ a: 1 }, "a"));
console.log(get({ b: null }, "b"));
