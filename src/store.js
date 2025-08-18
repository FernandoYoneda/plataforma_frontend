// src/store.js
import { createStore } from "redux";

const initialState = {
  orders: [],
  tiTickets: [],
  settings: { sector: "", nameOrStore: "" },
  user: null,
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "CLEAR_USER":
      return { ...state, user: null };

    // compat: alguns lugares chamavam UPDATE_SETTINGS, outros SET_SETTINGS
    case "SET_SETTINGS":
    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: action.payload || { sector: "", nameOrStore: "" },
      };
    case "CLEAR_SETTINGS":
      return { ...state, settings: { sector: "", nameOrStore: "" } };

    case "SET_ORDERS":
      return { ...state, orders: action.payload || [] };
    case "ADD_ORDER":
      return { ...state, orders: [action.payload, ...state.orders] };

    case "SET_TI_TICKETS":
      return { ...state, tiTickets: action.payload || [] };
    case "ADD_TI_TICKET":
      return { ...state, tiTickets: [action.payload, ...state.tiTickets] };

    default:
      return state;
  }
}

const store = createStore(reducer);
export default store;
