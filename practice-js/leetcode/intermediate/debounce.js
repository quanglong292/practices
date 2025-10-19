// Debouce

const debounce = (fn, delay) => {
  let timeId = null;
  return (...args) => {
    clearTimeout(timeId);
    timeId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const onInput = (value) => {
  console.log({ value });
};
const onDebouceHanlding = debounce(onInput, 300);

document.getElementById("debouce").addEventListener("input", (e) => {
  e.preventDefault();
  const value = e.target.value;
  onDebouceHanlding(value);
});
