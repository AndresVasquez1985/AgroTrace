import React from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Usuarios", path: "/users" },
    { label: "Trazabilidad", path: "/" },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>AgroTrace</div>

      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #1f4d38 0%, #163728 100%)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    boxSizing: "border-box",
  },
  brand: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "32px",
    textAlign: "center",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  link: {
    color: "#e8f3ec",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: "10px",
    transition: "0.2s ease",
    fontWeight: "500",
  },
  linkActive: {
    backgroundColor: "#2E7D32",
    color: "#fff",
  },
};

export default Sidebar;