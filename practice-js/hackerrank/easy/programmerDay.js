const ex1 = 2017
const ex2 = 2016
const ex3 = 1800
const ex4 = 1916
const ex5 = 1918

function dayOfProgrammer(year) {
    if (year === 1918) return "26.09.1918"

    const getTime = (date) => new Date(date).getTime()
    const getSelectedYear = (year) => new Date(new Date(new Date(0).setYear(year)))

    const selectedYear = getSelectedYear(year)
    let the256thDay = new Date(selectedYear.setDate(256))

    const juliandMarkDate = new Date("02/01/1918")

    // default format MM.DD
    const isJulian = getTime(the256thDay) < getTime(juliandMarkDate)
    const isLeap = isJulian ? !(year % 4) : (!(year % 4) && !!(year % 100)) || !(year % 400)

    if (isLeap && isJulian && (the256thDay.getDate() === 13)) the256thDay = new Date(getSelectedYear(year).setDate(255))

    // console.log({isJulian, isLeap});

    return `${the256thDay.getDate()}.09.${year}`
}

// console.log({ y: dayOfProgrammer(ex1) });
// console.log({ y: dayOfProgrammer(ex2) });
// console.log({ y: dayOfProgrammer(ex3) });
console.log({ y: dayOfProgrammer(ex5) });