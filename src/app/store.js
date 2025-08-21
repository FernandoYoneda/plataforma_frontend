import { createStore } from "redux";

const initialState = {
  orders: [],
  settings: { sector: "", nameOrStore: "" },
  user: null,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case "ADD_ORDER":
      return { ...state, orders: [...state.orders, action.payload] };
    case "SET_ORDERS":
      return { ...state, orders: action.payload };
    case "UPDATE_SETTINGS":
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload };
    case "CLEAR_USER":
      return { ...state, user: null };
    default:
      return state;
  }
}

const store = createStore(reducer);
export default store;
