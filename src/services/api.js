// src/services/api.js

// 1) Base URL do backend
// - Em produção, prefira configurar REACT_APP_API_BASE no Render do frontend.
// - Em dev local, deixe vazio ("") para usar o setupProxy e redirecionar para http://localhost:10000.
// - Fallback: se o hostname terminar com onrender.com, usa a URL do seu backend no Render.
const BASE_URL =
  process.env.REACT_APP_API_BASE ||
  (typeof window !== "undefined" &&
  window.location.hostname.endsWith("onrender.com")
    ? "https://plataforma-backend-188l.onrender.com"
    : "");

// 2) Helper: monta querystring ignorando valores vazios
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

// 3) Wrapper robusto pro fetch
// - Sempre lê como texto
// - Se !ok, tenta extrair {error}, senão cai no texto cru
// - Se ok e vier HTML (provável chamada ao frontend), dá erro explicativo
// - Se ok e corpo vazio -> retorna null
async function request(path, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  if (!res.ok) {
    let msg = text || "Erro na requisição";
    try {
      const j = JSON.parse(text);
      if (j?.error) msg = j.error;
    } catch {
      // Se backend caiu ou rota bateu no frontend (HTML), avisa melhor:
      if (/<!doctype html>/i.test(text) || /<html/i.test(text)) {
        msg =
          "A resposta parece ser HTML (provável frontend). Verifique REACT_APP_API_BASE/BASE_URL e o CORS do backend.";
      }
    }
    throw new Error(msg);
  }

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    if (/<!doctype html>/i.test(text) || /<html/i.test(text)) {
      throw new Error(
        "Resposta HTML recebida — provavelmente chamou o frontend. Ajuste REACT_APP_API_BASE/BASE_URL."
      );
    }
    throw new Error("Resposta inválida do servidor");
  }
}

/** ---------- Auth ---------- */
export async function login({ email, password }) {
  return request("/api/login", {
    method: "POST",
    body: { email, password },
  });
}

/** ---------- Materiais (Orders) ---------- */
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

/** ---------- TI (Tickets) ---------- */
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

/** (Opcional) Healthcheck */
export async function health() {
  return request("/health");
}
