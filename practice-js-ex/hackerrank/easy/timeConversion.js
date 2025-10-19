const ex1 = "12:40:22AM";
const ex2 = "12:45:54PM";
const ex3 = "07:05:45AM";

const timeConverter = (time = ex1) => {
  let h = 0;
  let m = 0;
  let s = 0;
  let t = "";

  const hh = 0;
  const mm = 3;
  const ss = 6;
  const tt = 8;

  for (let i = 0; i < time.length; i++) {
    const el = time[i];
    const value = el + time[i + 1];

    if (i === hh) h = value;
    if (i === mm) m = value;
    if (i === ss) s = value;
    if (i === tt) t = value;
  }

  h = t === "PM" && h !== '12' ? Number(h) + 12 : h;

  if (h >= 24 || (t === "AM" && h >= 12)) h = "00";

  return `${h}:${m}:${s}`;
};

console.log(timeConverter(ex1));
