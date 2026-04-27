import { apiFetch } from "./api";

async function parseResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }
}

export async function getFincas() {
  const response = await apiFetch("/api/fincas", {
    method: "GET",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Error consultando fincas.");
  }

  return data;
}

export async function createFinca(payload) {
  const response = await apiFetch("/api/fincas", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Error creando finca.");
  }

  return data;
}