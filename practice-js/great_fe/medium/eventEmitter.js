class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(eventName, fn) {
    if (!this.events[eventName]) {
      this.events[eventName] = [fn];
      return this;
    }

    const events = this.events[eventName];

    this.events[eventName] = [...events, fn];

    return this;
  }

  emit(eventName, ...args) {
    const events = this.events[eventName];

    if (!events || !events.length) return false;

    let isExist = false;

    for (const event of events) {
      if (typeof event === "function") {
        event(...args);
        isExist = true;
      }
    }

    return isExist;
  }

  off(eventName, fn) {
    const events = this.events[eventName];
    // this.events[eventName] = null;

    if (events?.length) {
      this.events[eventName] = events.filter((e) => e !== fn);
    } else {
      this.events[eventName] = [];
    }

    return this;
  }
}

const emitter = new EventEmitter();

function addTwoNumbers(a, b) {
  console.log(`The sum is ${a + b}`);
}

emitter.on("foo", addTwoNumbers);
emitter.emit("foo", 2, 5);
// > "The sum is 7"

emitter.on("foo", (a, b) => console.log(`The product is ${a * b}`));
emitter.emit("foo", 4, 5);
// > "The sum is 9"
// > "The product is 20"

emitter.off("foo", addTwoNumbers);
emitter.emit("foo", 4, 5);
//
