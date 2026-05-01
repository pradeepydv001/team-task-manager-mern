import React from "react";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <AuthPage />;
}
