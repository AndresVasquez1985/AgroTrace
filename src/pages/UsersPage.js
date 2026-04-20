import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import {
  createUser,
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "../services/userService";
import { useAuth } from "../auth/AuthContext";

function UsersPage() {
  const { user } = useAuth();

  const [success, setSuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Operador",
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Error consultando usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createUser({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });

      setForm({
        fullName: "",
        email: "",
        password: "",
        role: "Operador",
      });

      setSuccess("Usuario creado correctamente.");
      await loadUsers();
    } catch (err) {
      setError(err.message || "No fue posible crear el usuario.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item) => {
  const actionText = item.isActive ? "inactivar" : "activar";
  const confirmed = window.confirm(
    `¿Deseas ${actionText} al usuario ${item.fullName}?`
  );

  if (!confirmed) return;

  try {
    setError("");
    setSuccess("");

    await updateUserStatus(item.id, !item.isActive);

    setSuccess(
      `Usuario ${item.isActive ? "inactivado" : "activado"} correctamente.`
    );

    await loadUsers();
  } catch (err) {
    setError(err.message || "No fue posible actualizar el estado.");
  }
};

const handleRoleChange = async (item, role) => {
  if (item.role === role) return;

  const confirmed = window.confirm(
    `¿Deseas cambiar el rol de ${item.fullName} a ${role}?`
  );

  if (!confirmed) return;

  try {
    setError("");
    setSuccess("");

    await updateUserRole(item.id, role);

    setSuccess("Rol actualizado correctamente.");
    await loadUsers();
  } catch (err) {
    setError(err.message || "No fue posible actualizar el rol.");
  }
};
  const isAdmin = user?.role === "Admin";

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Gestión de usuarios</h1>
            <p style={styles.subtitle}>
              Administra usuarios, roles y estado de acceso.
            </p>
          </div>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        {isAdmin && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Crear usuario</h2>

            <form onSubmit={handleCreateUser} style={styles.formGrid}>
              <input
                style={styles.input}
                type="text"
                name="fullName"
                placeholder="Nombre completo"
                value={form.fullName}
                onChange={handleChange}
                required
              />

              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="Correo"
                value={form.email}
                onChange={handleChange}
                required
              />

              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="Contraseña"
                value={form.password}
                onChange={handleChange}
                required
              />

              <select
                style={styles.input}
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="Admin">Admin</option>
                <option value="Operador">Operador</option>
              </select>

              <button style={styles.primaryButton} type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Crear usuario"}
              </button>
            </form>
          </div>
        )}

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Usuarios registrados</h2>

          {loading ? (
            <p>Cargando usuarios...</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Correo</th>
                    <th style={styles.th}>Rol</th>
                    <th style={styles.th}>Estado</th>
                    {isAdmin && <th style={styles.th}>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => {
                    const isCurrentUser = user?.id === item.id;

                    return (
                      <tr key={item.id}>
                        <td style={styles.td}>{item.fullName}</td>
                        <td style={styles.td}>{item.email}</td>
                        <td style={styles.td}>{item.role}</td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              ...(item.isActive ? styles.badgeActive : styles.badgeInactive),
                            }}
                          >
                            {item.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        {isAdmin && (
                          <td style={styles.td}>
                            <div style={styles.actions}>
                              <button
                                style={styles.secondaryButton}
                                onClick={() => handleToggleStatus(item)}
                                disabled={isCurrentUser}
                              >
                                {item.isActive ? "Inactivar" : "Activar"}
                              </button>

                              <select
                                style={styles.actionSelect}
                                value={item.role}
                                onChange={(e) =>
                                  handleRoleChange(item, e.target.value)
                                }
                                disabled={isCurrentUser}
                              >
                                <option value="Admin">Admin</option>
                                <option value="Operador">Operador</option>
                              </select>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

const styles = {
  page: {
    fontFamily: "Arial",
    padding: "24px",
    maxWidth: "1200px",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    color: "#1f3d2f",
  },
  subtitle: {
    marginTop: "8px",
    color: "#4c5b52",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "16px",
    color: "#2E7D32",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    alignItems: "center",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    width: "100%",
  },
  primaryButton: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2E7D32",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#f8f8f8",
    cursor: "pointer",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#f7faf7",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    verticalAlign: "middle",
  },
  actions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  actionSelect: {
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  badgeActive: {
    backgroundColor: "#e7f6ea",
    color: "#2E7D32",
  },
  badgeInactive: {
    backgroundColor: "#fdeaea",
    color: "#c62828",
  },
  errorBox: {
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#fdeaea",
    color: "#b71c1c",
  },
  successBox: {
  marginBottom: "16px",
  padding: "12px",
  borderRadius: "8px",
  backgroundColor: "#e7f6ea",
  color: "#1b5e20",
},
};

export default UsersPage;