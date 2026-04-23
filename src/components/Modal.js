import React from "react";

function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    padding: "20px",
  },
  modal: {
    width: "100%",
    maxWidth: "560px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    borderBottom: "1px solid #eee",
  },
  title: {
    margin: 0,
    fontSize: "22px",
    color: "#1f3d2f",
  },
  closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "28px",
    cursor: "pointer",
    color: "#666",
    lineHeight: 1,
  },
  body: {
    padding: "20px",
  },
};

export default Modal;