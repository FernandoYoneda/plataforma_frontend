import { createStore } from "redux";

const defaultSettings = { sector: "", nameOrStore: "" };

const loadFromLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveToLS = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
};

const initialState = {
  orders: [],
  tickets: [], // NOVO: chamados de TI
  settings: loadFromLS("settings", defaultSettings),
  user: loadFromLS("user", null),
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_ORDER":
      return { ...state, orders: [...state.orders, action.payload] };

    case "SET_ORDERS":
      return { ...state, orders: action.payload };

    case "SET_SETTINGS":
      return { ...state, settings: action.payload || defaultSettings };

    case "CLEAR_SETTINGS":
      return { ...state, settings: defaultSettings };

    case "SET_USER":
      return { ...state, user: action.payload };

    case "CLEAR_USER":
      return { ...state, user: null };

    // NOVO: TI tickets
    case "ADD_TICKET":
      return { ...state, tickets: [...state.tickets, action.payload] };

    case "SET_TICKETS":
      return { ...state, tickets: action.payload };

    default:
      return state;
  }
};

const store = createStore(reducer);

// Persistência automática de user/settings
store.subscribe(() => {
  const { user, settings } = store.getState();
  saveToLS("user", user);
  saveToLS("settings", settings);
});

export default store;
