import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, admin, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40 }}>Validando sesión...</div>;
  }

  // ❌ No hay sesión
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // ❌ Hay sesión pero NO es ADMIN
  if (!admin || admin.role !== 'ADMIN') {
  return <Navigate to="/access-denied" replace />;
}


  // ✅ ADMIN válido
  return <>{children}</>;
}
