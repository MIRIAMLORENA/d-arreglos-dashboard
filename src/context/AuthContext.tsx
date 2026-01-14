import { createContext, useContext, useEffect, useState } from 'react';
import { getAdminMe } from '../services/auth.service';

type AdminUser = {
  id: string;
  email: string;
  fullName?: string;
  role: 'ADMIN'; // 👈 CLAVE
};

type AuthContextType = {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Al cargar la app, validar token con backend
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('admin_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getAdminMe();
        setAdmin(data);
      } catch {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = (token: string, user: AdminUser) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    setAdmin(user);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 🧠 Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
