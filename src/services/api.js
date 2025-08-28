// src/services/api.js
const base = "";

// TI
export async function createTicket(payload) {
  const res = await fetch(`${base}/api/ti/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // {sector, nameOrStore, title, description}
  });
  if (!res.ok) throw new Error("Erro ao criar chamado");
  return res.json();
}

export async function getTickets(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${base}/api/ti/tickets?${qs}`);
  if (!res.ok) throw new Error("Erro ao listar chamados");
  return res.json();
}

export async function updateTicket(id, patch) {
  const res = await fetch(`${base}/api/ti/tickets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Erro ao atualizar chamado");
  return res.json();
}

// MATERIAIS (exemplo – mantenha seus outros exports)
export async function createOrder(payload) {
  const res = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erro ao criar pedido");
  return res.json();
}

export async function getOrders(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${base}/api/orders?${qs}`);
  if (!res.ok) throw new Error("Erro ao listar pedidos");
  return res.json();
}

export async function updateOrder(id, patch) {
  const res = await fetch(`${base}/api/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Erro ao atualizar pedido");
  return res.json();
}

export async function login(credentials) {
  const res = await fetch(`/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || "Falha no login");
  }
  return res.json();
}
