// src/services/api.js

// Em produção (onrender.com) use a URL do backend no Render.
// Em dev, deixe string vazia para usar o proxy /setupProxy.js.
const BASE_URL =
  process.env.REACT_APP_API_BASE ||
  (typeof window !== "undefined" &&
  window.location.hostname.endsWith("onrender.com")
    ? "https://plataforma-backend-188l.onrender.com"
    : "");

// Monta querystring
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

// Mini helper: espera X ms
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Wrapper de fetch com:
 * - Cabeçalho JSON por padrão
 * - Leitura SEMPRE como texto
 * - Diagnóstico se vier HTML (ex: página de erro ou cold start)
 * - Retentativa leve se detectar HTML/corpo vazio
 */
async function request(path, { method = "GET", headers = {}, body } = {}) {
  const url = `${BASE_URL}${path}`;

  // até 2 tentativas se vier corpo vazio/HTML (cold start do Render)
  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
      // credentials: 'include', // se um dia usar cookies
    });

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    if (!res.ok) {
      // tenta extrair {error} se for JSON
      let msg = text || `Erro HTTP ${res.status}`;
      try {
        const j = JSON.parse(text);
        if (j?.error) msg = j.error;
      } catch {}
      throw new Error(msg);
    }

    // 204 sem conteúdo
    if (!text) {
      if (attempt === 1) {
        // espera um tico e tenta de novo
        await sleep(600);
        continue;
      }
      return null;
    }

    // Se parece JSON, parseia
    if (contentType.includes("application/json")) {
      try {
        return JSON.parse(text);
      } catch {
        // tenta mais uma vez (caso backend ainda esteja acordando)
        if (attempt === 1) {
          await sleep(600);
          continue;
        }
        throw new Error("Resposta inválida do servidor (JSON malformado).");
      }
    }

    // Não veio JSON. Às vezes o Render devolve HTML enquanto acorda.
    const isHtml =
      contentType.includes("text/html") ||
      text.startsWith("<!DOCTYPE") ||
      text.startsWith("<html");

    if (isHtml && attempt === 1) {
      // pequena retentativa
      await sleep(600);
      continue;
    }

    // Última tentativa falhou / corpo não-JSON
    const preview = text.slice(0, 200).replace(/\s+/g, " ");
    throw new Error(
      `Resposta inválida do servidor (content-type: ${contentType || "desconhecido"}). Prévia: ${preview}`
    );
  }

  // fallback impossível de chegar aqui
  throw new Error("Erro inesperado no cliente.");
}

/** -------- Auth -------- */
export async function login({ email, password }) {
  return request("/api/login", { method: "POST", body: { email, password } });
}

/** -------- Materiais (Orders) -------- */
export async function getOrders(params = {}) {
  return request(`/api/orders${qs(params)}`);
}
export async function createOrder(payload) {
  return request("/api/orders", { method: "POST", body: payload });
}
export async function updateOrder(id, patch) {
  return request(`/api/orders/${id}`, { method: "PUT", body: patch });
}

/** -------- TI (Tickets) -------- */
export async function getTickets(params = {}) {
  return request(`/api/ti/tickets${qs(params)}`);
}
export async function createTicket(payload) {
  return request("/api/ti/tickets", { method: "POST", body: payload });
}
export async function updateTicket(id, patch) {
  return request(`/api/ti/tickets/${id}`, { method: "PUT", body: patch });
}

/** Health opcional */
export async function health() {
  return request("/health");
}
