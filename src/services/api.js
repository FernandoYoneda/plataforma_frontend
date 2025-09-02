// src/services/api.js

// Detecta ambiente: usa backend do Render em produção e proxy local em dev.
const BASE_URL =
  typeof window !== "undefined" &&
  window.location.hostname.endsWith("onrender.com")
    ? "https://plataforma-backend-188l.onrender.com"
    : "";

/** Monta querystring a partir de um objeto (ignora vazios) */
function qs(params = {}) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      u.append(k, String(v));
    }
  });
  const s = u.toString();
  return s ? `?${s}` : "";
}

/** Wrapper seguro para fetch:
 * - Sempre lê o corpo como texto
 * - Se !ok -> tenta extrair {error}, senão usa o texto cru
 * - Se ok e tiver JSON válido -> retorna objeto
 * - Se ok e corpo vazio -> retorna null
 */
async function request(path, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text(); // sempre como texto
  if (!res.ok) {
    let msg = text || "Erro na requisição";
    try {
      const j = JSON.parse(text);
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }

  if (!text) return null; // corpo vazio (ex.: 204)
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Resposta inválida do servidor");
  }
}

/** -------- Auth -------- */
export async function login({ email, password }) {
  return request("/api/login", {
    method: "POST",
    body: { email, password },
  });
}

/** -------- Materiais (Orders) -------- */
export async function getOrders(params = {}) {
  return request(`/api/orders${qs(params)}`);
}

export async function createOrder(payload) {
  return request("/api/orders", {
    method: "POST",
    body: payload,
  });
}

export async function updateOrder(id, patch) {
  return request(`/api/orders/${id}`, {
    method: "PUT",
    body: patch,
  });
}

/** -------- TI (Tickets) -------- */
export async function getTickets(params = {}) {
  return request(`/api/ti/tickets${qs(params)}`);
}

export async function createTicket(payload) {
  return request("/api/ti/tickets", {
    method: "POST",
    body: payload,
  });
}

export async function updateTicket(id, patch) {
  return request(`/api/ti/tickets/${id}`, {
    method: "PUT",
    body: patch,
  });
}

/** (Opcional) Healthcheck – útil para diagnósticos */
export async function health() {
  return request("/health");
}
