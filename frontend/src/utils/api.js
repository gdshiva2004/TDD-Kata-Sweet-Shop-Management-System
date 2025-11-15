const RAW = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const API_URL = RAW.replace(/\/+$/, '');

async function request(path, method = "GET", body = null, token = null) {
  const url = path.startsWith("/") ? API_URL + path : API_URL + "/" + path;
  const init = {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : null
  };
  const res = await fetch(url, init);
  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  if (!res.ok) {
    const payload = isJson ? JSON.parse(text || "{}") : { error: text || res.statusText };
    const err = new Error(payload.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return isJson ? JSON.parse(text || "{}") : text;
}

export default {
  get: (path, token) => request(path, "GET", null, token),
  post: (path, body, token) => request(path, "POST", body, token),
  put: (path, body, token) => request(path, "PUT", body, token),
  delete: (path, token) => request(path, "DELETE", null, token)
};
