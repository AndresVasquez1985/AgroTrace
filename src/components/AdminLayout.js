import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AdminLayout({ children }) {
  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.mainArea}>
        <Topbar />
        <main style={styles.content}>{children}</main>
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
  },
  content: {
    padding: "24px",
  },
};

export default AdminLayout;