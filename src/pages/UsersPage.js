import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import {
  createUser,
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "../services/userService";
import { useAuth } from "../auth/AuthContext";

function UsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const [sortConfig, setSortConfig] = useState({
    key: "fullName",
    direction: "asc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirmar",
    variant: "warning",
    onConfirm: null,
  });

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Operador",
  });

  const isAdmin = user?.role === "Admin";

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || "No fue posible consultar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, pageSize]);

  const filteredUsers = users.filter((item) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      item.fullName.toLowerCase().includes(search) ||
      item.email.toLowerCase().includes(search);

    const matchesRole =
      roleFilter === "Todos" ? true : item.role === roleFilter;

    const matchesStatus =
      statusFilter === "Todos"
        ? true
        : statusFilter === "Activo"
        ? item.isActive
        : !item.isActive;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valueA = a[sortConfig.key];
    let valueB = b[sortConfig.key];

    if (sortConfig.key === "isActive") {
      valueA = a.isActive ? 1 : 0;
      valueB = b.isActive ? 1 : 0;
    }

    if (typeof valueA === "string") valueA = valueA.toLowerCase();
    if (typeof valueB === "string") valueB = valueB.toLowerCase();

    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / pageSize) || 1;

  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startRecord =
    sortedUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endRecord = Math.min(currentPage * pageSize, sortedUsers.length);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: "asc",
      };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      password: "",
      role: "Operador",
    });
  };

  const handleOpenCreateModal = () => {
    setError("");
    setSuccess("");
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  const openConfirmModal = ({
    title,
    message,
    confirmText = "Confirmar",
    variant = "warning",
    onConfirm,
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      variant,
      onConfirm,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      confirmText: "Confirmar",
      variant: "warning",
      onConfirm: null,
    });
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

      setSuccess("Usuario creado correctamente.");
      handleCloseCreateModal();
      await loadUsers();
    } catch (err) {
      setError(err.message || "No fue posible crear el usuario.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = (item) => {
    const actionText = item.isActive ? "inactivar" : "activar";

    openConfirmModal({
      title: `${item.isActive ? "Inactivar" : "Activar"} usuario`,
      message: `¿Deseas ${actionText} al usuario ${item.fullName}?`,
      confirmText: item.isActive ? "Inactivar" : "Activar",
      variant: item.isActive ? "danger" : "warning",
      onConfirm: async () => {
        try {
          setError("");
          setSuccess("");

          await updateUserStatus(item.id, !item.isActive);

          setSuccess(
            `Usuario ${item.isActive ? "inactivado" : "activado"} correctamente.`
          );

          closeConfirmModal();
          await loadUsers();
        } catch (err) {
          setError(err.message || "No fue posible actualizar el estado.");
          closeConfirmModal();
        }
      },
    });
  };

  const handleRoleChange = (item, role) => {
    if (item.role === role) return;

    openConfirmModal({
      title: "Cambiar rol",
      message: `¿Deseas cambiar el rol de ${item.fullName} a ${role}?`,
      confirmText: "Cambiar rol",
      variant: "warning",
      onConfirm: async () => {
        try {
          setError("");
          setSuccess("");

          await updateUserRole(item.id, role);

          setSuccess("Rol actualizado correctamente.");
          closeConfirmModal();
          await loadUsers();
        } catch (err) {
          setError(err.message || "No fue posible actualizar el rol.");
          closeConfirmModal();
        }
      },
    });
  };

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>Gestión de usuarios</h1>
            <p style={styles.subtitle}>
              Administra usuarios, roles y estado de acceso.
            </p>
          </div>

          {isAdmin && (
            <button style={styles.primaryButton} onClick={handleOpenCreateModal}>
              + Crear usuario
            </button>
          )}
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.sectionTitle}>Usuarios registrados</h2>
            <span style={styles.counter}>
              {sortedUsers.length} de {users.length} registros
            </span>
          </div>

          <div style={styles.filtersRow}>
            <input
              style={styles.filterInput}
              type="text"
              placeholder="Buscar por nombre o correo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              style={styles.filterSelect}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="Todos">Todos los roles</option>
              <option value="Admin">Admin</option>
              <option value="Operador">Operador</option>
            </select>

            <select
              style={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {loading ? (
            <p>Cargando usuarios...</p>
          ) : sortedUsers.length === 0 ? (
            <div style={styles.emptyState}>
              No se encontraron usuarios con los filtros aplicados.
            </div>
          ) : (
            <>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th
                        style={styles.sortableTh}
                        onClick={() => handleSort("fullName")}
                      >
                        Nombre {getSortIcon("fullName")}
                      </th>
                      <th
                        style={styles.sortableTh}
                        onClick={() => handleSort("email")}
                      >
                        Correo {getSortIcon("email")}
                      </th>
                      <th
                        style={styles.sortableTh}
                        onClick={() => handleSort("role")}
                      >
                        Rol {getSortIcon("role")}
                      </th>
                      <th
                        style={styles.sortableTh}
                        onClick={() => handleSort("isActive")}
                      >
                        Estado {getSortIcon("isActive")}
                      </th>
                      {isAdmin && <th style={styles.th}>Acciones</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedUsers.map((item) => {
                      const isCurrentUser = user?.id === item.id;

                      return (
                        <tr key={item.id}>
                          <td style={styles.td}>
                            <div style={styles.nameCell}>
                              <span>{item.fullName}</span>
                              {isCurrentUser && (
                                <span style={styles.meBadge}>Tú</span>
                              )}
                            </div>
                          </td>

                          <td style={styles.td}>{item.email}</td>

                          <td style={styles.td}>
                            <span style={styles.roleBadge}>{item.role}</span>
                          </td>

                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                ...(item.isActive
                                  ? styles.statusActive
                                  : styles.statusInactive),
                              }}
                            >
                              {item.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </td>

                          {isAdmin && (
                            <td style={styles.td}>
                              <div style={styles.actions}>
                                <button
                                  style={{
                                    ...styles.secondaryButton,
                                    ...(isCurrentUser
                                      ? styles.disabledButton
                                      : {}),
                                  }}
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

              <div style={styles.pagination}>
                <div style={styles.paginationInfo}>
                  Mostrando {startRecord}-{endRecord} de {sortedUsers.length}{" "}
                  registros
                </div>

                <div style={styles.paginationControls}>
                  <select
                    style={styles.pageSizeSelect}
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={5}>5 por página</option>
                    <option value={10}>10 por página</option>
                    <option value={20}>20 por página</option>
                    <option value={50}>50 por página</option>
                  </select>

                  <button
                    style={styles.secondaryButton}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>

                  <span style={styles.pageIndicator}>
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    style={styles.secondaryButton}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <Modal
          isOpen={isCreateModalOpen}
          title="Crear nuevo usuario"
          onClose={handleCloseCreateModal}
        >
          <form onSubmit={handleCreateUser} style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Nombre completo</label>
              <input
                style={styles.input}
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Correo</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ej: juan@agrotrace.com"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <input
                style={styles.input}
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Rol</label>
              <select
                style={styles.input}
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="Admin">Admin</option>
                <option value="Operador">Operador</option>
              </select>
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={handleCloseCreateModal}
              >
                Cancelar
              </button>

              <button
                type="submit"
                style={styles.primaryButton}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar usuario"}
              </button>
            </div>
          </form>
        </Modal>

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          variant={confirmModal.variant}
          onClose={closeConfirmModal}
          onConfirm={confirmModal.onConfirm}
        />
      </div>
    </AdminLayout>
  );
}

const styles = {
  page: {
    fontFamily: "Arial",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    color: "#1f3d2f",
    fontSize: "34px",
  },
  subtitle: {
    marginTop: "8px",
    color: "#5f6b64",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    color: "#1f3d2f",
  },
  counter: {
    fontSize: "14px",
    color: "#6b756f",
    backgroundColor: "#f3f7f4",
    padding: "8px 12px",
    borderRadius: "20px",
  },
  filtersRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginBottom: "18px",
  },
  filterInput: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d6ddd8",
    boxSizing: "border-box",
    fontSize: "14px",
  },
  filterSelect: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d6ddd8",
    boxSizing: "border-box",
    fontSize: "14px",
    backgroundColor: "#fff",
  },
  emptyState: {
    padding: "24px",
    textAlign: "center",
    color: "#6b756f",
    backgroundColor: "#f8fbf9",
    borderRadius: "12px",
    border: "1px dashed #d6ddd8",
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
    padding: "14px 12px",
    borderBottom: "1px solid #e8ece9",
    backgroundColor: "#f8fbf9",
    color: "#385046",
  },
  sortableTh: {
    textAlign: "left",
    padding: "14px 12px",
    borderBottom: "1px solid #e8ece9",
    backgroundColor: "#f8fbf9",
    color: "#385046",
    cursor: "pointer",
    userSelect: "none",
  },
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #edf1ee",
    verticalAlign: "middle",
  },
  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  meBadge: {
    backgroundColor: "#e8f5e9",
    color: "#2E7D32",
    fontSize: "12px",
    fontWeight: "bold",
    padding: "4px 8px",
    borderRadius: "12px",
  },
  roleBadge: {
    display: "inline-block",
    padding: "6px 10px",
    backgroundColor: "#eef5ff",
    color: "#245ea8",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  statusActive: {
    backgroundColor: "#e7f6ea",
    color: "#2E7D32",
  },
  statusInactive: {
    backgroundColor: "#fdeaea",
    color: "#c62828",
  },
  actions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d6ddd8",
    boxSizing: "border-box",
    fontSize: "14px",
  },
  actionSelect: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #d6ddd8",
    backgroundColor: "#fff",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#385046",
  },
  formGrid: {
    display: "grid",
    gap: "16px",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#2E7D32",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #d6ddd8",
    backgroundColor: "#fff",
    cursor: "pointer",
    color: "#33443b",
  },
  cancelButton: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #d6ddd8",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginTop: "18px",
    flexWrap: "wrap",
  },
  paginationInfo: {
    color: "#6b756f",
    fontSize: "14px",
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  pageSizeSelect: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #d6ddd8",
    backgroundColor: "#fff",
  },
  pageIndicator: {
    color: "#385046",
    fontWeight: "bold",
  },
  errorBox: {
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#fdeaea",
    color: "#b71c1c",
  },
  successBox: {
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#e7f6ea",
    color: "#1b5e20",
  },
};

export default UsersPage;