import React from "../_snowpack/pkg/react.js";
import ReactDOM from "../_snowpack/pkg/react-dom.js";
import {
  BrowserRouter,
  Routes,
  Route
} from "../_snowpack/pkg/react-router-dom.js";
import {
  Game,
  Start
} from "./pages/index.js";
import {
  default as App
} from "./app.js";
ReactDOM.render(/* @__PURE__ */ React.createElement(React.StrictMode, null, /* @__PURE__ */ React.createElement(BrowserRouter, null, /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, {
  path: "/",
  element: /* @__PURE__ */ React.createElement(App, null)
}, /* @__PURE__ */ React.createElement(Route, {
  path: "/game",
  element: /* @__PURE__ */ React.createElement(Game, null)
}), /* @__PURE__ */ React.createElement(Route, {
  path: "/start",
  element: /* @__PURE__ */ React.createElement(Start, null)
}))))), document.getElementById("root"));
