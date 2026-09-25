import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { App } from "./App.jsx";
import { AdminLogin } from "./admin/AdminLogin.jsx";
import { AdminDashboard } from "./admin/AdminDashboard.jsx";
import { AdminProductCreate } from "./admin/AdminProductCreate.jsx";
import { AdminProductEdit } from "./admin/AdminProductEdit.jsx";
import { ProtectedAdminRoute } from "./admin/ProtectedAdminRoute.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/products/new"
          element={
            <ProtectedAdminRoute>
              <AdminProductCreate />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/products/:id/edit"
          element={
            <ProtectedAdminRoute>
              <AdminProductEdit />
            </ProtectedAdminRoute>
          }
        />

        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
