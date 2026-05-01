import { apiFetch } from "./api";

async function parseResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }
}

export async function getDashboardStats() {
  const response = await apiFetch("/api/dashboard/stats", {
    method: "GET",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Error consultando estadísticas.");
  }

  return data;
}