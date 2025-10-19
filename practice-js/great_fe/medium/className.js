function classNames(...args) {
  let output = "";

  for (let i = 0; i < args.length; i++) {
    const element = args[i];
    const isArray = Array.isArray(element);
    const isObject = typeof element === "object" && !isArray;
    const isString = typeof element === "string" || typeof element === 'number';

    if (isString && element) output += element + " ";
    if (isObject) {
      for (const key in element) {
        const isPush = element[key];
        if (isPush) output += key + " ";
      }
    }
    if (isArray) {
      output += classNames(...element);
    }
  }
  return output.trim();
}

// classNames("foo", "bar"); // 'foo bar'
// classNames("foo", { bar: true }); // 'foo bar'
// classNames({ "foo-bar": true }); // 'foo-bar'
// classNames({ "foo-bar": false }); // ''
// classNames({ foo: true }, { bar: true }); // 'foo bar'
// classNames({ foo: true, bar: true }); // 'foo bar'
// classNames({ foo: true, bar: false, qux: true }); // 'foo qux'
classNames("a", ["b", { c: true, d: false }]); // 'a b c'
// classNames(
//   "foo",
//   {
//     bar: true,
//     duck: false,
//   },
//   "baz",
//   { quux: true }
// ); // 'foo bar baz quux'
// classNames(null, false, "bar", undefined, { baz: null }, ""); // 'bar'
console.log("----");
