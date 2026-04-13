// undo
// add
// redo

const HISTORY_LIMIT = 50;

const useTimeTravel = (initValues) => {
  let history = [];
  let currentStep = 0;
  let current = initValues;
  let future = [];

  const undo = () => {
    if (!currentStep) return;

    future = [current, ...future];
    current = history[currentStep];
    history = history.slice(0, currentStep);
    // currentStep -= 1;
    console.log({ history, current, future });
  };

  const add = (newValues) => {
    history = [...history, current];
    current = newValues;
    future = [];

    if (history?.length > HISTORY_LIMIT) {
      history.shift();
    }

    currentStep = history.length - 1;
    console.log({ history, current, future });
  };

  const redo = () => {
    if (!future.length) return;
    const redoIem = future.pop();
    history = [...history, current];
    current = redoIem;
    currentStep += 1;
    console.log({ history, current, future });
  };

  return {
    current,
    history,
    undo,
    add,
    redo,
  };
};

const { current, history, undo, add, redo } = useTimeTravel(1);

add(2);
add(3);
add(4);
add(5);

// console.log({ current, history });

undo();
add(6);
add(7); // 
undo()
add(8); // 
redo();
// redo();

// console.log({ current, history });

// add(6);

debugger;
