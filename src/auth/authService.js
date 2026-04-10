import { apiFetch } from "../services/api";

export async function login(payload) {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "No fue posible iniciar sesión.");
  }

  return data;
}