async function sleep(dur) {
  return new Promise((rs) => {
    setTimeout(() => {
      rs();
    }, [dur]);
  });
}

// async function greeting() {
//   console.log("Hello!");
//   await sleep(2000);
//   console.log("Bye."); // Only logs after 2000 milliseconds (2 seconds)
// }

// greeting();
// // t = 0: Hello!
// // t = 2000: Bye.

console.log("Hello!");
sleep(2000).then(() => {
  console.log("Bye."); // Only logs after 2000 milliseconds (2 seconds)
});
