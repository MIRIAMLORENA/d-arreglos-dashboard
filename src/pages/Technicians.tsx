import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

type TechnicianRow = {
  id: string;
  userId: string   // ✅ AGREGA ESTA LÍNEA
  isVerified: boolean; // 👈 ESTA ES LA LÍNEA QUE FALTABA
  user: {
    fullName?: string;
    email: string;
    city?: string;
    isActive: boolean;
    createdAt: string;
  };
  technicianProfile?: {
    isVerified: boolean;
  };
};

export default function Technicians() {
  const [technicians, setTechnicians] = useState<TechnicianRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('TODAS');
  const [verifiedFilter, setVerifiedFilter] = useState('TODOS'); // TODOS | SI | NO
  const [activeFilter, setActiveFilter] = useState('TODOS'); // TODOS | ACTIVO | SUSPENDIDO

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 150;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const token = localStorage.getItem('admin_token');

        const response = await fetch(`${API_URL}/admin/technicians`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log('RESPUESTA /admin/technicians 👉', data);
        setTechnicians(data);
      } catch (error) {
        console.error('Error cargando técnicos', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  // 🔁 Resetear paginación cuando cambian filtros o búsqueda
useEffect(() => {
  setPage(1);
}, [search, cityFilter, verifiedFilter, activeFilter]);


  if (loading) return <p>Cargando técnicos...</p>;

  const filteredTechnicians = technicians.filter((tech) => {
  // 🔍 Buscador
  const text = `${tech.user.fullName ?? ''} ${tech.user.email}`.toLowerCase();
  const matchesSearch = text.includes(search.toLowerCase());

  // 🏙️ Ciudad
  const matchesCity =
    cityFilter === 'TODAS' || tech.user.city === cityFilter;

  // ✅ Verificado
  const matchesVerified =
    verifiedFilter === 'TODOS' ||
    (verifiedFilter === 'SI' && tech.isVerified) ||
    (verifiedFilter === 'NO' && !tech.isVerified);

  // 🚦 Activo
  const matchesActive =
    activeFilter === 'TODOS' ||
    (activeFilter === 'ACTIVO' && tech.user.isActive) ||
    (activeFilter === 'SUSPENDIDO' && !tech.user.isActive);

  return (
    matchesSearch &&
    matchesCity &&
    matchesVerified &&
    matchesActive
  );
});

const totalPages = Math.ceil(filteredTechnicians.length / ITEMS_PER_PAGE);

const start = (page - 1) * ITEMS_PER_PAGE;
const end = start + ITEMS_PER_PAGE;

const paginatedTechnicians = filteredTechnicians.slice(start, end);


  return (
    <div style={{ background: '#fff', padding: 24 }}>
      <h2>Gestión de Técnicos</h2>

      <div
  style={{
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  }}
>
  {/* Buscador */}
  <input
    type="text"
    placeholder="Buscar por nombre o correo"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      padding: '8px 12px',
      borderRadius: 8,
      border: '1px solid #d1d5db',
      minWidth: 260,
    }}
  />

  {/* Filtro ciudad */}
  <select
    value={cityFilter}
    onChange={(e) => setCityFilter(e.target.value)}
    style={{
      padding: '8px 12px',
      borderRadius: 8,
      border: '1px solid #d1d5db',
    }}
  >
    <option value="TODAS">Todas las ciudades</option>
    {[...new Set(technicians.map(t => t.user.city).filter(Boolean))].map(
      (city) => (
        <option key={city} value={city}>
          {city}
        </option>
      )
    )}
  </select>

  {/* Filtro verificado */}
<select
  value={verifiedFilter}
  onChange={(e) => setVerifiedFilter(e.target.value)}
  style={{
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
  }}
>
  <option value="TODOS">Todos</option>
  <option value="SI">Verificados</option>
  <option value="NO">No verificados</option>
</select>

{/* Filtro activo */}
<select
  value={activeFilter}
  onChange={(e) => setActiveFilter(e.target.value)}
  style={{
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
  }}
>
  <option value="TODOS">Todos</option>
  <option value="ACTIVO">Activos</option>
  <option value="SUSPENDIDO">Suspendidos</option>
</select>

</div>


      <p style={{ fontSize: 14, color: '#64748b', marginTop: 6, marginBottom: 16 }}>
  Este módulo sirve para monitorear el estado operativo de los técnicos.
  La validación y edición del perfil se realiza desde <strong>Usuarios</strong>.
</p>


      <table style={table}>
        <thead>
          <tr>
            <th style={{ width: '22%' }}>Nombre</th>
<th style={{ width: '26%' }}>Email</th>
<th style={{ width: '18%' }}>Ciudad</th>
<th style={{ width: '14%', textAlign: 'center' }}>Verificado</th>
<th style={{ width: '10%', textAlign: 'center' }}>Activo</th>
<th style={{ width: '10%', textAlign: 'center' }}>Registro</th>
<th style={{ width: '6%' }}></th>


          </tr>
        </thead>
        <tbody>
          {paginatedTechnicians.map((tech) => (


            <tr key={tech.id}>
              <td style={{ padding: '12px 16px' }}>
  {tech.user.fullName || '-'}
</td>

<td style={{ padding: '12px 16px' }}>
  {tech.user.email}
</td>

<td style={{ padding: '12px 16px' }}>
  {tech.user.city || '-'}
</td>

              <td style={{ textAlign: 'center', padding: '12px 16px' }}>
  {tech.isVerified ? (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        background: '#dcfce7',
        color: '#166534',
        minWidth: 110,
      }}
    >
      ✓ Verificado
    </span>
  ) : (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        background: '#fee2e2',
        color: '#991b1b',
        minWidth: 110,
      }}
    >
      ✕ No verificado
    </span>
  )}
</td>



              <td style={{ textAlign: 'center' }}>
  <span
    style={{
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 800,
      color: '#fff',
      background: tech.user.isActive ? '#16a34a' : '#dc2626',
      display: 'inline-block',
      minWidth: 90,
    }}
  >
    {tech.user.isActive ? 'ACTIVO' : 'SUSPENDIDO'}
  </span>
</td>

              <td style={{ textAlign: 'center' }}>
  {new Date(tech.user.createdAt).toLocaleDateString()}
</td>

              <td style={{ textAlign: 'center' }}>
  <button
    onClick={() => navigate(`/dashboard/users/${tech.userId}`)}

    style={{
      padding: '6px 12px',
      borderRadius: 8,
      border: '1px solid #d1d5db',
      background: '#f8fafc',
      cursor: 'pointer',
      fontWeight: 700,
    }}
  >
    Ver
  </button>
</td>

            </tr>
          ))}
        </tbody>
      </table>

      <div
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  }}
>
  <button
    disabled={page === 1}
    onClick={() => setPage(p => Math.max(1, p - 1))}
    style={{
      padding: '6px 12px',
      borderRadius: 6,
      border: '1px solid #d1d5db',
      background: page === 1 ? '#e5e7eb' : '#fff',
      cursor: page === 1 ? 'not-allowed' : 'pointer',
    }}
  >
    ◀ Anterior
  </button>

  <span style={{ fontWeight: 600 }}>
    Página {page} de {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
    style={{
      padding: '6px 12px',
      borderRadius: 6,
      border: '1px solid #d1d5db',
      background: page === totalPages ? '#e5e7eb' : '#fff',
      cursor: page === totalPages ? 'not-allowed' : 'pointer',
    }}
  >
    Siguiente ▶
  </button>
</div>

    </div>
  );
}

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  overflow: 'hidden',
};

