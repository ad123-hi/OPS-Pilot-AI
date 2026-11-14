import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, type AuthResponse, type User } from "./api";

interface Credentials { email: string; password: string; organization_id: number }
interface Registration { organization_name: string; full_name: string; email: string; password: string }
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  register: (details: Registration) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function saveSession(data: AuthResponse, setUser: (user: User | null) => void) {
  localStorage.setItem("opspilot_access_token", data.access_token);
  localStorage.setItem("opspilot_user", JSON.stringify(data.user));
  setUser(data.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("opspilot_access_token");
    if (!token) { setLoading(false); return; }
    api.get<User>("/auth/me")
      .then(({ data }) => { setUser(data); localStorage.setItem("opspilot_user", JSON.stringify(data)); })
      .catch(() => { localStorage.removeItem("opspilot_access_token"); localStorage.removeItem("opspilot_user"); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials);
    saveSession(data, setUser);
  }, []);

  const register = useCallback(async (details: Registration) => {
    const { data } = await api.post<AuthResponse>("/auth/register", details);
    saveSession(data, setUser);
  }, []);

  const logout = useCallback(async () => {
    try { if (localStorage.getItem("opspilot_access_token")) await api.post("/auth/logout"); }
    catch { /* Clear the local session even if the server is unreachable. */ }
    finally {
      localStorage.removeItem("opspilot_access_token");
      localStorage.removeItem("opspilot_user");
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
