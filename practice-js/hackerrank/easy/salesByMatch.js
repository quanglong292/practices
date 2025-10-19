const ex1 = [1,2,1,2,1,3,2]
const ex2 = [10, 20, 20, 10, 10, 30, 50, 10, 20]

function sockMerchant(n, ar) {
   const obj = {}

   for (let i = 0; i < ar.length; i++) {
    const element = ar[i];
    
    if (obj[element]) obj[element] += 1
    else obj[element] = 1
   }

   const keys = Object.keys(obj)
   let pairs = 0
   const obj2 = {}

   for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key]
    const round = Math.floor(value / 2)

    obj2[key] = round
    pairs += round
   }

   return pairs
}

console.log({v: sockMerchant(0, ex1)});
console.log({v: sockMerchant(0, ex2)});