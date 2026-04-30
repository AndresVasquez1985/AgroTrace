import { apiFetch } from "./api";

async function parseResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }
}

export async function getLotes() {
  const response = await apiFetch("/api/lotes", {
    method: "GET",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Error consultando lotes.");
  }

  return data;
}

export async function createLote(payload) {
  const response = await apiFetch("/api/lotes", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Error creando lote.");
  }

  return data;
}

export async function updateLote(id, payload) {
  const response = await apiFetch(`/api/lotes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Error actualizando lote.");
  }

  return data;
}

export async function deleteLote(id) {
  const response = await apiFetch(`/api/lotes/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let error = "Error eliminando lote.";

    try {
      const data = await parseResponse(response);
      error = data?.message || error;
    } catch {}

    throw new Error(error);
  }

  return true;
}