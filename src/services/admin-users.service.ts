import { API_URL } from '../config/api';

function getAuthHeaders() {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    throw new Error('No autorizado');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

// ===============================
// 🔵 LISTAR USUARIOS
// ===============================
export async function getAdminUsers() {
  const response = await fetch(`${API_URL}/admin-users`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener usuarios');
  }

  return response.json();
}

// ===============================
// 🔴 SUSPENDER USUARIO
// ===============================
export async function suspendUser(userId: string) {
  const response = await fetch(
    `${API_URL}/admin-users/${userId}/suspend`,
    {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error('Error al suspender usuario');
  }

  return response.json();
}

// ===============================
// 🟢 ACTIVAR USUARIO
// ===============================
export async function activateUser(userId: string) {
  const response = await fetch(
    `${API_URL}/admin-users/${userId}/activate`,
    {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error('Error al activar usuario');
  }

  return response.json();
}

// ===============================
// 🧹 LIMPIAR PENALIZACIONES DEL TÉCNICO (ADMIN)
// ===============================
export async function resetTechnicianPenalties(userId: string) {
  const response = await fetch(
    `${API_URL}/admin-users/${userId}/reset-penalties`,
    {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error('Error al limpiar penalizaciones del técnico');
  }

  return response.json();
}

// ==========================================================
// 📊 RESUMEN OPERATIVO DEL TÉCNICO (ADMIN)
// ==========================================================
export async function getTechnicianOperationalSummary(userId: string) {
  const response = await fetch(
    `${API_URL}/admin-users/${userId}/technician-summary`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error('Error al obtener resumen operativo del técnico');
  }

  return response.json();
}

export async function updateUserByAdmin(
  userId: string,
  data: { role: string },
) {
  const token = localStorage.getItem('admin_token');

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/users/${userId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw new Error('Error al actualizar usuario');
  }

  return res.json();
}
