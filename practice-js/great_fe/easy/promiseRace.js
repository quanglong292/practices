function promiseRace(...iterable) {
  if (!iterable || !iterable.length) return iterable;

  const resolver = async (...iterable) => {
    for (let i = 0; i < iterable.length; i++) {
      const item = iterable[i];
      const whatIsIt = typeof item;

      if (whatIsIt === "object" && Array.isArray(item)) {
        return await resolver(...item);
      }

      const resolved = whatIsIt === "function" ? await item() : item;

      return resolved;
    }
  };

  return resolver(iterable);
}
