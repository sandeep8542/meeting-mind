import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // ✅ WAIT for auth to load
  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        Loading...
      </div>
    );
  }

  // ❌ No user → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allow
  return children;
}