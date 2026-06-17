function generateBinaryStrings(n: number) {
    const currentStr: string[] = []
    const rs: string[] = []

    const arr = ['0', '1'];
    const zeroItem = arr[0];

    const backtrack = () => {
        if (currentStr.length === n) {
            rs.push(currentStr.join(''))
            return;
        }

        const lastItemOfCurrntStr = currentStr[currentStr.length - 1]

        for (let i = 0; i < arr.length; i++) {
            const char = arr[i];

            currentStr.push(char)
            if (!(lastItemOfCurrntStr === zeroItem && char === zeroItem)) backtrack()
            currentStr.pop()
        }
    }

    backtrack()

    return rs;
}

// rs = ["010","011","101","110","111"]

console.log(generateBinaryStrings(3));
