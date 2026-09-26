// Base URL of the API. Callers always pass paths that already start with the
// /api prefix (e.g. '/api/auth/login'), so a trailing '/api' on the base is
// stripped: the request can never end up as /api/api/...
const API_BASE = (import.meta.env.VITE_API_URL || "")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

// The API answers with JSON (express `res.json()`). Anything else - the SPA's
// index.html from a rewrite fallthrough, an empty 200, a proxy error page -
// is not a trustworthy answer and must never be read as proof of a session.
function isJsonContentType(res) {
  return (res.headers.get("content-type") || "")
    .toLowerCase()
    .includes("application/json");
}

// Reads a response body, but only ever JSON.parses it when the server declared
// an application/json Content-Type. kind is one of 'json' | 'empty' | 'non-json'.
async function readBody(res) {
  const text = await res.text();

  // No body at all (e.g. 204): 'empty', regardless of content-type.
  if (!text.trim()) {
    return { kind: "empty", data: null };
  }

  // Never JSON.parse unless the server declared application/json.
  if (!isJsonContentType(res)) {
    return { kind: "non-json", data: null };
  }

  try {
    return { kind: "json", data: JSON.parse(text) };
  } catch {
    return { kind: "non-json", data: null };
  }
}

function errorMessage(res, data) {
  if (typeof data?.error === "string") {
    return data.error;
  }
  return data?.message || res.statusText || "Request failed";
}

export async function apiGet(path, customHeaders = {}) {
  const headers = { ...customHeaders };
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { headers });
  const { kind, data } = await readBody(res);

  if (!res.ok) {
    throw new Error(errorMessage(res, data));
  }

  // A 200 that is empty, not JSON, or not a JSON object proves nothing about
  // who the caller is. Fail closed so auth checks treat it as unauthenticated.
  if (kind !== "json" || data === null || typeof data !== "object") {
    throw new Error("Invalid response from the API: expected a JSON object");
  }

  return data;
}

export async function apiSend(path, method, body, customHeaders = {}) {
  const headers = { "Content-Type": "application/json", ...customHeaders };
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: JSON.stringify(body),
  });
  const { kind, data } = await readBody(res);

  if (!res.ok) {
    throw new Error(errorMessage(res, data));
  }

  // 200/204 with no body -> null (carries no token, no user, no proof).
  if (kind === "empty") {
    return null;
  }

  // A success that is not JSON cannot be the API's answer - reject it rather
  // than letting an HTML page be treated as a successful payload.
  if (kind === "non-json") {
    throw new Error("Invalid response from the API: expected JSON");
  }

  return data;
}
