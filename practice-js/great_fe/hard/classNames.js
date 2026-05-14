const classNames = (...args) => {
  const values = new Map();

  if (!args || !args?.length) return "";

  const setValue = (value) => {
    if (values.get(value)) return;

    values.set(value, true);
  };

  const removeValue = (value) => {
    values.delete(value);
  };

  for (let i = 0; i < args.length; i++) {
    const element = args[i];
    const typeofValue = typeof element;
    const isArray = Array.isArray(element);

    if (typeofValue === "string") {
      // Handle string — directly add as a class name
      setValue(element);
    } else if (typeofValue === "number" && element) {
      // Handle number — coerce to string if truthy (classNames(1) → "1")
      setValue(String(element));
    } else if (typeofValue === "object" && isArray) {
      // Handle Array — recursively process each element
      // Must check isArray BEFORE plain object, since typeof [] === "object"
      const nested = classNames(...element);
      if (nested) {
        nested.split(" ").forEach((cls) => setValue(cls));
      }
    } else if (typeofValue === "object" && element !== null) {
      // Handle object — keys with truthy values become class names,
      // keys with falsy values get removed (enables override pattern)
      const entries = Object.entries(element);
      for (const [key, val] of entries) {
        if (val) {
          setValue(key);
        } else {
          removeValue(key);
        }
      }
    } else if (typeofValue === "function") {
      // Handle function — call it, then recursively process the return value
      const result = classNames(element());
      if (result) {
        result.split(" ").forEach((cls) => setValue(cls));
      }
    }
    // Falsy values (null, undefined, false, 0, "") are silently ignored
  }

  const returnValues = Array.from(values)
    .map(([className]) => className)
    .join(" ");

  return returnValues;
};

// ==================== Test Cases ====================
console.log("Test 1:", classNames("foo", "foo", "foo", { foo: false }, ["hehe", ["1"]]));
// Expected: "hehe 1" — "foo" is added then removed by {foo: false}

console.log("Test 2:", classNames({ foo: true }, { foo: true }));
// Expected: "foo"

console.log("Test 3:", classNames({ foo: true, bar: true }, { foo: false }));
// Expected: "bar" — foo gets removed by the second object

console.log("Test 4:", classNames("foo", () => "bar"));
// Expected: "foo bar"

console.log("Test 5:", classNames("foo", () => "foo"));
// Expected: "foo" — duplicate ignored

console.log("Test 6:", classNames(["1", "2", "3", [{ 1: true }]]));
// Expected: "1 2 3"

console.log("Test 7:", classNames(null, undefined, false, 0, "valid"));
// Expected: "valid" — all falsy values ignored
