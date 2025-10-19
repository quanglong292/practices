

function countingValleys(steps, path) {
    // Write your code here
    let s = 0
    let count = 0
    let isD = false
    for (let i = 0; i < steps; i++) {
        const element = path[i];

        if (element === 'U') s += 1
        if (element === 'D') s -= 1

        if (isD && s === 0) {
            count += 1
        }

        if (s < 0) {
            isD = true
        }
        else isD = false
    }

    return count
}

console.log("Valleys: ", countingValleys(8, ['U', 'D', 'D', 'D', 'U', 'D', 'U', 'U']));
console.log("Valleys1: ", countingValleys(12, ['D', 'D', 'U', 'U', 'D', 'D', 'U', 'D', 'U', 'U', 'U', 'D']));