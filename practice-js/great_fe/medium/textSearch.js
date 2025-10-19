function textSearch(text, query) {
  const arr = text.split("");
  query = query.toLowerCase();
  let catchedText = "";
  let catchedRange = [];
  let allRange = [];

  for (let i = 0; i < arr.length; i++) {
    // console.log({i});
    const currentChar = arr[i];
    // console.log({ currentChar, catchedText });
    if (currentChar !== query[0]) {
      // if (catchedText) {
      //   const startIdx = i - catchedText.length - 2;
      //   const endIdx = i;

      //   arr[startIdx] = "<br>" + arr[startIdx];
      //   arr[endIdx] = arr[endIdx] + "</br>";
      //   catchedText = "";
      //   // if (i + endIdx >= arr.length) break;
      //   // else i = endIdx;
      // }
      continue;
    }

    // console.log({ char: arr[i], i, catchedText, query });
    for (let j = 0; j < query.length; j++) {
      const qChar = query[j].toLowerCase();
      const char = arr[i + j]?.toLowerCase();
      console.log({qChar, char, i, sum: i + j});
      if (qChar === char) {
        catchedText += char;
        catchedRange[0] = i + j;
      }

      if (qChar !== char && catchedRange.length) {
        catchedRange[1] = i + j;
        allRange.push(catchedRange);
        catchedRange = [];

        const newPointer = i + j;
        if (newPointer >= arr.length) break;
        else i = newPointer;

        break;
      }

      // if (catchedText === query) {
      //   catchedText = ''
      //   const newPointer = i + j;
      //   if (newPointer >= arr.length) break;
      //   else i = newPointer;
      // }
    }
  }

  console.log({ allRange });

  return arr.join("");
}

function textSearchFailed(text, query) {
  query = query.toLowerCase();
  const arr = text.split("");
  for (let i = 0; i < text.length; i++) {
    let currentCatch = "";

    for (let j = i; j < text.length; j++) {
      const char = text[j].toLowerCase();
      let matchQuery = "";

      if (char !== query[0]) break;
      if (matchQuery.length && char !== matchQuery[matchQuery.length - 1])
        break;

      for (let e = 0; e < query.length; e++) {
        const qChar = query[e].toLowerCase();
        console.log({ qChar, char });
        if (qChar === char) matchQuery += char;
      }

      if (matchQuery === query) {
        currentCatch += matchQuery;

        const newLoopIdx = j + matchQuery.length - 1;

        matchQuery = "";

        if (newLoopIdx >= text.length) break;
        else j = newLoopIdx;
      }
    }

    if (currentCatch.length) {
      console.log({ currentCatch });
      const startIdx = i;
      const endIdx = i + (currentCatch.length - 1);
      arr[startIdx] = "<br>" + arr[startIdx];
      arr[endIdx] = arr[endIdx] + "</br>";

      const newLoopIdx = i + currentCatch.length - 1;

      if (newLoopIdx >= text.length) break;
      else i = newLoopIdx;
    }

    currentCatch = "";
  }

  return arr.join("");
}

function textSearchButFailed(text, query) {
  const arr = text.split("");
  for (let i = 0; i < arr.length; i++) {
    let marking = [];
    let matchChars = "";

    if (query.length === 1) {
      for (let j = i; j < arr.length; j++) {
        const char = arr[j];
        const q = query;

        if (q?.toLowerCase() === char?.toLowerCase()) {
          marking.push(j);
          matchChars += char;
        } else {
          i = j;
          const firstIndex = marking[0];
          const lastIndex = marking.at(-1);
          arr[firstIndex] = `<b>${arr[firstIndex]}`;
          arr[lastIndex] = `${arr[lastIndex]}</b>`;

          marking = [];
          matchChars = "";
          break;
        }
      }
    } else {
      for (let j = 0; j < query.length; j++) {
        const char = arr[i + j];
        const q = query[j];

        if (q?.toLowerCase() === char?.toLowerCase()) {
          marking.push(i + j);
          matchChars += char;
        } else break;
      }
    }

    if (matchChars.toLowerCase() === query.toLowerCase()) {
      const firstIndex = marking[0];
      const lastIndex = marking.at(-1);
      arr[firstIndex] = `<b>${arr[firstIndex]}`;
      arr[lastIndex] = `${arr[lastIndex]}</b>`;

      marking = [];
      matchChars = "";
    }
  }

  return arr.join("");
}

// console.log(textSearch("The Quick Brown Fox Jumps Over The Lazy Dog", "fox"));
// 'The Quick Brown <b>Fox</b> Jumps Over The Lazy Dog'
// console.log(textSearch("The hardworking Dog overtakes the lazy dog", "dog"));
// 'The hardworking <b>Dog</b> overtakes the lazy <b>dog</b>'

// console.log(textSearch("aaa", "aa"));
// '<b>aa</b>a'

// console.log(textSearch("aabbcc", "a"));
console.log(textSearch("aabbbbcc", "bb"));
// console.log(textSearch("bdc abc xyz ab c", "abc"));
