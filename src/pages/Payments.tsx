import { useEffect, useMemo, useState } from 'react';
import { getAdminPayments} from '../services/admin-payments.service';
import type { Payment } from '../services/admin-payments.service';
import { API_URL } from '../config/api';

type Tab = 'LISTADO' | 'POR_TECNICO';

type DateFilter = 'ALL' | 'TODAY' | 'LAST_7' | 'MONTH' | 'RANGE';

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(value);
}



export default function Payments() {
  const [tab, setTab] = useState<Tab>('LISTADO');

  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  // 📄 Paginación (Listado)
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

  const [paymentMetrics, setPaymentMetrics] = useState<{
    totalRevenue: number;
    totalCommission: number;
    totalPaidToTechnicians: number;
    totalReleasedPayments: number;
  } | null>(null);

  const [technicianId, setTechnicianId] = useState<string>('');

  // ✅ Modal Detalle (Listado)
const [detailOpen, setDetailOpen] = useState(false);
const [detailLoading, setDetailLoading] = useState(false);
const [detailError, setDetailError] = useState<string | null>(null);
const [detailData, setDetailData] = useState<any>(null);


  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  


  useEffect(() => {
  loadPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [tab, technicianId, page]);


  async function loadPayments() {
    setLoading(true);
    try {
            // 📊 MÉTRICAS GENERALES (backend)
      const token = localStorage.getItem('admin_token');

      if (token && tab === 'LISTADO') {
        const metricsRes = await fetch(
          `${API_URL}/admin/payments/metrics`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const metricsData = await metricsRes.json();
        setPaymentMetrics(metricsData);
      }

      if (tab === 'LISTADO') {
  const res = await getAdminPayments({
    page,
    limit: 150,
  });

  setPayments(res.data ?? []);
  setTotalPages(res.totalPages ?? 1);
}
 
      else {
        if (!technicianId) {
          setPayments([]);
        } else {
          const res = await getAdminPayments({
  technicianId,
  page,
  limit: 150,
});

setPayments(res.data ?? []);
setTotalPages(res.totalPages ?? 1);

        }
      }
    } catch (e) {
      console.error(e);
      alert('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  }

  async function openPaymentDetail(paymentId: string) {
  setDetailOpen(true);
  setDetailLoading(true);
  setDetailError(null);
  setDetailData(null);

  try {
    const token = localStorage.getItem('admin_token');

    const res = await fetch(`${API_URL}/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setDetailError(data?.message || 'No se pudo cargar el detalle');
      return;
    }

    setDetailData(data);
  } catch (e) {
    setDetailError('Error al cargar detalle del pago');
  } finally {
    setDetailLoading(false);
  }
}


  const filteredPayments = useMemo(() => {
  if (tab !== 'LISTADO') return payments;

  const now = new Date();

  return payments.filter((p) => {
    const created = new Date(p.createdAt);

    if (dateFilter === 'TODAY') return isSameDay(created, now);

    if (dateFilter === 'LAST_7') {
      const d = new Date();
      d.setDate(now.getDate() - 7);
      return created >= d;
    }

    if (dateFilter === 'MONTH') {
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }

    if (dateFilter === 'RANGE' && fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59);
      return created >= from && created <= to;
    }

    return true; // ALL
  });
}, [payments, tab, dateFilter, fromDate, toDate]);

const totals = useMemo(() => {
  if (tab === 'LISTADO' && paymentMetrics) {
    return {
      totalAmount: paymentMetrics.totalRevenue,
      totalAppFee: paymentMetrics.totalCommission,
      totalTechnician: paymentMetrics.totalPaidToTechnicians,
    };
  }

  // 🔧 Por técnico (se queda igual, frontend)
  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);
  const totalAppFee = payments.reduce((s, p) => s + p.appFee, 0);
  const totalTechnician = payments.reduce((s, p) => s + p.technicianAmount, 0);

  return { totalAmount, totalAppFee, totalTechnician };
}, [filteredPayments, payments, tab, paymentMetrics]);



  return (
    <div>
      <h2>Gestión de Pagos</h2>

      <p style={{ marginBottom: 12, color: '#374151' }}>
  <strong>Modo Beta:</strong> Stripe cobra al cliente y el dinero se recibe en la cuenta de la plataforma.
  Las transferencias a técnicos se realizan <strong>manualmente</strong> y este panel sirve
  únicamente como control interno del administrador.
</p>


      {/* Resumen general solo en listado */}
      {tab === 'LISTADO' && paymentMetrics && (
  <div style={styles.totals}>

          <p>💰 Total cobrado a usuarios: {formatCurrency(totals.totalAmount)}</p>
          <p>🧾 Ingresos DAM (15%): {formatCurrency(totals.totalAppFee)}</p>
          <h3>🤝 Total pagado a técnicos: {formatCurrency(totals.totalTechnician)}</h3>
        </div>
      )}

      {/* TABS */}
      <div style={styles.tabs}>
        <button
          style={tab === 'LISTADO' ? styles.tabActive : styles.tab}
          onClick={() => {
  setTab('LISTADO');
  setPage(1);
}}

        >
          Pagos (Listado)
        </button>
        <button
          style={tab === 'POR_TECNICO' ? styles.tabActive : styles.tab}
          onClick={() => {
  setTab('POR_TECNICO');
  setPage(1);
}}

        >
          Pago por Técnico
        </button>
      </div>

      {/* FILTROS DE FECHA – SOLO LISTADO */}
{tab === 'LISTADO' && (
  <div
    style={{
      display: 'flex',
      gap: 8,
      marginBottom: 12,
      flexWrap: 'wrap',
      alignItems: 'center',
    }}
  >
    <button
  style={dateFilter === 'ALL' ? styles.filterButtonActive : styles.filterButton}
  onClick={() => setDateFilter('ALL')}
>
  Todo
</button>

<button
  style={dateFilter === 'TODAY' ? styles.filterButtonActive : styles.filterButton}
  onClick={() => setDateFilter('TODAY')}
>
  Hoy
</button>

<button
  style={dateFilter === 'LAST_7' ? styles.filterButtonActive : styles.filterButton}
  onClick={() => setDateFilter('LAST_7')}
>
  Últimos 7 días
</button>

<button
  style={dateFilter === 'MONTH' ? styles.filterButtonActive : styles.filterButton}
  onClick={() => setDateFilter('MONTH')}
>
  Este mes
</button>

<button
  style={dateFilter === 'RANGE' ? styles.filterButtonActive : styles.filterButton}
  onClick={() => setDateFilter('RANGE')}
>
  Rango
</button>


    {dateFilter === 'RANGE' && (
      <>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </>
    )}
  </div>
)}

{loading && <p>Cargando...</p>}

{!loading && tab === 'LISTADO' && (
  <>
    <Listado pagos={filteredPayments} onView={openPaymentDetail} />

    <div
      style={{
        display: 'flex',
        gap: 12,
        marginTop: 16,
        alignItems: 'center',
      }}
    >
      <button
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
      >
        ⬅ Anterior
      </button>

      <span>
        Página {page} de {totalPages}
      </span>

      <button
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      >
        Siguiente ➡
      </button>
    </div>
  </>
)}

{!loading && tab === 'POR_TECNICO' && (
  <PagoPorTecnico
    technicianId={technicianId}
    setTechnicianId={setTechnicianId}
    pagos={payments}
    totals={totals}
    reload={loadPayments}
  />
)}


      {detailOpen && (
  <div style={{
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 50,
  }}>
    <div style={{
      width: '100%',
      maxWidth: 720,
      background: '#fff',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Detalle de pago</h3>
        <button onClick={() => { setDetailOpen(false); setDetailData(null); }}>
          Cerrar
        </button>
      </div>

      {detailLoading ? (
        <p style={{ marginTop: 12 }}>Cargando detalle…</p>
      ) : detailError ? (
        <p style={{ marginTop: 12, color: '#b91c1c' }}>{detailError}</p>
      ) : detailData ? (
        <>
          <div style={{ marginTop: 12, background: '#f3f4f6', padding: 12, borderRadius: 8 }}>
            <p><strong>Técnico:</strong> {detailData?.payment?.technician?.user?.fullName ?? '-'}</p>
            <p><strong>Email:</strong> {detailData?.payment?.technician?.user?.email ?? '-'}</p>
          </div>

          <div style={{ marginTop: 12, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <h4 style={{ marginTop: 0 }}>Datos bancarios</h4>
            <p><strong>Banco:</strong> {detailData?.technicianBankData?.bankName ?? '-'}</p>
            <p><strong>Titular:</strong> {detailData?.technicianBankData?.accountHolder ?? '-'}</p>
            <p><strong>CLABE:</strong> {detailData?.technicianBankData?.clabe ?? '-'}</p>
            <p><strong>RFC:</strong> {detailData?.technicianBankData?.rfc ?? '-'}</p>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <p><strong>Pagado:</strong> {formatCurrency(detailData?.payment?.amount ?? 0)}</p>
            <p><strong>Comisión:</strong> {formatCurrency(detailData?.payment?.appFee ?? 0)}</p>
            <p><strong>Neto Técnico:</strong> {formatCurrency(detailData?.payment?.technicianAmount ?? 0)}</p>
          </div>

          <div style={{ marginTop: 16 }}>
            {!detailData?.payment?.adminTransferredAt ? (
              <button
                onClick={async () => {
                  if (!confirm('¿Confirmas que ya realizaste la transferencia manual a este técnico?')) return;

                  const token = localStorage.getItem('admin_token');

                  await fetch(`${API_URL}/payments/${detailData.payment.id}/mark-transferred`, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  });

                  alert('Pago marcado como TRANSFERIDO');
                  setDetailOpen(false);
                  setDetailData(null);
                  loadPayments();
                }}
              >
                Marcar como transferido
              </button>
            ) : (
              <button disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                Transferido
              </button>
            )}
          </div>
        </>
      ) : (
        <p style={{ marginTop: 12 }}>Sin datos.</p>
      )}
    </div>
  </div>
)}

    </div>
  );
}

// ===============================
// LISTADO GENERAL
// ===============================
function Listado({
  pagos,
  onView,
}: {
  pagos: Payment[];
  onView: (paymentId: string) => void;
}) {

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Servicio</th>
          <th style={styles.th}>Usuario</th>
          <th style={{ ...styles.th, ...styles.tdRight }}>Pagado</th>
          <th style={{ ...styles.th, ...styles.tdRight }}>Comisión</th>
          <th style={{ ...styles.th, ...styles.tdRight }}>Neto Técnico</th>
          <th style={styles.th}>Estado</th>
          <th style={styles.th}>Fecha</th>
          <th style={styles.th}>Acción</th>

        </tr>
      </thead>
      <tbody>
        {pagos.map((p) => (
          <tr key={p.id}>
            <td style={styles.td}>{p.serviceRequest?.id}</td>
            
            <td style={styles.td}>{p.user?.fullName ?? '-'}</td>

            <td style={styles.tdRight}>{formatCurrency(p.amount)}</td>
            <td style={styles.tdRight}>{formatCurrency(p.appFee)}</td>
            <td style={styles.tdRight}>{formatCurrency(p.technicianAmount)}</td>

            <td style={styles.td}>
  {p.adminTransferredAt
    ? '🟢 Transferido (admin)'
    : '🟡 Cliente pagó · Pendiente transferencia'}
</td>




            <td style={styles.td}>{new Date(p.createdAt).toLocaleDateString()}</td>

            <td style={styles.td}>
  <button onClick={() => onView(p.id)}>Ver / Transferir</button>
</td>

          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ===============================
// PAGO POR TÉCNICO
// ===============================
function PagoPorTecnico({
  technicianId,
  setTechnicianId,
  pagos,
  totals,
  reload,
}: {
  technicianId: string;
  setTechnicianId: (v: string) => void;
  pagos: Payment[];
  totals: {
    totalAmount: number;
    totalAppFee: number;
    totalTechnician: number;
  };
  reload: () => void;
}) {
  return (
    <div>
      <div style={styles.filter}>
        <label>ID del Técnico</label>
        <input
          value={technicianId}
          onChange={(e) => setTechnicianId(e.target.value)}
          placeholder="Pega el technicianId"
        />
      </div>

      <p style={{ marginBottom: 12, fontSize: 13, color: '#6b7280' }}>
  ℹ️ Este panel no realiza pagos automáticos.  
  Sirve solo como control interno después de realizar transferencias manuales.
</p>


      {!technicianId ? (
        <p>Selecciona un técnico para ver pagos.</p>
      ) : pagos.length === 0 ? (
        <p style={{ marginTop: 12 }}>
          ✅ No hay pagos pendientes para este técnico en este momento.
        </p>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Servicio</th>
                <th style={styles.th}>Usuario</th>
                <th style={styles.th}>Técnico</th>
                <th style={{ ...styles.th, ...styles.tdRight }}>Pagado</th>
                <th style={{ ...styles.th, ...styles.tdRight }}>Comisión</th>
                <th style={{ ...styles.th, ...styles.tdRight }}>Neto</th>
                <th style={styles.th}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td style={styles.td}>{p.serviceRequest?.id}</td>
                  <td style={styles.td}>{p.user?.fullName ?? '-'}</td>
                  <td style={styles.td}>{p.technician?.user?.fullName ?? '-'}</td>

                  <td style={styles.tdRight}>{formatCurrency(p.amount)}</td>
                  <td style={styles.tdRight}>{formatCurrency(p.appFee)}</td>
                  <td style={styles.tdRight}>{formatCurrency(p.technicianAmount)}</td>

                  <td style={styles.td}>
                    {!p.adminTransferredAt ? (
  <button
    onClick={async () => {
      if (!confirm('¿Confirmas que ya realizaste la transferencia manual a este técnico?')) return;

      const token = localStorage.getItem('admin_token');

      await fetch(
        `${API_URL}/payments/${p.id}/mark-transferred`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      alert('Pago marcado como TRANSFERIDO');
      reload();
    }}
  >
    Marcar como transferido
  </button>
) : (
  <button disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
    Transferido
  </button>
)}


                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.totals}>
            <p>Total pagado por usuarios: {formatCurrency(totals.totalAmount)}</p>
            <p>Total comisión app: {formatCurrency(totals.totalAppFee)}</p>
            <h3>TOTAL PENDIENTE DE TRANSFERIR AL TÉCNICO: {formatCurrency(totals.totalTechnician)}</h3>
          </div>
        </>
      )}
    </div>
  );
}

// ===============================
// ESTILOS
// ===============================
const styles: Record<string, React.CSSProperties> = {
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    padding: '8px 12px',
    background: '#e5e7eb',
    border: 'none',
    cursor: 'pointer',
  },
  tabActive: {
    padding: '8px 12px',
    background: '#111827',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },

  filter: {
    marginBottom: 12,
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 12,
  },

  th: {
    padding: '10px 12px',
    borderBottom: '1px solid #e5e7eb',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: 14,
    whiteSpace: 'nowrap',
  },

  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: 14,
    verticalAlign: 'middle',
  },

  tdRight: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: 14,
    textAlign: 'right',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },

  totals: {
    marginTop: 16,
    padding: 16,
    background: '#f3f4f6',
    borderRadius: 8,
  },

  filterButton: {
  padding: '6px 12px',
  border: '1px solid #d1d5db',
  background: '#f9fafb',
  cursor: 'pointer',
  borderRadius: 6,
  fontSize: 13,
},

filterButtonActive: {
  padding: '6px 12px',
  border: '1px solid #111827',
  background: '#111827',
  color: '#ffffff',
  cursor: 'pointer',
  borderRadius: 6,
  fontSize: 13,
},

};
