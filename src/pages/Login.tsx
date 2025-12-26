import { useState } from 'react';
import { loginAdmin } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { login } = useAuth();

  const handleLogin = async () => {
  try {
    setLoading(true);
    setError('');

    const data = await loginAdmin(email, password);
    console.log('LOGIN OK:', data);

    // ✅ GUARDAR TOKEN Y USUARIO
    login(data.token, data.user);
    navigate('/dashboard');

    // 🔴 AQUÍ MISMO VA LA REDIRECCIÓN
    navigate('/dashboard');

    // 🔜 después redirigiremos al dashboard (NO AÚN)
  } catch (err: any) {
    setError(err.message || 'Error al iniciar sesión');
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/logo.png" alt="DAM" style={styles.logo} />

        <h1 style={styles.title}>Panel Administrador</h1>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button
          style={styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        {error && (
          <p style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>
            {error}
          </p>
        )}

        <button
  style={styles.forgot}
  onClick={() => navigate('/forgot-password')}
>
  ¿Olvidaste tu contraseña?
</button>

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f6f8',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '36px 44px',
    borderRadius: '16px',
    width: '380px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  logo: {
    width: '200px',
    marginBottom: '-10px',
  },
  title: {
    marginBottom: '24px',
    fontSize: '22px',
    fontWeight: 700,
    color: '#1f2937',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
  },
  forgot: {
    marginTop: '14px',
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: '13px',
  },
};
