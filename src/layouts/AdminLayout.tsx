import { Outlet, NavLink } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

export default function AdminLayout() {
  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>DAM</h2>

        <nav style={styles.nav}>
  <NavLink to="/dashboard" end style={navLinkStyle}>
    Dashboard
  </NavLink>

  <NavLink to="/dashboard/users" style={navLinkStyle}>
    Usuarios
  </NavLink>

  <NavLink to="/dashboard/technicians" style={navLinkStyle}>
    Técnicos
  </NavLink>

  <NavLink to="/dashboard/services" style={navLinkStyle}>
    Servicios
  </NavLink>

  <NavLink to="/dashboard/categories" style={navLinkStyle}>
  Categorías
  </NavLink>

  <NavLink to="/dashboard/payments" style={navLinkStyle}>
    Pagos
  </NavLink>
</nav>

      </aside>

      {/* CONTENIDO */}
      <main style={styles.main}>
        {/* HEADER */}
        <header style={styles.header}>
          <h1>Panel Administrador</h1>
          <LogoutButton />
        </header>

        {/* CONTENIDO DINÁMICO */}
        <section style={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f4f6f8',
  },
  sidebar: {
  width: '220px',
  minWidth: '220px',
  boxSizing: 'border-box',
  backgroundColor: '#111827',
  color: '#ffffff',
  padding: '20px',
},

  logo: {
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '30px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  navItem: {
    cursor: 'pointer',
    padding: '8px 0',
    color: '#d1d5db',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: '64px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    borderBottom: '1px solid #e5e7eb',
  },
  content: {
    padding: '24px',
  },
};

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  ...styles.navItem,
  color: isActive ? '#ffffff' : '#d1d5db',
  fontWeight: isActive ? 600 : 400,
});
