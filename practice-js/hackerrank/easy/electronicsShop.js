function getMoneySpent(keyboards, drives, b) {
    const findLength = keyboards.length > drives.length ? 'keyboards' : 'drives'
    const [mapping, compare] = [(findLength === "keyboards" ? keyboards : drives), (findLength === "keyboards" ? drives : keyboards)]
    let max = 0

    for (let i = 0; i < mapping.length; i++) {
        const kb = mapping[i];

        for (let j = 0; j < compare.length; j++) {
            const drive = compare[j]

            if (kb && drive) {
                const sum = kb + drive

                if (sum > max && sum <= b) max = sum
            }

        }
    }

    return !max ? -1 : max
}

console.log("getMoneySpent: ", getMoneySpent([40, 50, 60], [5, 8, 12], 60));
console.log("getMoneySpent1: ", getMoneySpent([3, 1], [5, 2, 8], 10));
console.log("getMoneySpent2: ", getMoneySpent([4], [5], 5));