// src/api.js
const API_BASE = process.env.REACT_APP_API || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: options.body,
  });
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await res.json()
    : await res.text();
  if (!res.ok) throw new Error((data && data.error) || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // auth
  login: ({ email, password }) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // settings
  getSettings: () => request("/settings"),
  saveSettings: (payload) =>
    request("/settings", { method: "POST", body: JSON.stringify(payload) }),

  // orders (materiais)
  getOrders: (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return request(`/orders${qs ? `?${qs}` : ""}`);
  },
  createOrder: (payload) =>
    request("/orders", { method: "POST", body: JSON.stringify(payload) }),
  setOrderDone: (id, done) =>
    request(`/orders/${id}/done`, {
      method: "PATCH",
      body: JSON.stringify({ done }),
    }),
  setOrderStatus: (id, payload) =>
    request(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // ti
  getTiTickets: (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return request(`/ti/tickets${qs ? `?${qs}` : ""}`);
  },
  createTiTicket: (payload) =>
    request("/ti/tickets", { method: "POST", body: JSON.stringify(payload) }),
  setTiTicketDone: (id, done) =>
    request(`/ti/tickets/${id}/done`, {
      method: "PATCH",
      body: JSON.stringify({ done }),
    }),
  setTiTicketStatus: (id, payload) =>
    request(`/ti/tickets/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
