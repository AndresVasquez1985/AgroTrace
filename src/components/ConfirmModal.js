import React from "react";
import Modal from "./Modal";

function ConfirmModal({
  isOpen,
  title = "Confirmar acción",
  message = "¿Deseas continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onClose,
  variant = "warning",
}) {
  const accentStyle =
    variant === "danger" ? styles.confirmButtonDanger : styles.confirmButton;

  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <div style={styles.content}>
        <p style={styles.message}>{message}</p>

        <div style={styles.actions}>
          <button type="button" style={styles.cancelButton} onClick={onClose}>
            {cancelText}
          </button>

          <button
            type="button"
            style={{ ...styles.confirmButtonBase, ...accentStyle }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

const styles = {
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  message: {
    margin: 0,
    color: "#44524b",
    fontSize: "15px",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },
  cancelButton: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #d6ddd8",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  confirmButtonBase: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  confirmButton: {
    backgroundColor: "#2E7D32",
  },
  confirmButtonDanger: {
    backgroundColor: "#c62828",
  },
};

export default ConfirmModal;