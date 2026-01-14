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
// 🔵 LISTAR CATEGORÍAS
// ===============================
export async function getAdminCategories() {
  const response = await fetch(`${API_URL}/admin/categories`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener categorías');
  }

  return response.json();
}

// ===============================
// 🟢 CREAR CATEGORÍA
// ===============================
export async function createCategory(data: {
  name: string;
  imageUrl?: string;
  description?: string;
}) {

  const response = await fetch(`${API_URL}/admin/categories`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al crear categoría');
  }

  return response.json();
}

// ===============================
// 🟡 ACTUALIZAR CATEGORÍA
// ===============================
export async function updateCategory(
  id: string,
  data: {
    name?: string;
    imageUrl?: string;
    description?: string;
  }
) {

  const response = await fetch(
    `${API_URL}/admin/categories/${id}`,
    {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error('Error al actualizar categoría');
  }

  return response.json();
}

// ===============================
// 🟢 ACTIVAR CATEGORÍA
// ===============================
export async function activateCategory(id: string) {
  const response = await fetch(
    `${API_URL}/admin/categories/${id}/activate`,
    {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error('Error al activar categoría');
  }

  return response.json();
}

// ===============================
// 🔴 DESACTIVAR CATEGORÍA
// ===============================
export async function deactivateCategory(id: string) {
  const response = await fetch(
    `${API_URL}/admin/categories/${id}/deactivate`,
    {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error('Error al desactivar categoría');
  }

  return response.json();
}

// ===============================
// ❌ ELIMINAR CATEGORÍA
// ===============================
export async function deleteCategory(id: string) {
  const response = await fetch(
    `${API_URL}/admin/categories/${id}`,
    {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error('Error al eliminar categoría');
  }

  return response.json();
}
