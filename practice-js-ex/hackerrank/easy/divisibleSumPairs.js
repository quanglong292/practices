const ex1 = [1, 2, 3, 4, 5, 6]
const ex2 = [1, 3, 2, 6, 1, 2]

function divisibleSumPairs(n, k, ar) {
    let numberOfPairs = 0
    // Write your code here
    for (let i = 0; i < n; i++) {
        const item = ar[i];

        for (let j = 0; j < n; j++) {
            const item2 = ar[j];
            const isPair = !Boolean((item + item2) % k)

            if (isPair && i < j) numberOfPairs += 1
        }
    }

    return numberOfPairs
}

console.log({ ex1: divisibleSumPairs(ex1.length, 5, ex1) });
console.log({ ex2: divisibleSumPairs(ex2.length, 3, ex2) });