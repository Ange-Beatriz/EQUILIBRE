// frontend/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiGet, apiPost } from "../services/api.service";

// Typage utilisateur (ce que tu utilises dans Dashboard / Profile)
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  created_at?: string;
}

// Réponse de l'API pour /auth/login et /auth/register
interface AuthResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<void>; // adapte si tu veux first_name / last_name
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Au premier chargement : si on a un token, on récupère l'utilisateur
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Récupération du profil à partir du token
  const fetchUser = async () => {
    try {
      // endpoint côté back : GET /api/users/me
      const data = await apiGet<User>("/api/users/me");
      setUser(data);
    } catch (error) {
      console.error("Erreur récupération utilisateur:", error);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Inscription
  const register = async (email: string, password: string, name: string) => {
    try {
      // adapte le body suivant ce que ton backend attend
      const data = await apiPost<AuthResponse>("/auth/register", {
        email,
        password,
        name,
      });
      localStorage.setItem("token", data.token);
      setUser(data.user);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Erreur lors de l'inscription"
      );
    }
  };

  // ✅ Connexion
  const login = async (email: string, password: string) => {
    try {
      const data = await apiPost<AuthResponse>("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      setUser(data.user);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Erreur lors de la connexion"
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};
