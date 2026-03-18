import { createContext, useContext, useEffect, useState } from "react";
import {
  login as loginService,
  logout as logoutService,
  register as registerService,
  getCurrentUser as getCurrentUserService,
  updateUserProfile as updateUserProfileService,
} from "./authService";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function refreshUser() {
    setLoading(true);
    setError(null);
    try {
      const result = await getCurrentUserService();
      if (result.success) {
        setUser(result.data);
      } else {
        setUser(null);
      }
      return result;
    } catch (err) {
      setUser(null);
      setError(err?.message || "Erro ao buscar usuário.");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function signIn(email, senha) {
    setLoading(true);
    setError(null);

    const result = await loginService(email, senha);

    if (result.success) {
      await refreshUser();
      return { success: true, data: result.data };
    }

    setError(result.error);
    return result;
  }

  async function signOut() {
    setLoading(true);
    setError(null);

    const result = await logoutService();

    if (result.success) {
      setUser(null);
      setLoading(false);
      return result;
    }

    setError(result.error);
    setLoading(false);
    return result;
  }

  async function signUp(name, email, senha) {
    setLoading(true);
    setError(null);

    const result = await registerService(name, email, senha);

    if (result.success) {
      await refreshUser();
      return result;
    }

    setError(result.error);
    setLoading(false);
    return result;
  }

  async function updateProfile(changes) {
    setLoading(true);
    setError(null);

    const result = await updateUserProfileService(changes);

    if (result.success) {
      await refreshUser();
      return result;
    }

    setError(result.error);
    setLoading(false);
    return result;
  }

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
