const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

export async function apiGet(path, customHeaders = {}) {
  const headers = { ...customHeaders };
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data?.error === "string"
        ? data.error
        : data?.message || res.statusText || "Request failed";
    throw new Error(msg);
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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data?.error === "string"
        ? data.error
        : data?.message || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}
