import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PublicTracePage from "./pages/PublicTracePage";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import ProductoresPage from "./pages/ProductoresPage";
import FincasPage from "./pages/FincasPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import LotesPage from "./pages/LotesPage";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/productores"
          element={
            <ProtectedRoute>
              <ProductoresPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fincas"
          element={
            <ProtectedRoute>
              <FincasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lotes"
          element={
            <ProtectedRoute>
              <LotesPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<PublicTracePage />} />
        <Route path="/:codigoQr" element={<PublicTracePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;