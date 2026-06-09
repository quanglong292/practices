// Implement a method getElementsByStyle() that finds DOM elements that are rendered by the browser using the specified style. It is similar to Element.getElementsByClassName() but with some differences:

// It is a pure function which takes in an element, a property string, and a value string representing the style's property/value pair to be matched on the element's descendants. E.g. getElementsByStyle(document.body, 'font-size', '12px').
// Similar to Element.getElementsByClassName(), only descendants of the element argument are searched, not the element itself.
// Return an array of Elements, instead of an HTMLCollection of Elements.
// Do not use document.querySelectorAll() which will make the problem trivial otherwise. You will not be allowed to use it during real interviews.

// Examples

// const doc = new DOMParser().parseFromString(
//   `<div>
//     <span style="font-size: 12px">Span</span>
//     <p style="font-size: 12px">Paragraph</p>
//     <blockquote style="font-size: 14px">Blockquote</blockquote>
//   </div>`,
//   'text/html',
// );

// getElementsByStyle(doc.body, 'font-size', '12px');
// // [span, p] <-- This is an array of elements.
// Hint
// You might find the Window.getComputedStyle() method helpful.

// test("doesn't include itself", () => {
//       const containerEl = createElementFromHtmlString(
//         `<div id="root" style="color: rgb(255, 255, 255)">
//           <span class="match" style="color: rgb(255, 255, 255)">
//             <!-- Here's a comment -->
//             Span
//             <span class="match" style="color: rgb(255, 255, 255)">Span</span>
//           </span>
//           <p>Paragraph</p>
//           <div>
//             <span class="match" style="color: rgb(255, 255, 255)">Span</span>
//           </div>
//         </div>`,
//       );

function getElementsByStyle(element: Element, property: string, value: string) {
    let returnValues: Element[] = [];

    const getter = (el: Element, prop: string, v: string) => {
        const rootStyles = window.getComputedStyle(el)
        const value = rootStyles.getPropertyValue(prop)

        return value === v;
    }

    const find = (element: HTMLCollection) => {
        let nodes = element;

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const found = getter(node, property, value)

            if (found) returnValues.push(node)

            if (node.children) find(node.children)
        }

    }

    find(element.children)

    return returnValues;
}