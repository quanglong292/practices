const ex1 = [2, 4, 6]
const ex2 = [3, 10, 2, 9]
// const ex3 = []

function bonAppetit(bill, k, b) {
    // Write your code here
    let actualPay = 0

    for (let i = 0; i < bill.length; i++) {
        const el = bill[i];

        if (i !== k) actualPay += el
    }

    const result = b - actualPay / 2

    if (!result) return "Bon Appetit"

    return result
}


console.log("test 1: ", bonAppetit(ex2, 1, 12))
console.log("test 2: ", bonAppetit(ex2, 1, 7))