import { API_URL } from '../config/api';

// ✅ LOGIN (YA LO TENÍAS)
export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Credenciales incorrectas');
  }

  return response.json();
}

// 🔐 VALIDAR TOKEN (NUEVO)
export async function getAdminMe() {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    throw new Error('No token');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Token inválido');
  }

  return response.json();
}

// 🟧 FORGOT PASSWORD (ENVIAR CORREO)
export async function forgotPassword(email: string) {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Error al enviar correo');
  }

  return response.json();
}
