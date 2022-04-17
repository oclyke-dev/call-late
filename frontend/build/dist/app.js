import React from "../_snowpack/pkg/react.js";
import {
  Link,
  Outlet
} from "../_snowpack/pkg/react-router-dom.js";
export default () => {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, "hello world", /* @__PURE__ */ React.createElement(Link, {
    to: "/game"
  }, "Game"), /* @__PURE__ */ React.createElement(Link, {
    to: "/start"
  }, "start"), /* @__PURE__ */ React.createElement(Outlet, null));
};
