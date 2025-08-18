// src/api.js
const API_BASE = process.env.REACT_APP_API || "/api"; // prod: usa env; dev: usa proxy

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body || undefined,
  });

  const ct = res.headers.get("content-type") || "";
  let data = null;
  if (ct.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text().catch(() => "");
    data = text ? { message: text } : null;
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // AUTH
  login: ({ email, password }) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // SETTINGS
  getSettings: () => request("/settings"),
  saveSettings: (payload) =>
    request("/settings", { method: "POST", body: JSON.stringify(payload) }),

  // PEDIDOS (Materiais)
  getOrders: () => request("/orders"),
  createOrder: (payload) =>
    request("/orders", { method: "POST", body: JSON.stringify(payload) }),

  // CHAMADOS TI
  getTiTickets: () => request("/ti/tickets"),
  createTiTicket: (payload) =>
    request("/ti/tickets", { method: "POST", body: JSON.stringify(payload) }),
};

export default api;
