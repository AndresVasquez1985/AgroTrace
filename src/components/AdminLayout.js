import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./AdminLayout.css";

function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div style={styles.container}>
      {isSidebarOpen && (
        <div style={styles.overlay} onClick={closeSidebar}></div>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div style={styles.mainArea}>
        <Topbar onMenuClick={openSidebar} />
        <main className="admin-content" style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f4f7f4",
  },
  mainArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  content: {
    padding: "24px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 998,
  },
};

export default AdminLayout;