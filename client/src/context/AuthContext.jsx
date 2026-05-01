import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ttm_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("ttm_token");
    if (!token) return;
    api("/auth/me")
      .then((data) => {
        setUser(data.user);
        localStorage.setItem("ttm_user", JSON.stringify(data.user));
      })
      .catch(() => logout());
  }, []);

  async function authenticate(mode, payload) {
    setLoading(true);
    try {
      const data = await api(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      localStorage.setItem("ttm_token", data.token);
      localStorage.setItem("ttm_user", JSON.stringify(data.user));
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("ttm_token");
    localStorage.removeItem("ttm_user");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login: (payload) => authenticate("login", payload), signup: (payload) => authenticate("signup", payload), logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
