import { apiFetch } from "./api";

async function parseResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error("El servidor no devolvió una respuesta JSON válida.");
  }
}

export async function getProductores() {
  const response = await apiFetch("/api/productores", {
    method: "GET",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "No fue posible consultar los productores.");
  }

  return data;
}

export async function createProductor(payload) {
  const response = await apiFetch("/api/productores", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "No fue posible crear el productor.");
  }

  return data;
}