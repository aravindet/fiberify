/*
  Lets take any run-of-the-mill recursive algorithm, like factorial:

  const factorial = n => (n <= 1) ? 1 : n * factorial(n - 1);

  We want to break this computation up and do it during idle time,
  yielding to the browser when there's high priority stuff to do like
  handling events or painting the scren.
*/

let total = 0;
let rno = 0;

const fiberify = (() => {
  // This is an IIFE. The actual function that goes into "fiberify" is
  // returned from this function, all the way at the bottom.

  // Also, it's a singleton; there just needs to be one instance for the
  // whole application, for any number of fiberified functions.

  // tasks is a queue of { func, args, res, rej } objects.
  //   func(tion) to call later
  //   args to pass to that func
  //   res(olve) is a function, to call with func's return value
  //   rej(ect) is a function to call if func throws an error
  const tasks = [];

  // Is this fiber currently running?
  let running = false;

  // Are we currently in idle time?
  let deadline = null;

  function start() {
    running = true;
    deadline = null;
    requestIdleCallback(run);
  }

  // run: This is called when the browser is idle.
  function run(d) {
    rno++;
    deadline = d;
    total += deadline.timeRemaining();
    while (deadline.timeRemaining() > 0 && tasks.length) {
      const { func, args, res, rej } = tasks.shift();
      try {
        res(func(...args));
      } catch (error) {
        rej(error);
      }
    }
    running = false;
    if (tasks.length) start();
  }

  // fiberify: This is the public API function that's called
  // with an async function that should be fiberified.
  return function fiberify(func) {
    // Returns a fiberified function, which when called
    // schedules func to be called later.
    return function (...args) {
      if (deadline && deadline.timeRemaining() > 0) {
        return func(...args);
      }

      if (!running) start();
      return new Promise((res, rej) => {
        tasks.push({ func, args, res, rej });
      });
    };
  }
})();
