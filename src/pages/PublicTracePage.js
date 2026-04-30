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

          <div style={styles.section}>
            <h3>☕ Información del lote</h3>
            <p><strong>Código:</strong> {data.lote.codigoQR}</p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🌄 Información de la finca</h3>
            <p>
              <strong>Nombre:</strong> {data.finca?.nombre || "No disponible"}
            </p>
            <p>
              <strong>Altitud:</strong>{" "}
              {data.finca?.altitud ? `${data.finca.altitud} msnm` : "No disponible"}
            </p>
          </div>

          {data.finca?.latitud && data.finca?.longitud && (
            <div style={styles.mapBox}>
              <h3 style={styles.sectionTitle}>📍 Ubicación de la finca</h3>

              <iframe
                title="Ubicación de la finca"
                width="100%"
                height="260"
                style={styles.map}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${data.finca.latitud},${data.finca.longitud}&z=15&output=embed`}
              />
            </div>
          )}

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>👨‍🌾 Información del productor</h3>
            <p>
              <strong>Nombre:</strong> {data.productor?.nombre || "No disponible"}
            </p>
          </div>

          <h2>🔄 Procesos</h2>
          <div style={styles.timeline}>
            {data.procesos.map((p, i) => (
              <div key={i} style={styles.timelineItem}>
                <div style={styles.timelineDot}></div>

                <div style={styles.timelineContent}>
                  <h4 style={styles.timelineTitle}>{p.nombre}</h4>

                  <p style={styles.timelineText}>
                    {p.observaciones || "Sin observaciones"}
                  </p>

                  {p.fecha && (
                    <span style={styles.timelineDate}>
                      {new Date(p.fecha).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
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
  section: {
    backgroundColor: "#fff",
    padding: "16px",
    borderRadius: "12px",
    marginTop: "16px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "10px",
    color: "#1f3d2f",
  },
  timeline: {
    marginTop: "10px",
    borderLeft: "3px solid #2E7D32",
    paddingLeft: "16px",
  },

  timelineItem: {
    position: "relative",
    marginBottom: "20px",
  },

  timelineDot: {
    width: "12px",
    height: "12px",
    backgroundColor: "#2E7D32",
    borderRadius: "50%",
    position: "absolute",
    left: "-23px",
    top: "6px",
  },

  timelineContent: {
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },

  timelineTitle: {
    margin: 0,
    color: "#1f3d2f",
  },

  timelineText: {
    margin: "6px 0",
    color: "#555",
  },

  timelineDate: {
    fontSize: "12px",
    color: "#888",
  },

  mapBox: {
    backgroundColor: "#fff",
    padding: "16px",
    borderRadius: "12px",
    marginTop: "16px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },

  map: {
    border: 0,
    borderRadius: "12px",
    marginTop: "8px",
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