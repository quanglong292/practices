const input = [
  { user: 8, duration: 50, equipment: ["bench"] },
  { user: 7, duration: 150, equipment: ["dumbbell"] },
  { user: 1, duration: 10, equipment: ["barbell"] },
  { user: 7, duration: 100, equipment: ["bike", "kettlebell"] },
  { user: 7, duration: 200, equipment: ["bike"] },
  { user: 2, duration: 200, equipment: ["treadmill"] },
  { user: 2, duration: 200, equipment: ["bike"] },
];

function mergeData(sessions) {
  const obj = {};

  for (let i = 0; i < sessions.length; i++) {
    const { user, duration, equipment } = sessions[i];

    if (!obj[user]) obj[user] = sessions[i];
    else {
      const currentUser = obj[user];
      let newEquipment = currentUser.equipment;
      const newDuration = currentUser.duration + duration;

      for (let j = 0; j < equipment.length; j++) {
        const e = equipment[j];

        if (!newEquipment.includes(e)) newEquipment.push(e);
      }

      newEquipment.sort((a, b) => a.localeCompare(b));

      obj[user] = {
        ...obj[user],
        duration: newDuration,
        equipment: newEquipment,
      };
    }
  }
  console.log({ values: Object.values(obj), value: Object.values(obj)[0] });

  return Object.values(obj);
}

// console.log(mergeData(input));
mergeData([
  { user: 8, duration: 50, equipment: ["bench"] },
  { user: 7, duration: 150, equipment: ["dumbbell", "kettlebell"] },
  { user: 8, duration: 50, equipment: ["bench"] },
  { user: 7, duration: 150, equipment: ["bench", "kettlebell"] },
]);
console.log("end");
