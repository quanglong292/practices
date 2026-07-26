const classNames = (...args) => {
  const values = new Map();

  if (!args || !args?.length) return "";

  const setValue = (value) => {
    if (values.get(value)) return;

    values.set(value, value);
  };

  const removeValue = (value) => {
    values.delete(value);
  };

  const extractor = (...args) => {
    for (let i = 0; i < args.length; i++) {
      const element = args[i];

      if (!element) continue;

      const typeofValue = typeof element;
      const isArray = Array.isArray(element);

      if (typeofValue === "string") {
        setValue(element);
      } else if (typeofValue === "number" && element) {
        setValue(String(element));
      } else if (typeofValue === "object" && isArray) {
        const nested = extractor(...element);
        if (nested) {
          console.log({ nested });
          nested.split(" ").forEach((cls) => setValue(cls));
        }
      } else if (typeofValue === "object" && element !== null) {
        const entries = Object.entries(element);
        for (const [key, val] of entries) {
          if (val) {
            setValue(key);
          } else {
            removeValue(key);
          }
        }
      } else if (typeofValue === "function") {
        const result = extractor(element());
        if (result) {
          result.split(" ").forEach((cls) => setValue(cls));
        }
      }
    }
  };

  extractor(args);

  const returnValues = Array.from(values)
    .map(([className]) => className)
    .join(" ");

  return returnValues;
};

// ==================== Test Cases ====================
console.log("hello", classNames("foo", [{ foo: false }]));

console.log(
  "Test 1:",
  classNames("foo", "foo", "foo", { foo: false }, ["hehe", ["1"]]),
);
// Expected: "hehe 1" — "foo" is added then removed by {foo: false}

console.log("Test 2:", classNames({ foo: true }, { foo: true }));
// Expected: "foo"

console.log("Test 3:", classNames({ foo: true, bar: true }, { foo: false }));
// Expected: "bar" — foo gets removed by the second object

console.log(
  "Test 4:",
  classNames("foo", () => "bar"),
);
// Expected: "foo bar"

console.log(
  "Test 5:",
  classNames("foo", () => "foo"),
);
// Expected: "foo" — duplicate ignored

console.log("Test 6:", classNames(["1", "2", "3", [{ 1: true }]]));
// Expected: "1 2 3"

console.log("Test 7:", classNames(null, undefined, false, 0, "valid"));
// Expected: "valid" — all falsy values ignored

debugger;
