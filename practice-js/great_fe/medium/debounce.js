function debounce(func, wait) {
  let hold = null;
  const context = this;
  return (...args) => {
    clearTimeout(hold);
    hold = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

const debouncedIncrement = debounce(() => {
  console.log("123");
}, 500);

debouncedIncrement();
debouncedIncrement();
debouncedIncrement();
