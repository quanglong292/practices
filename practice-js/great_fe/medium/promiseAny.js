async function promiseAny(iterable) {
  return new Promise(async (rs, rj) => {
    if (!iterable.length) rj(new AggregateError([]));

    let errors = [];
    let pending = iterable.length;

    iterable.forEach(async (item, index) => {
      try {
        const value = await item;
        rs(value);
      } catch (err) {
        errors[index] = err;
        pending--;

        if (!pending) rj(new AggregateError(errors));
      }
    });
  });
}
async function promiseAny2(iterable) {
  return new Promise((resolve, reject) => {
    if (iterable.length === 0) {
      reject(new AggregateError([]));
    }

    let pending = iterable.length;
    const errors = new Array(iterable.length);

    iterable.forEach(async (item, index) => {
      try {
        const value = await item;
        resolve(value);
      } catch (err) {
        errors[index] = err;
        pending--;

        if (pending === 0) {
          reject(new AggregateError(errors));
        }
      }
    });
  });
}

const test = async () => {
  const p0 = new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, 200);
  });
  const p1 = new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, 100);
  });
  const p2 = new Promise((resolve) => {
    setTimeout(() => {
      resolve(3);
    }, 10);
  });

  const res = await promiseAny([p0, p1, p2]);
  const res2 = await promiseAny2([p0, p1, p2]);
  console.log({ res, res2 });
};

const test1 = async () => {
  const p0 = Promise.reject(2);
  try {
    await promiseAny2([p0]);
  } catch (err) {
    console.log(err.errors, err);
  }
};

const test2 = async () => {
  const p0 = new Promise((_, reject) => {
    setTimeout(() => {
      reject(1);
    }, 200);
  });
  const p1 = new Promise((_, reject) => {
    setTimeout(() => {
      reject(2);
    }, 100);
  });
  const p2 = new Promise((_, reject) => {
    setTimeout(() => {
      reject(3);
    }, 10);
  });

  try {
    await promiseAny([p0, p1, p2]);
  } catch (err) {
    console.log(err.errors, err);
  }
};

test2();
console.log("end");
