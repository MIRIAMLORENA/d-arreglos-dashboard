import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

type ServiceRow = {
  id: string;
  status: string;
  estimatedPrice?: number; // 👈 ESTE ES EL BUENO
  createdAt: string;
  isExpress?: boolean;
  user: {
    fullName?: string;
    email: string;
  };
  technician?: {
    user?: {
      fullName?: string;
    };
  };
  category?: {
    name: string;
  };
};

const serviceStatusStyles: Record<
  string,
  { label: string; background: string; color: string }
> = {
  COMPLETED: {
    label: 'Finalizado',
    background: '#dcfce7',
    color: '#166534',
  },
  CANCELLED: {
    label: 'Cancelado',
    background: '#fee2e2',
    color: '#991b1b',
  },
  IN_PROGRESS: {
    label: 'En curso',
    background: '#dbeafe',
    color: '#1e40af',
  },
  GUARANTEE_ACTIVE: {
    label: 'Garantía activa',
    background: '#ffedd5',
    color: '#9a3412',
  },
  GUARANTEE_IN_PROGRESS: {
    label: 'Garantía en proceso',
    background: '#ede9fe',
    color: '#5b21b6',
  },
  GUARANTEE_RESOLVED: {
    label: 'Garantía resuelta',
    background: '#bbf7d0',
    color: '#065f46',
  },
    REJECTED_BY_TECHNICIAN: {
    label: 'Rechazado por técnico',
    background: '#fee2e2',
    color: '#7f1d1d',
  },
  QUOTE_REJECTED: {
    label: 'Cotización rechazada',
    background: '#fde68a',
    color: '#92400e',
  },
  MAINTENANCE_SCHEDULED: {
    label: 'Mantenimiento programado',
    background: '#e0e7ff',
    color: '#3730a3',
  },

};

const STATUS_GROUPS: Record<string, string[]> = {
  IN_PROGRESS: [
    'PENDING',
    'ASSIGNED',
    'TECHNICIAN_ASSIGNED',
    'TECHNICIAN_ON_THE_WAY',
    'TECHNICIAN_ARRIVED',
    'IN_PROGRESS',
  ],

  

  GUARANTEE_CLAIMED: [
    'GUARANTEE_CLAIMED',
  ],

  GUARANTEE_IN_PROGRESS: [
    'GUARANTEE_IN_PROGRESS',
  ],

  

  CANCELLED: [
    'CANCELLED',
  ],

    REJECTED_BY_TECHNICIAN: [
    'REJECTED_BY_TECHNICIAN',
  ],

  QUOTE_REJECTED: [
    'QUOTE_REJECTED',
  ],

  MAINTENANCE_SCHEDULED: [
    'MAINTENANCE_SCHEDULED',
  ],

};



export default function Services() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  // 🅱️ PAGINACIÓN
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 🅲 FILTROS
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchId, setSearchId] = useState('');


  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem('admin_token');

        const params = new URLSearchParams();
params.set('page', String(page));
params.set('limit', '150');

// ✅ typeFilter -> express true/false
if (typeFilter === 'EXPRESS') params.set('express', 'true');
if (typeFilter === 'NORMAL') params.set('express', 'false');

// ✅ searchId -> search (el backend lo usa como "search")
if (searchId.trim()) params.set('search', searchId.trim());

// 🔥 CASOS ESPECIALES → usar status directo
if (statusFilter === 'GUARANTEE_ACTIVE' || statusFilter === 'COMPLETED') {
  params.set('status', statusFilter);
}

// ✅ status agrupado → statusIn
else if (statusFilter && STATUS_GROUPS[statusFilter]) {
  params.set(
    'statusIn',
    STATUS_GROUPS[statusFilter].join(',')
  );
}



const response = await fetch(
  `${API_URL}/service-requests?${params.toString()}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);



        const data = await response.json();
        
        setServices(data.items || []);
        const totalItems = data.totalItems || 0;
setTotalPages(Math.max(1, Math.ceil(totalItems / 150)));

             


      } catch (error) {
        console.error('Error cargando servicios', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [page, statusFilter, typeFilter, searchId]);


  if (loading) return <p>Cargando servicios...</p>;

  return (
    <div style={{ background: '#fff', padding: 24 }}>
      <h2>Gestión de Servicios</h2>

      {/* 🅲 FILTROS */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="">Todos los estados</option>
<option value="IN_PROGRESS">En progreso</option>

<option value="GUARANTEE_ACTIVE">Garantía activa</option>
<option value="GUARANTEE_CLAIMED">Garantía reclamada</option>
<option value="GUARANTEE_IN_PROGRESS">Garantía en proceso</option>

<option value="COMPLETED">Completados</option>
<option value="CANCELLED">Cancelados</option>

<option value="REJECTED_BY_TECHNICIAN">
  Rechazado por técnico
</option>

<option value="QUOTE_REJECTED">
  Cotización rechazada
</option>

<option value="MAINTENANCE_SCHEDULED">
  Mantenimiento programado
</option>


        </select>

        <select
          value={typeFilter}
          onChange={(e) => {
            setPage(1);
            setTypeFilter(e.target.value);
          }}
        >
          <option value="">Todos los tipos</option>
          <option value="NORMAL">NORMAL</option>
          <option value="EXPRESS">EXPRESS</option>
        </select>
        <input
  type="text"
  placeholder="Buscar por ID de servicio"
  value={searchId}
  onChange={(e) => {
    setPage(1);
    setSearchId(e.target.value);
  }}
  style={{
    padding: '6px 10px',
    border: '1px solid #d1d5db',
    borderRadius: 6,
    minWidth: 260,
  }}
/>

      </div>

      <table style={table}>
        <thead>
  <tr>
    <th style={th}>Usuario</th>
    <th style={th}>Técnico</th>
    <th style={th}>Categoría</th>
    <th style={{ ...th, textAlign: 'center' }}>Estado</th>
    <th style={{ ...th, textAlign: 'center' }}>Precio</th>
    <th style={{ ...th, textAlign: 'center' }}>Fecha</th>
    <th style={th}></th>
  </tr>
</thead>




        <tbody>
  {services.length === 0 ? (
    <tr>
      <td style={td} colSpan={7}>
        No se encontraron servicios con esos filtros.
      </td>
    </tr>
  ) : (
    services.map((srv) => (
      <tr key={srv.id}>
        <td style={td}>{srv.user.fullName || srv.user.email}</td>
        <td style={td}>{srv.technician?.user?.fullName || '—'}</td>
        <td style={td}>{srv.category?.name || '—'}</td>

        <td style={tdCenter}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              background:
                serviceStatusStyles[srv.status]?.background || '#e5e7eb',
              color:
                serviceStatusStyles[srv.status]?.color || '#374151',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
          >
            {serviceStatusStyles[srv.status]?.label || srv.status}
          </span>
        </td>

        <td style={tdCenter}>
          {srv.estimatedPrice
            ? `$${srv.estimatedPrice.toLocaleString('es-MX')}`
            : '—'}
        </td>

        <td style={tdCenter}>
          {new Date(srv.createdAt).toLocaleDateString()}
        </td>

        <td style={tdCenter}>
          <button
            onClick={() => navigate(`/dashboard/services/${srv.id}`)}
          >
            Ver detalle
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

      </table>

      {/* 🅱️ PAGINACIÓN */}
      <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
        <button
  disabled={page === 1}

  onClick={() => setPage(page - 1)}
>

          ◀ Anterior
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button
  disabled={page === totalPages}
  onClick={() => setPage(page + 1)}
>

          Siguiente ▶
        </button>
      </div>
    </div>
  );
}

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 8px',
  fontSize: 13,
  color: '#374151',
};

const td: React.CSSProperties = {
  padding: '10px 8px',
  fontSize: 14,
  verticalAlign: 'middle',
};

const tdCenter: React.CSSProperties = {
  ...td,
  textAlign: 'center',
};
