//

function debounceA(fn, t) {
  let time = t;
  let waiting, cancel, flush;

  const clearWaiting = () => {
    if (waiting) {
      clearTimeout(waiting);
    }
  };

  const dbHandler = () => {
    clearWaiting();

    if (!cancel && !flush) {
      waiting = setTimeout(fn, time);
    }
  };

  const cancelHandler = () => {
    clearWaiting();
    cancel = true;
  };

  const flushHandler = () => {
    clearWaiting();
    fn();
    flush = true;
  };

  Object.assign(dbHandler, { cancel: cancelHandler, flush: flushHandler });

  return dbHandler;
}

const dbFn = debounceA(() => {
  console.log(1);
}, 500);

dbFn();
dbFn();

dbFn.flush();

dbFn();
dbFn();
dbFn();
