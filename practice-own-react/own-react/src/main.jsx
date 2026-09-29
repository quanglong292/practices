/** @jsx Act.createElement */
import { Act } from "./core/dom";

const element = (
  <div id="foo">
    <a>bar2123123</a>
    <b />
    <p>Text ne</p>
  </div>
);

const container = document.getElementById("root");
Act.render(element, container);
