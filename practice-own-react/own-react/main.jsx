/** @jsx Didact.createElement */
import { Didact } from "./core/dom";

const element = (
  <div id="foo">
    <a>bar2</a>
    <b />
  </div>
);
const container = document.getElementById("root");
Didact.render(element, container);
