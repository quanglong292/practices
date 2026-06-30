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

const doc = new DOMParser().parseFromString(
    `<div class="foo">
        <div class="fooz">Fooz</div>
        <div class="foo">Foo</div>
      </div>`,
    'text/html',
);

function getElementsByClassName(element, classNames) {
    const results = [];
    const targetClasses = classNames.trim().split(/\s+/);

    const traversal = (node) => {
        // Check if the current node has all the required classes
        const hasAllClasses = targetClasses.every(cls => node.classList.contains(cls));
        if (hasAllClasses) {
            results.push(node);
        }

        // Recursively traverse children
        for (let i = 0; i < node.children.length; i++) {
            traversal(node.children[i]);
        }
    }

    // Similar to Element.getElementsByClassName(), only descendants 
    // of the element argument are searched, not the element itself.
    if (element.children) {
        for (let i = 0; i < element.children.length; i++) {
            traversal(element.children[i]);
        }
    }

    return results;
}