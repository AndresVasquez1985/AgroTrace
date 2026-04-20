import { apiFetch } from "./api";

export async function getUsers() {
  const response = await apiFetch("/api/users", {
    method: "GET",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : [];

  if (!response.ok) {
    throw new Error(data?.message || "No fue posible consultar los usuarios.");
  }

  return data;
}

export async function createUser(payload) {
  const response = await apiFetch("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "No fue posible crear el usuario.");
  }

  return data;
}

export async function updateUserStatus(id, isActive) {
  const response = await apiFetch(`/api/users/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ isActive }),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "No fue posible actualizar el estado.");
  }

  return data;
}

export async function updateUserRole(id, role) {
  const response = await apiFetch(`/api/users/${id}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "No fue posible actualizar el rol.");
  }

  return data;
}