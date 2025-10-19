function getNetProfit(events) {
  // Write your code here'c
  let queryLog = [];
  let type = {};
  events.forEach((i) => {
    let [action, name, value] = i.split(" ");
    value = Number(value || 0);
    if (name && !type[name])
      type[name] = {
        count: value,
        amount: 0,
      };
    else {
      if (action === "BUY") type[name].count += value;
      if (action === "CHANGE") type[name].amount = type[name].count * value;
      if (action === "QUERY") {
        const sum = Object.entries(type).reduce(
          (a, [key, value]) => a + value.amount,
          0
        );
        queryLog.push(sum);
      }
      if (action === "SEL") {
        type[name].count = type[name].count - value;
      }
    }
  });

  return queryLog;
}

console.log(
  getNetProfit([
    "BUY stock2 2",
    "BUY stock1 4",
    "CHANGE stock2 -8",
    "SELL stock1 2",
    "BUY stock3 3",
    "QUERY",
  ])
);
