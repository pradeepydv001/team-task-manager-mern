const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("ttm_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.errors?.[0]?.msg || data.message || "Request failed";
    throw new Error(message);
  }
  return data;
}
