// src/services/api.js
const base = ""; // em dev, o setupProxy encaminha para http://localhost:10000

async function safeJson(res) {
  // Lê como texto e tenta parsear, lidando com body vazio
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Resposta não é JSON válido");
  }
}

async function handle(res) {
  if (!res.ok) {
    // tenta extrair erro do JSON; se vazio, monta mensagem pelo status
    let msg = `HTTP ${res.status}`;
    try {
      const data = await safeJson(res);
      if (data?.error) msg = data.error;
    } catch (_) {
      // ignore
    }
    throw new Error(msg);
  }
  // 204/empty -> retorna null
  try {
    return await safeJson(res);
  } catch {
    return null;
  }
}

// ------- AUTH -------
export async function login({ email, password }) {
  const res = await fetch(`${base}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(res); // { role }
}

// ------- SETTINGS -------
export async function saveSettings(payload) {
  const res = await fetch(`${base}/api/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res); // { sector, nameOrStore }
}

export async function getSettings() {
  const res = await fetch(`${base}/api/settings`);
  return handle(res); // { sector, nameOrStore }
}

// ------- ORDERS -------
export async function getOrders(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${base}/api/orders${qs ? "?" + qs : ""}`);
  return handle(res); // { total, page, pageSize, items: [...] }
}

export async function createOrder(body) {
  const res = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle(res); // created order
}

export async function updateOrder(id, patch) {
  const res = await fetch(`${base}/api/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return handle(res); // updated order
}

// ------- TI TICKETS -------
export async function getTickets(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${base}/api/ti/tickets${qs ? "?" + qs : ""}`);
  return handle(res); // { total, page, pageSize, items: [...] }
}

export async function createTicket(body) {
  const res = await fetch(`${base}/api/ti/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle(res); // created ticket
}

export async function updateTicket(id, patch) {
  const res = await fetch(`${base}/api/ti/tickets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return handle(res); // updated ticket
}
