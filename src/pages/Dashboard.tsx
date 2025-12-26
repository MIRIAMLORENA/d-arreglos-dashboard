import LogoutButton from '../components/LogoutButton';

export default function Dashboard() {
  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>DAM</h2>

        <nav style={styles.nav}>
          <div style={styles.navItem}>Dashboard</div>
          <div style={styles.navItem}>Usuarios</div>
          <div style={styles.navItem}>Técnicos</div>
          <div style={styles.navItem}>Servicios</div>
          <div style={styles.navItem}>Pagos</div>
        </nav>
      </aside>

      {/* CONTENIDO */}
      <main style={styles.main}>
        {/* HEADER */}
        <header style={styles.header}>
          <h1>Panel Administrador</h1>
          <LogoutButton />
        </header>

        {/* CONTENIDO CENTRAL */}
        <section style={styles.content}>
          <p>Bienvenido al panel de administración</p>
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
