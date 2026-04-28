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

export async function updateFinca(id, payload) {
  const response = await apiFetch(`/api/fincas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Error actualizando finca.");
  }

  return data;
}

export async function deleteFinca(id) {
  const response = await apiFetch(`/api/fincas/${id}`, {
    method: "DELETE",
  });

  // DELETE normalmente viene sin body
  if (!response.ok) {
    let error = "Error eliminando finca.";
    try {
      const data = await parseResponse(response);
      error = data?.message || error;
    } catch {}
    throw new Error(error);
  }

  return true;
}