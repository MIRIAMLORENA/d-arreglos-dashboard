// ⚠️ TEMPORAL (BETA)
// Este detalle fue deshabilitado.
// Toda la información del técnico vive en UserDetail.
// Se retomará post-beta si se requiere vista separada.

import { useParams, Navigate } from 'react-router-dom';

export default function TechnicianDetail() {
  const { id } = useParams();

  // Redirigimos siempre al detalle del usuario
  return <Navigate to={`/dashboard/users/${id}`} replace />;
}
