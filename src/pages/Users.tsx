import { useEffect, useState } from 'react';
import {
  getAdminUsers,
  suspendUser,
  activateUser,
} from '../services/admin-users.service';
import { useNavigate } from 'react-router-dom';
import { updateUserByAdmin } from '../services/admin-users.service';


type User = {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  isActive: boolean;
  technicianProfile?: any;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'TECHNICIAN' | 'USER'>('ALL');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 150;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
  setPage(1);
}, [roleFilter, search]);


  const handleSuspend = async (id: string) => {
    if (!confirm('¿Suspender este usuario?')) return;
    await suspendUser(id);
    loadUsers();
  };

  const handleActivate = async (id: string) => {
    await activateUser(id);
    loadUsers();
  };

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>{error}</p>;

  const roleOrder: Record<string, number> = {
  ADMIN: 1,
  TECHNICIAN: 2,
  USER: 3,
};

const sortedUsers = [...users].sort((a, b) => {
  // 1️⃣ ordenar por rol
  const roleDiff =
    (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);

  if (roleDiff !== 0) return roleDiff;

  // 2️⃣ ordenar alfabéticamente dentro del mismo rol
  const nameA = (a.fullName || a.email).toLowerCase();
  const nameB = (b.fullName || b.email).toLowerCase();

  return nameA.localeCompare(nameB);
});


const filteredUsers = sortedUsers.filter((u) => {
  const matchesRole =
    roleFilter === 'ALL' ? true : u.role === roleFilter;

  const searchValue = search.toLowerCase();

  const matchesSearch =
    u.fullName?.toLowerCase().includes(searchValue) ||
    u.email.toLowerCase().includes(searchValue);

  return matchesRole && matchesSearch;
});

const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

const startIndex = (page - 1) * ITEMS_PER_PAGE;
const endIndex = startIndex + ITEMS_PER_PAGE;

const paginatedUsers = filteredUsers.slice(startIndex, endIndex);


  return (
    <div>
      <h2>Usuarios</h2>

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
  <label style={{ marginRight: 8 }}>Filtrar por rol:</label>

  <select
    value={roleFilter}
    onChange={(e) => setRoleFilter(e.target.value as any)}
    style={{ marginRight: 16 }}
  >
    <option value="ALL">Todos</option>
    <option value="ADMIN">Administradores</option>
    <option value="TECHNICIAN">Técnicos</option>
    <option value="USER">Usuarios</option>
  </select>

  <input
    type="text"
    placeholder="Buscar por nombre o correo"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      padding: '6px 10px',
      border: '1px solid #d1d5db',
      borderRadius: 6,
      width: 260,
    }}
  />
</div>



      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: 16,
          background: '#fff',
        }}
      >
        <thead>
          <tr>
            <th style={th}>Nombre</th>
            <th style={th}>Email</th>
            <th style={th}>Rol</th>
            <th style={th}>Técnico</th>
            <th style={th}>Estado</th>
            <th style={th}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {paginatedUsers.map((u) => (


            <tr
  key={u.id}
  style={{
    backgroundColor: u.isActive ? '#fff' : '#f9fafb',
  }}
>


              <td style={td}>{u.fullName || '-'}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>
  <select
    value={u.role}
    onChange={async (e) => {
      const newRole = e.target.value;

      if (
        !confirm(
          `¿Seguro que deseas cambiar el rol de ${u.email} a ${newRole}?`,
        )
      )
        return;

      try {
        await updateUserByAdmin(u.id, { role: newRole });
        loadUsers();
      } catch (e) {
        alert('Error al cambiar el rol');
      }
    }}
    style={{
      padding: '6px 10px',
      borderRadius: 8,
      border: '1px solid #d1d5db',
      fontWeight: 700,
      color: '#fff',
      backgroundColor:
        u.role === 'ADMIN'
          ? '#7c3aed' // morado
          : u.role === 'TECHNICIAN'
          ? '#2563eb' // azul
          : '#6b7280', // gris
    }}
  >
    <option value="ADMIN">ADMIN</option>
    <option value="TECHNICIAN">TECHNICIAN</option>
    <option value="USER">USER</option>
  </select>
</td>

              <td style={td}>{u.technicianProfile ? 'Sí' : 'No'}</td>
              <td style={td}>
  <span
    style={{
      padding: '4px 8px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      color: '#fff',
      backgroundColor: u.isActive ? '#16a34a' : '#dc2626',
    }}
  >
    {u.isActive ? 'ACTIVO' : 'SUSPENDIDO'}
  </span>
</td>

              <td style={td}>
  <button
    onClick={() => navigate(`/dashboard/users/${u.id}`)}
    style={{ marginRight: 8 }}
  >
    Ver
  </button>

  {u.isActive ? (
  <button
    onClick={() => handleSuspend(u.id)}
    style={{
      background: '#dc2626',
      color: '#fff',
      border: 'none',
      padding: '6px 10px',
      borderRadius: 6,
      cursor: 'pointer',
    }}
  >
    Suspender
  </button>
) : (
  <button
    onClick={() => handleActivate(u.id)}
    style={{
      background: '#16a34a',
      color: '#fff',
      border: 'none',
      padding: '6px 10px',
      borderRadius: 6,
      cursor: 'pointer',
    }}
  >
    Activar
  </button>
)}

</td>

            </tr>
          ))}
        </tbody>
      </table>

      <div
  style={{
    marginTop: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  }}
>
  <button
    onClick={() => setPage((p) => Math.max(p - 1, 1))}
    disabled={page === 1}
  >
    ◀ Anterior
  </button>

  <span>
    Página {page} de {totalPages || 1}
  </span>

  <button
    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
    disabled={page === totalPages || totalPages === 0}
  >
    Siguiente ▶
  </button>
</div>

    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px',
  borderBottom: '1px solid #e5e7eb',
};

const td: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #e5e7eb',
};
