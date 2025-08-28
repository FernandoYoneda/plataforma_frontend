import { createStore } from "redux";
import reducer from "./reducer";

const enhancer =
  typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : undefined;

const store = createStore(reducer, enhancer);

export default store;
