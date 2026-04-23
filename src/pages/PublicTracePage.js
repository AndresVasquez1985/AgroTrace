import React, { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeCanvas } from "qrcode.react";

function PublicTracePage() {
  const [qr, setQr] = useState("");
  const [data, setData] = useState(null);
  const [scan, setScan] = useState(false);
  const [loading, setLoading] = useState(false);

  const qrRef = useRef();

  const baseUrl = process.env.REACT_APP_PUBLIC_URL || window.location.origin;
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  const consultar = useCallback(
    async (codigo) => {
      try {
        setLoading(true);
        codigo = codigo.replace(baseUrl + "/", "");

        const response = await fetch(
          `${apiUrl}/api/Lotes/trazabilidad/${codigo}`
        );

        if (!response.ok) {
          alert("QR no encontrado o error en API");
          setLoading(false);
          return;
        }

        const text = await response.text();

        if (!text) {
          alert("Respuesta vacía del servidor");
          setLoading(false);
          return;
        }

        const result = JSON.parse(text);
        setData(result);
      } catch (error) {
        console.error("ERROR COMPLETO:", error);
        alert("Error consultando trazabilidad");
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, baseUrl]
  );

  const descargarQR = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const url = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-cafe.png";
    link.click();
  };

  useEffect(() => {
    if (scan) {
      const qrCode = new Html5Qrcode("reader");

      qrCode
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: 250,
          },
          (decodedText) => {
            setQr(decodedText);
            consultar(decodedText);
            qrCode.stop();
            setScan(false);
          }
        )
        .catch((err) => console.error(err));
    }
  }, [scan, consultar]);

  useEffect(() => {
    const path = window.location.pathname.replace("/", "");

    if (path && !path.startsWith("login") && !path.startsWith("dashboard") && !path.startsWith("users")) {
      setQr(path);
      consultar(path);
    }
  }, [consultar]);

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button
          style={styles.loginButton}
          onClick={() =>
            (window.location.href = token ? "/dashboard" : "/login")
          }
        >
          {token ? "Ir al panel" : "Iniciar sesión"}
        </button>
      </div>

      <h1 style={styles.title}>AgroTrace ☕</h1>

      <button style={styles.button} onClick={() => setScan(true)}>
        📷 Escanear QR
      </button>

      {scan && <div id="reader" style={styles.reader}></div>}

      <p style={styles.subtitle}>O ingresar código manual:</p>

      <input
        style={styles.input}
        type="text"
        placeholder="Ej: QR-ABC123"
        value={qr}
        onChange={(e) => setQr(e.target.value)}
      />

      <button style={styles.button} onClick={() => consultar(qr)}>
        Consultar
      </button>

      {loading && (
        <div style={styles.loader}>
          <div style={styles.spinner}></div>
          <p>Consultando trazabilidad...</p>
        </div>
      )}

      {data && (
        <div style={styles.card}>
          <h2>📦 Código QR</h2>

          <div ref={qrRef}>
            <QRCodeCanvas value={`${baseUrl}/${data.lote.codigoQR}`} size={200} />
          </div>

          <button style={styles.button} onClick={descargarQR}>
            ⬇️ Descargar QR
          </button>

          <h2>☕ Lote</h2>
          <p>
            <strong>QR:</strong> {data.lote.codigoQR}
          </p>

          <h2>🌄 Finca</h2>
          <p>{data.finca.nombre}</p>

          <h2>👨‍🌾 Productor</h2>
          <p>{data.productor.nombre}</p>

          <h2>🔄 Procesos</h2>
          <ul>
            {data.procesos.map((p, i) => (
              <li key={i}>
                {p.nombre} - {p.observaciones}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial",
    maxWidth: "700px",
    margin: "auto",
    padding: "20px",
    textAlign: "center",
  },
  topBar: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px",
  },
  loginButton: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2E7D32",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  title: {
    color: "#2E7D32",
    fontSize: "56px",
    marginBottom: "30px",
  },
  subtitle: {
    marginTop: "30px",
    fontSize: "18px",
  },
  input: {
    width: "100%",
    padding: "16px",
    marginTop: "10px",
    borderRadius: "12px",
    border: "1px solid #ccc",
    fontSize: "18px",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "14px",
    padding: "16px",
    width: "100%",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#2E7D32",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "18px",
  },
  card: {
    marginTop: "24px",
    padding: "20px",
    borderRadius: "14px",
    backgroundColor: "#f5f5f5",
    textAlign: "left",
  },
  reader: {
    marginTop: "20px",
  },
  loader: {
    marginTop: "20px",
    textAlign: "center",
  },
  spinner: {
    border: "6px solid #f3f3f3",
    borderTop: "6px solid #2E7D32",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    margin: "auto",
  },
};

const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(
    `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,
    styleSheet.cssRules.length
  );
}

export default PublicTracePage;