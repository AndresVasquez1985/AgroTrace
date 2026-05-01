import React, { useEffect, useState } from "react";
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || "No fue posible cargar el dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <AdminLayout>
      <div style={styles.page}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Resumen general de AgroTrace.</p>

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
                      label
                    >
                      {(stats?.lotesPorTipoProducto || []).map((_, index) => (
                        <Cell key={`cell-${index}`} />
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
                    <Bar dataKey="total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
};

export default DashboardPage;