export default function maxSumSubArray(numbers) {
    let max = 0;
    let currentPeriodProfit = 0;
    let period = [];

    // numbers.forEach((profit, index) => {
    //     if (index) {
    //         currentPeriodProfit = Math.max(currentPeriodProfit, profit + currentPeriodProfit)
    //         max = Math.max(max, currentPeriodProfit)
    //     }
    // });

    for (let index = 0; index < numbers.length; index++) {
        const profit = numbers[index];
        currentPeriodProfit = Math.max(currentPeriodProfit, currentPeriodProfit + profit)
        max = Math.max(max, currentPeriodProfit)

        if (currentPeriodProfit)
            console.log({ profit, max, currentPeriodProfit });

    }

    return max;
}

export function maxSumSubArray2(numbers) {
    // Không bắt đầu từ 0, hãy bắt đầu từ thực tế tháng đầu tiên
    let currentWallet = numbers[0];
    let recordProfit = numbers[0];

    for (let i = 1; i < numbers.length; i++) {
        const monthlyProfit = numbers[i];

        // Quyết định: Gồng lỗ từ quá khứ hay bắt đầu lại từ tháng này?
        currentWallet = Math.max(currentWallet + monthlyProfit, monthlyProfit);

        // Cập nhật kỷ lục nếu ví hiện tại đang "dày" nhất lịch sử
        recordProfit = Math.max(recordProfit, currentWallet);
        console.log({ recordProfit, currentWallet });

    }

    return recordProfit;
}

console.log({
    maxN: maxSumSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]),
    maxN2: maxSumSubArray2([-2, 1, -3, 4, -1, 2, 1, -5, 4])
});