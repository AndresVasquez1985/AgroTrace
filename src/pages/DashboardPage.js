import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../auth/AuthContext";
import { getUsers } from "../services/userService";
import { Link } from "react-router-dom";

function DashboardPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message || "No fue posible cargar el dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((x) => x.isActive).length;
    const inactiveUsers = users.filter((x) => !x.isActive).length;
    const adminUsers = users.filter((x) => x.role === "Admin").length;
    const operatorUsers = users.filter((x) => x.role === "Operador").length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      operatorUsers,
    };
  }, [users]);

  return (
    <AdminLayout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <div>
            <h1 style={styles.title}>Dashboard AgroTrace</h1>
            <p style={styles.subtitle}>
              Bienvenido, {user?.fullName}. Aquí tienes un resumen general de tu
              entorno administrativo.
            </p>
          </div>

          <div style={styles.heroBadge}>
            <div style={styles.heroBadgeTitle}>Empresa</div>
            <div style={styles.heroBadgeValue}>{user?.tenantCode}</div>
          </div>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {loading ? (
          <div style={styles.card}>
            <p>Cargando métricas...</p>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              <MetricCard
                title="Total usuarios"
                value={metrics.totalUsers}
                description="Usuarios registrados en la empresa"
              />
              <MetricCard
                title="Usuarios activos"
                value={metrics.activeUsers}
                description="Con acceso habilitado al sistema"
              />
              <MetricCard
                title="Usuarios inactivos"
                value={metrics.inactiveUsers}
                description="Usuarios bloqueados o suspendidos"
              />
              <MetricCard
                title="Administradores"
                value={metrics.adminUsers}
                description="Usuarios con permisos avanzados"
              />
              <MetricCard
                title="Operadores"
                value={metrics.operatorUsers}
                description="Usuarios con acceso operativo"
              />
            </div>

            <div style={styles.bottomGrid}>
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Resumen operativo</h2>

                <div style={styles.infoRows}>
                  <InfoRow
                    label="Usuario autenticado"
                    value={user?.fullName || "-"}
                  />
                  <InfoRow label="Correo" value={user?.email || "-"} />
                  <InfoRow label="Rol actual" value={user?.role || "-"} />
                  <InfoRow label="Tenant" value={user?.tenantCode || "-"} />
                </div>
              </div>

              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Accesos rápidos</h2>

                <div style={styles.quickActions}>
                  <Link to="/users" style={styles.primaryLink}>
                    Ir a gestión de usuarios
                  </Link>

                  <Link to="/" style={styles.secondaryLink}>
                    Ir a trazabilidad pública
                  </Link>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Vista rápida de usuarios</h2>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nombre</th>
                      <th style={styles.th}>Correo</th>
                      <th style={styles.th}>Rol</th>
                      <th style={styles.th}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td style={styles.td}>{item.fullName}</td>
                        <td style={styles.td}>{item.email}</td>
                        <td style={styles.td}>{item.role}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              ...(item.isActive
                                ? styles.badgeActive
                                : styles.badgeInactive),
                            }}
                          >
                            {item.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function MetricCard({ title, value, description }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricValue}>{value}</div>
      <div style={styles.metricTitle}>{title}</div>
      <div style={styles.metricDescription}>{description}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial",
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    color: "#1f3d2f",
  },
  subtitle: {
    marginTop: "10px",
    color: "#56645d",
    maxWidth: "760px",
    lineHeight: 1.5,
  },
  heroBadge: {
    background: "linear-gradient(135deg, #2E7D32 0%, #1f5f25 100%)",
    color: "#fff",
    borderRadius: "16px",
    padding: "18px 22px",
    minWidth: "180px",
    boxShadow: "0 8px 20px rgba(46,125,50,0.25)",
  },
  heroBadgeTitle: {
    fontSize: "13px",
    opacity: 0.9,
  },
  heroBadgeValue: {
    fontSize: "24px",
    fontWeight: "bold",
    marginTop: "6px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  metricCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },
  metricValue: {
    fontSize: "34px",
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: "10px",
  },
  metricTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1f3d2f",
    marginBottom: "8px",
  },
  metricDescription: {
    fontSize: "14px",
    color: "#66756d",
    lineHeight: 1.4,
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    marginBottom: "24px",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "18px",
    color: "#1f3d2f",
  },
  infoRows: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    paddingBottom: "10px",
    borderBottom: "1px solid #f0f0f0",
  },
  infoLabel: {
    color: "#66756d",
    fontWeight: "bold",
  },
  infoValue: {
    color: "#1f3d2f",
  },
  quickActions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  primaryLink: {
    display: "inline-block",
    textDecoration: "none",
    backgroundColor: "#2E7D32",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "10px",
    fontWeight: "bold",
    textAlign: "center",
  },
  secondaryLink: {
    display: "inline-block",
    textDecoration: "none",
    backgroundColor: "#edf5ee",
    color: "#1f3d2f",
    padding: "12px 16px",
    borderRadius: "10px",
    fontWeight: "bold",
    textAlign: "center",
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
};

export default DashboardPage;