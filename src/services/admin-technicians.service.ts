import { API_URL } from '../config/api';

function getAuthHeaders() {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    throw new Error('No autorizado');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// ⭐ TOGGLE DESTACADO
export async function toggleFeaturedTechnician(
  technicianId: string,
  isFeatured: boolean
) {
  const response = await fetch(
    `${API_URL}/admin-technicians/${technicianId}/featured`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isFeatured }),
    }
  );

  if (!response.ok) {
    throw new Error('Error al actualizar destacado');
  }

  return response.json();
}
