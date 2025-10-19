const ex1 = [1, 1, 2, 2, 3]
const ex2 = [1, 4, 4, 4, 5, 3]
const ex3 = [3, 1, 1, 2, 2, 3, 1]
const ex4 = [1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 4]


// Nested loop -> Failed
const migratoryBirds = (arr) => {
    let currentId = 0
    let count = 0

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        let tempId = 0
        let tempCount = 0

        if (!i) {
            currentId = item
            count = 1
        }

        if (item && item !== currentId) {
            tempCount = 1
            tempId = item
        }

        for (let j = 0; j < arr.length; j++) {
            const item2 = arr[j];

            if (item2 === currentId) {
                count += 1
                arr[j] = undefined
            }

            if (item2 === tempId) {
                tempCount += 1
            }

        }

        if (tempCount > count || (tempCount === count && tempId < currentId)) {
            currentId = tempId
            count = tempCount
        }
    }

    return currentId
}

// Nested loop -> Failed
const migratoryBirds2 = (arr) => {
    const cache = {}
    let currentId = 0
    let count = 0

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];

        if (cache[item]) {
            cache[item] += 1
        } else cache[item] = 1
    }

    const keys = Object.keys(cache)

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = cache[key]

        if (!i) {
            currentId = key
            count = value
        } else {
            if (value > count || (value === count && Number(key) < Number(currentId))) {
                currentId = key
                count = value
            }
        }
    }


    return Number(currentId)
}

console.log({ id: migratoryBirds2(ex2) });
console.log({ id: migratoryBirds2(ex3) });
console.log({ id: migratoryBirds2(ex4) });



