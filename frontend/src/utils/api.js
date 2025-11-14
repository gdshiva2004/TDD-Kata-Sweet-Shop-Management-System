const API_URL = import.meta.env.VITE_API_URL;

async function request(path, method = "GET", body, token) {
  const res = await fetch(API_URL + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: body ? JSON.stringify(body) : null
  });

  return await res.json();
}

export default {
  get: (path, token) => request(path, "GET", null, token),
  post: (path, body, token) => request(path, "POST", body, token),
  put: (path, body, token) => request(path, "PUT", body, token),
  delete: (path, token) => request(path, "DELETE", null, token)
};
