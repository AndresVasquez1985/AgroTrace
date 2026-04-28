import React from "react";
import { useAuth } from "../auth/AuthContext";

function Topbar({ onMenuClick }) {
  const { user, signOut } = useAuth();

  return (
    <header style={styles.topbar}>
      <button
        className="admin-menu-button"
        style={styles.menuButton}
        onClick={onMenuClick}
      >
        ☰
      </button>

      <div style={styles.userInfo}>
        <h2 className="admin-topbar-title" style={styles.title}>Panel Administrativo</h2>
        <p className="admin-topbar-subtitle" style={styles.subtitle}>
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
    gap: "16px",
    padding: "18px 24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e5e5e5",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  menuButton: {
    display: "none",
    border: "none",
    backgroundColor: "#edf5ee",
    color: "#1f3d2f",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "20px",
    cursor: "pointer",
  },
  userInfo: {
    flex: 1,
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
    whiteSpace: "nowrap",
  },
};

export default Topbar;