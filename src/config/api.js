export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Authenticated fetch wrapper. Automatically adds Authorization header
 * when a token is stored in localStorage, and parses JSON.
 * Throws an Error with the server's message on non-OK responses.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}