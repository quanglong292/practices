function deepEqual(v1, v2) {
  const v1Type = typeof v1;
  const v2Type = typeof v2;

  if (v1Type !== v2Type) return false;
  if (v1Type !== "object" && v2Type !== "object") return v1 === v2;
  if (v1 === null || v2 === null) return v1 === v2;

  if (Array.isArray(v1) && Array.isArray(v2)) {
    if (v1?.length !== v2?.length) return false;

    for (let i = 0; i < v1.length; i++) {
      const v1Element = v1[i];
      const v2Element = v2[i];
      const v1ElementType = typeof v1Element;
      const v2ElementType = typeof v2Element;
    //   console.log(v1Element, v2Element);

      if (v1ElementType === "object" && v2ElementType === "object") {
        if (!deepEqual(v1Element, v2Element)) return false;
      } else if (v1Element !== v2Element) {
        return false;
      }
    }

    return true;
  }

  if (Array.isArray(v1) !== Array.isArray(v2)) return false;

  const v1Entries = Object.entries(v1);
  const v2Entries = Object.entries(v2);

  return deepEqual(v1Entries, v2Entries);
}

console.log(deepEqual("foo", "foo")); // true
console.log(deepEqual({ id: 1 }, { id: 1 })); // true
console.log(deepEqual([1, 2, 3], [1, 2, 3])); // true
console.log(deepEqual([{ id: "1" }], [{ id: "2" }])); // false
console.log(deepEqual({ foo: "bar", id: 1 }, { foo: "bar", id: "1" })); // false
console.log("end");
