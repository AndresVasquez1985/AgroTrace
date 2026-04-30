import { apiFetch } from "./api";

async function parseResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }
}

export async function getTrazabilidad(codigoQR) {
  const response = await apiFetch(`/api/lotes/trazabilidad/${codigoQR}`, {
    method: "GET",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "No se encontró información de trazabilidad.");
  }

  return data;
}