import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Modal from "../components/Modal";
import { getProductores } from "../services/productorService";
import { createFinca, getFincas } from "../services/fincaService";
import { useAuth } from "../auth/AuthContext";

function FincasPage() {
  const { user } = useAuth();

  const [fincas, setFincas] = useState([]);
  const [productores, setProductores] = useState([]);
  const [filteredFincas, setFilteredFincas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    altitud: "",
    productorId: "",
  });

  const isAdmin = user?.role === "Admin";

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [fincasData, productoresData] = await Promise.all([
        getFincas(),
        getProductores(),
      ]);

      setFincas(fincasData || []);
      setFilteredFincas(fincasData || []);
      setProductores(productoresData || []);
    } catch (err) {
      setError(err.message || "No fue posible cargar las fincas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();

    const result = fincas.filter((item) => {
      const productor = productores.find((p) => p.id === item.productorId);

      return (
        item.nombre?.toLowerCase().includes(term) ||
        productor?.nombre?.toLowerCase().includes(term)
      );
    });

    setFilteredFincas(result);
  }, [searchTerm, fincas, productores]);

  const getProductorNombre = (productorId) => {
    const productor = productores.find((p) => p.id === productorId);
    return productor?.nombre || "Sin productor";
  };

  const handleOpenModal = () => {
    setError("");
    setSuccess("");
    setForm({
      nombre: "",
      altitud: "",
      productorId: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm({
      nombre: "",
      altitud: "",
      productorId: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!form.productorId) {
      setError("Debes seleccionar un productor.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createFinca({
        nombre: form.nombre.trim(),
        altitud: Number(form.altitud),
        productorId: Number(form.productorId),
      });

      setSuccess("Finca creada correctamente.");
      handleCloseModal();
      await loadData();
    } catch (err) {
      setError(err.message || "No fue posible crear la finca.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={styles.page}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>Fincas</h1>
            <p style={styles.subtitle}>
              Administra las fincas asociadas a cada productor.
            </p>
          </div>

          {isAdmin && (
            <button style={styles.primaryButton} onClick={handleOpenModal}>
              + Crear finca
            </button>
          )}
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.sectionTitle}>Fincas registradas</h2>
            <span style={styles.counter}>
              {filteredFincas.length} de {fincas.length} registros
            </span>
          </div>

          <div style={styles.filtersRow}>
            <input
              style={styles.filterInput}
              type="text"
              placeholder="Buscar por finca o productor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <p>Cargando fincas...</p>
          ) : filteredFincas.length === 0 ? (
            <div style={styles.emptyState}>
              No se encontraron fincas registradas.
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Altitud</th>
                    <th style={styles.th}>Productor</th>
                    <th style={styles.th}>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFincas.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>{item.nombre}</td>
                      <td style={styles.td}>{item.altitud} msnm</td>
                      <td style={styles.td}>
                        {getProductorNombre(item.productorId)}
                      </td>
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

        {/* <Modal
          isOpen={isModalOpen}
          title="Crear finca"
          onClose={handleCloseModal}
        >
          <form onSubmit={handleCreate} style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Nombre de la finca</label>
              <input
                style={styles.input}
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Finca El Paraíso"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Altitud</label>
              <input
                style={styles.input}
                type="number"
                name="altitud"
                value={form.altitud}
                onChange={handleChange}
                placeholder="Ej: 1450"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Productor</label>
              <select
                style={styles.input}
                name="productorId"
                value={form.productorId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione productor</option>
                {productores.map((productor) => (
                  <option key={productor.id} value={productor.id}>
                    {productor.nombre}
                  </option>
                ))}
              </select>
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
                {saving ? "Guardando..." : "Guardar finca"}
              </button>
            </div>
          </form>
        </Modal> */}
      </div>
    </div>
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

export default FincasPage;