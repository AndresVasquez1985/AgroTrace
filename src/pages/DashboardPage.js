import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Dashboard AgroTrace</h1>
      <p><strong>Usuario:</strong> {user?.fullName}</p>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Tenant:</strong> {user?.tenantCode}</p>
      <p><strong>Rol:</strong> {user?.role}</p>

      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        <Link to="/users">Ir a usuarios</Link>
        <button onClick={signOut}>Cerrar sesión</button>
      </div>
    </div>
  );
}

export default DashboardPage;