import React from "react";
import { useAuth } from "../auth/AuthContext";

function Topbar() {
  const { user, signOut } = useAuth();

  return (
    <header style={styles.topbar}>
      <div>
        <h2 style={styles.title}>Panel Administrativo</h2>
        <p style={styles.subtitle}>
          {user?.fullName} | {user?.role} | {user?.tenantCode}
        </p>
      </div>

      <button style={styles.button} onClick={signOut}>
        Cerrar sesión
      </button>
    </header>
  );
}

const styles = {
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e5e5e5",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  title: {
    margin: 0,
    color: "#1f3d2f",
    fontSize: "22px",
  },
  subtitle: {
    margin: "4px 0 0 0",
    color: "#666",
    fontSize: "14px",
  },
  button: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2E7D32",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Topbar;