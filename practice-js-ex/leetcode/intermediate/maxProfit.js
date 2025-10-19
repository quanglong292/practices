// https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/

// You are given an array prices where prices[i] is the price of a given stock on the ith day, and an integer fee representing a transaction fee.
// Find the maximum profit you can achieve. You may complete as many transactions as you like, but you need to pay the transaction fee for each transaction.
// Note: You may not engage in multiple transactions simultaneously (i.e., you must sell the stock before you buy again).

const maxProfit = (prices = [1, 3, 2, 8, 4, 9], fee = 2) => {
  for (let i = 0; i < prices.length; i++) {
    const day = i;
    const price = prices[i];

    console.log({ day, price });
  }

  console.log("asd");
};

maxProfit()[(1, 3, 7, 5, 10, 3)][(9, 8, 4, 3, 2, 1)];
