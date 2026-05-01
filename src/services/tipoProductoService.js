import { apiFetch } from "./api";

async function parseResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }
}

export async function getTipoProductos() {
  const response = await apiFetch("/api/tipoproductos", {
    method: "GET",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Error consultando tipos de producto.");
  }

  return data;
}