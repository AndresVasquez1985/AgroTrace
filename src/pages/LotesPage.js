import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Modal from "../components/Modal";
import { getFincas } from "../services/fincaService";
import {
  createLote,
  deleteLote,
  getLotes,
  updateLote,
} from "../services/loteService";
import { useAuth } from "../auth/AuthContext";

function LotesPage() {
  const { user } = useAuth();

  const [lotes, setLotes] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [filteredLotes, setFilteredLotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLote, setEditingLote] = useState(null);

  const [form, setForm] = useState({
    fincaId: "",
    tipoProductoId: "",
  });

  const isAdmin = user?.role === "Admin";

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [lotesData, fincasData] = await Promise.all([
        getLotes(),
        getFincas(),
      ]);

      setLotes(lotesData || []);
      setFilteredLotes(lotesData || []);
      setFincas(fincasData || []);
    } catch (err) {
      setError(err.message || "No fue posible cargar los lotes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();

    const result = lotes.filter((item) => {
      const finca = fincas.find((f) => f.id === item.fincaId);

      return (
        item.codigoQR?.toLowerCase().includes(term) ||
        finca?.nombre?.toLowerCase().includes(term) ||
        String(item.tipoProductoId || "").includes(term)
      );
    });

    setFilteredLotes(result);
  }, [searchTerm, lotes, fincas]);

  const getFincaNombre = (fincaId) => {
    const finca = fincas.find((f) => f.id === fincaId);
    return finca?.nombre || "Sin finca";
  };

  const handleOpenCreateModal = () => {
    setEditingLote(null);
    setError("");
    setSuccess("");
    setForm({
      fincaId: "",
      tipoProductoId: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lote) => {
    setEditingLote(lote);
    setError("");
    setSuccess("");
    setForm({
      fincaId: lote.fincaId || "",
      tipoProductoId: lote.tipoProductoId || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLote(null);
    setForm({
      fincaId: "",
      tipoProductoId: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fincaId) {
      setError("Debes seleccionar una finca.");
      return;
    }

    if (!form.tipoProductoId) {
      setError("Debes ingresar el tipo de producto.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        fincaId: Number(form.fincaId),
        tipoProductoId: Number(form.tipoProductoId),
      };

      if (editingLote) {
        await updateLote(editingLote.id, payload);
        setSuccess("Lote actualizado correctamente.");
      } else {
        await createLote(payload);
        setSuccess("Lote creado correctamente.");
      }

      handleCloseModal();
      await loadData();
    } catch (err) {
      setError(err.message || "No fue posible guardar el lote.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lote) => {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar el lote "${lote.codigoQR}"?`
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setSuccess("");

      await deleteLote(lote.id);

      setSuccess("Lote eliminado correctamente.");
      await loadData();
    } catch (err) {
      setError(err.message || "No fue posible eliminar el lote.");
    }
  };

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>Lotes</h1>
            <p style={styles.subtitle}>
              Administra los lotes asociados a cada finca.
            </p>
          </div>

          {isAdmin && (
            <button style={styles.primaryButton} onClick={handleOpenCreateModal}>
              + Crear lote
            </button>
          )}
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.sectionTitle}>Lotes registrados</h2>
            <span style={styles.counter}>
              {filteredLotes.length} de {lotes.length} registros
            </span>
          </div>

          <div style={styles.filtersRow}>
            <input
              style={styles.filterInput}
              type="text"
              placeholder="Buscar por QR, finca o tipo de producto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <p>Cargando lotes...</p>
          ) : filteredLotes.length === 0 ? (
            <div style={styles.emptyState}>
              No se encontraron lotes registrados.
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Código QR</th>
                    <th style={styles.th}>Fecha</th>
                    <th style={styles.th}>Finca</th>
                    <th style={styles.th}>Tipo producto</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLotes.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>{item.codigoQR}</td>
                      <td style={styles.td}>
                        {item.fecha
                          ? new Date(item.fecha).toLocaleDateString()
                          : "Sin fecha"}
                      </td>
                      <td style={styles.td}>{getFincaNombre(item.fincaId)}</td>
                      <td style={styles.td}>{item.tipoProductoId}</td>
                      <td style={styles.td}>
                        {isAdmin && (
                          <div style={styles.actions}>
                            <button
                              type="button"
                              style={styles.editButton}
                              onClick={() => handleOpenEditModal(item)}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              style={styles.deleteButton}
                              onClick={() => handleDelete(item)}
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
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
          title={editingLote ? "Editar lote" : "Crear lote"}
          onClose={handleCloseModal}
        >
          <form onSubmit={handleSubmit} style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Finca</label>
              <select
                style={styles.input}
                name="fincaId"
                value={form.fincaId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione finca</option>
                {fincas.map((finca) => (
                  <option key={finca.id} value={finca.id}>
                    {finca.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Tipo producto</label>
              <input
                style={styles.input}
                type="number"
                name="tipoProductoId"
                value={form.tipoProductoId}
                onChange={handleChange}
                placeholder="Ej: 1"
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
                {saving
                  ? "Guardando..."
                  : editingLote
                  ? "Actualizar lote"
                  : "Guardar lote"}
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
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  editButton: {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #2E7D32",
    backgroundColor: "#fff",
    color: "#2E7D32",
    fontWeight: "bold",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #b71c1c",
    backgroundColor: "#fff",
    color: "#b71c1c",
    fontWeight: "bold",
    cursor: "pointer",
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

export default LotesPage;