// getElementsByClassName() is a method that exists on HTML Documents and Elements to return an HTMLCollection of descendant elements within the Document/Element that have the specified class name(s).

// Implement a custom Element.getElementsByClassName() that is similar but slightly different:

// It is a pure function that takes an element and a classNames string containing one or more class names to match, separated by whitespace. For example, getElementsByClassName(document.body, 'foo bar').
// Similar to Element.getElementsByClassName(), only descendants of the element argument are searched, not the element itself.
// Returns an array of Elements instead of an HTMLCollection of Elements.
// Do not use document.querySelectorAll(), which would make the problem trivial. You will not be allowed to use it during real interviews.

// Examples

// const doc = new DOMParser().parseFromString(
//   `<div class="foo bar baz">
//     <span class="bar baz">Span</span>
//     <p class="foo baz">Paragraph</p>
//     <div class="foo bar"></div>
//   </div>`,
//   'text/html',
// );

// getElementsByClassName(doc.body, 'foo bar');
// // [div.foo.bar.baz, div.foo.bar] <-- This is an array of elements.
// Resources
// Element: getElementsByClassName() method - Web APIs | MDN

function getElementsByClassName(element: HTMLElement, classNames: string) {
    let results: any[] = [];
    let map = new Map();
    const children = element.children
    const classNamesSplit = classNames.split(' ')

    const matcher = (classList: string) => {
        return classList.split(' ').findIndex(clItem => {
            return classNamesSplit.findIndex(cnItem => cnItem === clItem) !== -1
        })
    }

    const traversal = (children?: HTMLCollection) => {
        if (!children || !children?.length) return;

        for (let i = 0; i < children?.length; i++) {
            const node = children[i];

            if (matcher(node.classList.value) && !map.get(node)) {
                results.push(node)
                map.set(node, node)
            }
            if (node.children) traversal(node.children)
        }
    }

    traversal(children);

    return results;
}

const doc = new DOMParser().parseFromString(
    `<div class="foo bar baz">
    <span class="bar baz">Span</span>
    <p class="foo baz">Paragraph</p>
    <div class="foo bar"></div>
  </div>`,
    'text/html',
);

getElementsByClassName(doc.body, 'foo bar');