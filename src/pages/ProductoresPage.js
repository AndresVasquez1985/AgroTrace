import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Modal from "../components/Modal";
import { useAuth } from "../auth/AuthContext";
import { createProductor, getProductores } from "../services/productorService";

function ProductoresPage() {
  const { user } = useAuth();

  const [productores, setProductores] = useState([]);
  const [filteredProductores, setFilteredProductores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
  });

  const isAdmin = user?.role === "Admin";

  const loadProductores = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProductores();

      setProductores(data || []);
      setFilteredProductores(data || []);
    } catch (err) {
      setError(err.message || "No fue posible cargar productores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductores();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();

    const result = productores.filter((item) =>
      item.nombre?.toLowerCase().includes(term)
    );

    setFilteredProductores(result);
  }, [searchTerm, productores]);

  const handleOpenModal = () => {
    setError("");
    setSuccess("");
    setForm({ nombre: "" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm({ nombre: "" });
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createProductor({
        nombre: form.nombre.trim(),
      });

      setSuccess("Productor creado correctamente.");
      handleCloseModal();
      await loadProductores();
    } catch (err) {
      setError(err.message || "No fue posible crear el productor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>Productores</h1>
            <p style={styles.subtitle}>
              Administra los productores asociados a la empresa.
            </p>
          </div>

          {isAdmin && (
            <button style={styles.primaryButton} onClick={handleOpenModal}>
              + Crear productor
            </button>
          )}
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.sectionTitle}>Productores registrados</h2>
            <span style={styles.counter}>
              {filteredProductores.length} de {productores.length} registros
            </span>
          </div>

          <div style={styles.filtersRow}>
            <input
              style={styles.filterInput}
              type="text"
              placeholder="Buscar productor por nombre"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <p>Cargando productores...</p>
          ) : filteredProductores.length === 0 ? (
            <div style={styles.emptyState}>
              No se encontraron productores registrados.
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Tenant</th>
                    <th style={styles.th}>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProductores.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>{item.nombre}</td>
                      <td style={styles.td}>{item.tenantId}</td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge}>Activo</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          title="Crear productor"
          onClose={handleCloseModal}
        >
          <form onSubmit={handleCreate} style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Nombre del productor</label>
              <input
                style={styles.input}
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    nombre: e.target.value,
                  }))
                }
                placeholder="Ej: Finca El Paraíso S.A.S"
                required
              />
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={handleCloseModal}
              >
                Cancelar
              </button>

              <button
                type="submit"
                style={styles.primaryButton}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar productor"}
              </button>
            </div>
          </form>
        </Modal>
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
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #edf1ee",
  },
  statusBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: "#e7f6ea",
    color: "#2E7D32",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d6ddd8",
    boxSizing: "border-box",
    fontSize: "14px",
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
  cancelButton: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #d6ddd8",
    backgroundColor: "#fff",
    cursor: "pointer",
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

export default ProductoresPage;