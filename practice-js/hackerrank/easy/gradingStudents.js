// grade 0 - 100
// fail = grade < 40
// (grade > 40) && (next 5's multiple) - origin <= 3 -> round

const ex1 = [73, 67, 38, 33];
const ex2 = [];

const gradingStudents = (grades) => {
  for (let i = 0; i < grades.length; i++) {
    const el = grades[i];
    const multiple = Math.floor((el + 5) / 5) * 5;
    const shouldRound = Boolean(multiple - el < 3);

    if (shouldRound && multiple >= 40) grades[i] = multiple;
  }

  return grades;
};

console.log(gradingStudents(ex1));
