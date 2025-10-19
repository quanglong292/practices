const numberOfLineJump = (x1, v1, x2, v2) => {
  if ((x1 <= x2 && v1 <= v2) || (x2 <= x1 && v2 <= v1)) return "NO";

  const s1 = x2 - v1;
  const s2 = v1 - v2;

  if (!(s1 % s2)) return "YES";
  else return "NO";
};

console.log(numberOfLineJump(43, 2, 70, 2));
