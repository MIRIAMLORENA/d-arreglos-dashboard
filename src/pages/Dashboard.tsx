import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';

import { getAdminPayments } from '../services/admin-payments.service';
import type { Payment } from '../services/admin-payments.service';

import { getAdminUsers } from '../services/admin-users.service';

export default function Dashboard() {
  // =========================
  // STATES BASE
  // =========================
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [paymentMetrics, setPaymentMetrics] = useState<{
    totalRevenue: number;
    totalCommission: number;
    totalPaidToTechnicians: number;
    totalReleasedPayments: number;
  } | null>(null);


  // =========================
  // LOAD DASHBOARD DATA
  // =========================
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem('admin_token');
        if (!token) return;

                // 1️⃣ MÉTRICAS DE PAGOS (Backend) ✅
        const metricsRes = await fetch(`${API_URL}/admin/payments/metrics`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const metricsData = await metricsRes.json();
        setPaymentMetrics(metricsData);

        // (opcional por ahora) seguimos trayendo pagos SOLO para "pagos pendientes"
        const paymentsRes = await getAdminPayments({ page: 1, limit: 1000 });
        setPayments(paymentsRes.data || []);


        // 2️⃣ USUARIOS
        const usersRes = await getAdminUsers();
        setUsers(usersRes || []);

        // 3️⃣ TÉCNICOS (mismo endpoint que /technicians)
        const techRes = await fetch(`${API_URL}/admin/technicians`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const techData = await techRes.json();
        setTechnicians(Array.isArray(techData) ? techData : []);

        // 4️⃣ SERVICIOS
        const srvRes = await fetch(
          `${API_URL}/admin/requests?page=1&limit=1000`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const srvData = await srvRes.json();
        setServices(srvData.items || []);

      } catch (error) {
        console.error('Error cargando dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // =========================
  // MÉTRICAS (FRONTEND)
  // =========================

  const COMPLETED_SERVICE_STATUSES = [
  // 🛠️ Trabajo ya realizado
  'WORK_DONE',
  'EVIDENCE_UPLOADED',
  'WAITING_CLIENT_FINAL_CONFIRMATION',
  'COMPLETED',

  // 🛡️ Post-servicio / garantía
  'GUARANTEE_ACTIVE',
  'GUARANTEE_RESOLVED',
];


  const totalRevenue = paymentMetrics?.totalRevenue ?? 0;
  const totalCommission = paymentMetrics?.totalCommission ?? 0;



  // 🧾 Pagos pendientes (NO transferidos por admin)
const pendingPayments = payments.filter(
  p => !p.adminTransferredAt
).length;


  // 👥 Usuarios totales
  const totalUsers = users.length;

  // 🧑‍🔧 Técnicos activos
  const activeTechnicians = technicians.filter(
    t => t.user?.isActive
  ).length;

  // ⚡ Servicios EXPRESS
  const expressServices = services.filter(
    s => s.isExpress
  ).length;

  // 🧾 Servicios NORMALES (NO express, todos los estados)
const normalServices = services.filter(
  s => !s.isExpress
).length;

  // 🛠️ Servicios completados
  const completedServices = services.filter(
  s => COMPLETED_SERVICE_STATUSES.includes(s.status)
).length;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);

  // =========================
  // UI
  // =========================
    if (loading || !paymentMetrics) {
    return <p>Cargando métricas...</p>;
  }


  return (
  <div>
    <h2>Dashboard (Beta)</h2>

    <div style={cardsGrid}>
      <div style={card}>
        <span style={icon}>💰</span>
        <p style={label}>Ingresos totales</p>
        <strong style={value}>{formatCurrency(totalRevenue)}</strong>
      </div>

      <div style={card}>
        <span style={icon}>💸</span>
        <p style={label}>Comisión DAM (15%)</p>
        <strong style={value}>{formatCurrency(totalCommission)}</strong>
      </div>

      <div style={card}>
        <span style={icon}>🧾</span>
        <p style={label}>Pagos pendientes</p>
        <strong style={value}>{pendingPayments}</strong>
      </div>

      <div style={card}>
        <span style={icon}>👥</span>
        <p style={label}>Usuarios totales</p>
        <strong style={value}>{totalUsers}</strong>
      </div>

      <div style={card}>
        <span style={icon}>🧑‍🔧</span>
        <p style={label}>Técnicos activos</p>
        <strong style={value}>{activeTechnicians}</strong>
      </div>

      <div style={card}>
        <span style={icon}>⚡</span>
        <p style={label}>Solicitudes EXPRESS</p>
        <strong style={value}>{expressServices}</strong>
      </div>

      <div style={card}>
  <span style={icon}>📄</span>
  <p style={label}>Solicitudes NORMALES</p>
  <strong style={value}>{normalServices}</strong>
</div>

      <div style={card}>
        <span style={icon}>🛠️</span>
        <p style={label}>Servicios completados</p>
        <strong style={value}>{completedServices}</strong>
      </div>
    </div>
  </div>
);
}

const cardsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 16,
  marginTop: 20,
};

const card: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 12,
  padding: 20,
  boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
  textAlign: 'center',
};

const icon: React.CSSProperties = {
  fontSize: 28,
};

const label: React.CSSProperties = {
  margin: '10px 0 6px',
  color: '#555',
  fontSize: 14,
};

const value: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 'bold',
};
