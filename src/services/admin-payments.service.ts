import { API_URL } from '../config/api';

function getAuthHeaders() {
  const token = localStorage.getItem('admin_token');
  if (!token) throw new Error('No autorizado');

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export type PaymentStatus =
  | 'PENDING'
  | 'REQUIRES_ACTION'
  | 'PAID'
  | 'HELD'
  | 'RELEASED'
  | 'REFUNDED'
  | 'CANCELLED';

export type Payment = {
  id: string;
  amount: number;
  appFee: number;
  technicianAmount: number;
  status: PaymentStatus;
  createdAt: string;
  releasedAt?: string;

  adminTransferredAt?: string | null;
  adminTransferredBy?: string | null;


  user?: {
    id: string;
    fullName?: string;
    email?: string;
  };

  technician?: {
    id: string;
    userId?: string;
    user?: {
      fullName?: string;
      email?: string;
    };
  };

  serviceRequest?: {
    id: string;
    title?: string;
  };
};

export async function getAdminPayments(params?: {
  status?: PaymentStatus;
  technicianId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();

  if (params?.status) query.append('status', params.status);
  if (params?.technicianId) query.append('technicianId', params.technicianId);
  if (params?.userId) query.append('userId', params.userId);

  // 👇 PAGINACIÓN REAL (BACKEND)
  query.append('page', String(params?.page ?? 1));
  query.append('limit', String(params?.limit ?? 150));

  const res = await fetch(`${API_URL}/admin/payments?${query.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error('Error al obtener pagos');

  // 👉 response esperado:
  // { data, page, limit, total, totalPages, hasNextPage, hasPrevPage }
  return res.json();
}


export async function getAdminPaymentDetail(id: string) {
  const res = await fetch(`${API_URL}/admin/payments/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error('Error al obtener detalle del pago');
  return res.json();
}

export async function releasePayment(paymentId: string) {
  const token = localStorage.getItem('admin_token');
  if (!token) throw new Error('No autorizado');

  const res = await fetch(`${API_URL}/payments/${paymentId}/release`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Error al liberar el pago');
  }

  return res.json();
}
