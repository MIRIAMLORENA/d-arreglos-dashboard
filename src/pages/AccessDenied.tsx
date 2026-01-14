export default function AccessDenied() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 40,
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          maxWidth: 420,
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: 12 }}>Acceso restringido</h2>
        <p style={{ marginBottom: 24 }}>
          Este panel es exclusivo para administradores del sistema.
        </p>

        <a href="/" style={{ color: '#2563eb', fontWeight: 600 }}>
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
