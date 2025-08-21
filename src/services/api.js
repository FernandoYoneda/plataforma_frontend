const API_BASE = process.env.REACT_APP_API || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: options.body,
  });

  const ct = res.headers.get("content-type") || "";
  let data = null;
  if (ct.includes("application/json")) data = await res.json();
  else {
    const t = await res.text().catch(() => "");
    data = t || null;
  }

  if (!res.ok) {
    const message =
      (data && data.error) ||
      (typeof data === "string" ? data : null) ||
      `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  login: ({ email, password }) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getSettings: () => request("/settings"),
  saveSettings: (payload) =>
    request("/settings", { method: "POST", body: JSON.stringify(payload) }),

  getOrders: (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return request(`/orders${qs ? `?${qs}` : ""}`);
  },
  createOrder: (payload) =>
    request("/orders", { method: "POST", body: JSON.stringify(payload) }),
  setOrderStatus: (id, payload) =>
    request(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  getTiTickets: (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return request(`/ti/tickets${qs ? `?${qs}` : ""}`);
  },
  createTiTicket: (payload) =>
    request("/ti/tickets", { method: "POST", body: JSON.stringify(payload) }),
  setTiTicketStatus: (id, payload) =>
    request(`/ti/tickets/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

export default api;
