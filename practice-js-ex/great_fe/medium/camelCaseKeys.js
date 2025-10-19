function camelCaseKeys(object) {
  const check = (key) => {
    const keys = key.split("_");

    if (keys.length === 1) return key;

    let camelCase = "";
    for (const k of keys) {
      if (camelCase.length) {
        const capitalized = k.charAt(0).toUpperCase() + k.slice(1);
        camelCase += capitalized;
      } else camelCase += k;
    }

    return camelCase;
  };

  if (!object?.length) {
    for (const key in object) {
      if (typeof key === "object") camelCaseKeys(key);
      else key = check(key);
    }
  }

  for (const element of object) {
    if (typeof key === "object") camelCaseKeys(key);
    else key = check(key);
  }

  return Object.fromEntries()
}

camelCaseKeys({ foo_bar: true });
// { fooBar: true }

camelCaseKeys({ foo_bar: true, bar_baz: { baz_qux: "1" } });
// { fooBar: true, barBaz: { bazQux: '1' } }

camelCaseKeys([{ baz_qux: true }, { foo: true, bar: [{ foo_bar: "hello" }] }]);
// [{ bazQux: true }, { foo: true, bar: [{ fooBar: 'hello' }] }]
console.log("end");
