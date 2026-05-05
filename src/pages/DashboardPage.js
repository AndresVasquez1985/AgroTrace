import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { getDashboardStats } from "../services/dashboardService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const COLORS = ["#2E7D32", "#66BB6A", "#A5D6A7", "#1B5E20"];
  const [range, setRange] = useState("all");

  useEffect(() => {
  const loadStats = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboardStats(range);
        setStats(data);
      } catch (err) {
        setError(err.message || "No fue posible cargar el dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [range]);

  return (
    <AdminLayout>
      <div style={styles.page}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Resumen general de AgroTrace.</p>

        <div style={styles.filterRow}>
          <label style={styles.filterLabel}>Periodo:</label>

          <select
            style={styles.select}
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="all">Todo</option>
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="month">Este mes</option>
          </select>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {loading ? (
          <p>Cargando estadísticas...</p>
        ) : (
          <>
            <div style={styles.statsGrid}>
              <StatCard title="Productores" value={stats?.totalProductores} />
              <StatCard title="Fincas" value={stats?.totalFincas} />
              <StatCard title="Lotes" value={stats?.totalLotes} />
              <StatCard title="Procesos" value={stats?.totalProcesos} />
            </div>

            <div style={styles.gridTwo}>
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Lotes por tipo de café</h2>

                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats?.lotesPorTipoProducto || []}
                      dataKey="total"
                      nameKey="tipoProducto"
                      outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {(stats?.lotesPorTipoProducto || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Lotes por finca</h2>

                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats?.lotesPorFinca || []}>
                    <XAxis dataKey="finca" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#2E7D32" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ ...styles.card, marginTop: "16px" }}>
              <h2 style={styles.sectionTitle}>Últimos lotes</h2>

              {(stats?.ultimosLotes || []).length === 0 ? (
                <p style={styles.emptyText}>No hay datos</p>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Código</th>
                        <th style={styles.th}>Finca</th>
                        <th style={styles.th}>Tipo</th>
                        <th style={styles.th}>Fecha</th>
                      </tr>
                    </thead>

                    <tbody>
                      {stats.ultimosLotes.map((l, index) => (
                        <tr
                          key={l.codigoQR}
                          style={{
                            ...styles.tableRow,
                            ...(index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd),
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#eaf5ec";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              index % 2 === 0 ? "#ffffff" : "#f8fbf9";
                          }}
                          onClick={() => navigate(`/${l.codigoQR}`)}
                        >
                          <td style={styles.td}>{l.codigoQR}</td>
                          <td style={styles.td}>{l.finca}</td>
                          <td style={styles.td}>{l.tipoProducto}</td>
                          <td style={styles.td}>
                            {l.fecha ? new Date(l.fecha).toLocaleDateString() : "Sin fecha"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statTitle}>{title}</span>
      <strong style={styles.statValue}>{value ?? 0}</strong>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial",
  },
  title: {
    margin: 0,
    color: "#1f3d2f",
    fontSize: "34px",
  },
  subtitle: {
    marginTop: "8px",
    marginBottom: "22px",
    color: "#5f6b64",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },
  statTitle: {
    color: "#6b756f",
    fontSize: "14px",
  },
  statValue: {
    display: "block",
    marginTop: "8px",
    color: "#2E7D32",
    fontSize: "34px",
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },
  sectionTitle: {
    marginTop: 0,
    color: "#1f3d2f",
  },
  errorBox: {
    marginBottom: "16px",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#fdeaea",
    color: "#b71c1c",
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
  backgroundColor: "#f8fbf9",
  borderBottom: "1px solid #e8ece9",
  color: "#385046",
},

td: {
  padding: "12px",
  borderBottom: "1px solid #edf1ee",
},

emptyText: {
  color: "#6b756f",
},
tableRow: {
  cursor: "pointer",
  transition: "background-color 0.2s ease",
},

tableRowEven: {
  backgroundColor: "#ffffff",
},

tableRowOdd: {
  backgroundColor: "#f8fbf9",
},

filterRow: {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "20px",
},

filterLabel: {
  fontWeight: "bold",
  color: "#385046",
},

select: {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #d6ddd8",
  backgroundColor: "#fff",
},
};

export default DashboardPage;