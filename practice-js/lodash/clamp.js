const clamp = (n, l, u) => {
  if (n < l) return l;
  if (n > u) return u;
  return n;
};

console.log(clamp(3, 0, 5));
console.log(clamp(-10, -3, 5));
console.log(clamp(10, -5, 5));