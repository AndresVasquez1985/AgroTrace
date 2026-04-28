import React, { useEffect, useState } from "react";
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

      <Modal
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
      </Modal>
    </div>
  );
}