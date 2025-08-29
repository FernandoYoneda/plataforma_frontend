// src/services/api.js
const BASE =
  process.env.NODE_ENV === "production"
    ? "" // no Render, o front chama o back pelo domínio; se usar subdomínios, troque aqui
    : "/api"; // em dev, via setupProxy para http://localhost:10000

async function parseJsonSafely(res) {
  // Alguns 204/304 não têm corpo; alguns erros podem vir como HTML.
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // ajuda debugar quando o back não retornou JSON
    throw new Error(`Resposta não é JSON válido (status ${res.status})`);
  }
}

async function request(path, opts = {}) {
  const res = await fetch(
    path.startsWith("/api") || path.startsWith("http")
      ? path
      : `${BASE}${path}`,
    {
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      ...opts,
    }
  );

  // tenta decodificar corpo (pode ser null)
  const data = await parseJsonSafely(res).catch((e) => {
    // quando falhou parse, propaga erro com status
    throw new Error(e.message || `Falha ao ler resposta (${res.status})`);
  });

  if (!res.ok) {
    const msg = data?.error || data?.message || `Erro HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

/* ====== endpoints ====== */

export async function login({ email, password }) {
  return request(`/api/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** Orders (Materiais) */
export async function getOrders(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/orders${qs ? "?" + qs : ""}`);
}
export async function createOrder(payload) {
  return request(`/api/orders`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export async function updateOrder(id, patch) {
  return request(`/api/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

/** Tickets (TI) */
export async function getTickets(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/ti/tickets${qs ? "?" + qs : ""}`);
}
export async function createTicket(payload) {
  return request(`/api/ti/tickets`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export async function updateTicket(id, patch) {
  return request(`/api/ti/tickets/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}
