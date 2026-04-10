import React from "react";
import { useAuth } from "../auth/AuthContext";

function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Dashboard AgroTrace</h1>
      <p><strong>Usuario:</strong> {user?.fullName}</p>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Tenant:</strong> {user?.tenantCode}</p>

      <button onClick={signOut}>Cerrar sesión</button>
    </div>
  );
}

export default DashboardPage;