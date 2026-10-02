/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  }, []);

  // Listen for global auth expired events emitted by apiFetch
  useEffect(() => {
    const handleAuthExpired = () => {
      clearAuth();
    };

    window.addEventListener("auth:expired", handleAuthExpired);
    return () => {
      window.removeEventListener("auth:expired", handleAuthExpired);
    };
  }, [clearAuth]);

  // Load user details if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiFetch("/api/auth/me");
        setUser(data.user);
      } catch (err) {
        console.error("Auth check failed:", err.message);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token, clearAuth]);

  const login = async (email, password) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async ({ name, email, password, phone, address }) => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone, address }),
    });

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      clearAuth();
    }
  };

  const updateProfile = async (profileData) => {
    const data = await apiFetch("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });

    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
