import React from "react";
import AdminLayout from "../components/AdminLayout";
import { useAuth } from "../auth/AuthContext";

function DashboardPage() {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Bienvenido</h3>
          <p>{user?.fullName}</p>
        </div>

        <div style={styles.card}>
          <h3>Rol</h3>
          <p>{user?.role}</p>
        </div>

        <div style={styles.card}>
          <h3>Empresa</h3>
          <p>{user?.tenantCode}</p>
        </div>
      </div>
    </AdminLayout>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
};

export default DashboardPage;