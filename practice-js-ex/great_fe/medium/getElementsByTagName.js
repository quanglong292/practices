const document2 = new DOMParser().parseFromString(
  `<div id="foo">
      <span>Span</span>
      <p>Paragraph</p>
      <div id="bar">Div</div>
    </div>`,
  "text/html"
);

function getElementsByTagName(doc, tag) {
  if (!tag) return;

  tag = tag.toLowerCase();
  const elements = [];

  const traverse = (doc) => {
    if (!doc) return elements;
    const childNodes = doc?.children;
    const tagName = doc.tagName?.toLowerCase();

    if (tagName === tag) {
      elements.push(doc);
    }

    for (let i = 0; i < childNodes.length; i++) {
      const element = childNodes[i];
      traverse(element);
    }

    return elements;
  };

  return traverse(doc);
}

function getElementsByTagName2(element, tagNameParam) {
  const elements = [];
  const tagName = tagNameParam.toUpperCase();

  function traverse(el) {
    if (el == null) {
      return;
    }

    if (el.tagName === tagName) {
      elements.push(el);
    }

    for (const child of el.children) {
      traverse(child);
    }
  }

  for (const child of element.children) {
    traverse(child);
  }

  return elements;
}

console.log(getElementsByTagName(document2.body, "div"));
console.log(getElementsByTagName2(document2.body, "div")); // [div#foo, div#bar]
console.log("end");
