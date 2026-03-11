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

  // Only try to parse JSON when the response body is JSON to avoid
  // crashing on HTML error pages (e.g. 502/503 from a proxy).
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error((data && data.message) || `Request failed: ${res.status}`);
  }
  return data;
}