import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/auth.service';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      await forgotPassword(email);
      setMessage('Revisa tu correo para continuar con la recuperación.');
    } catch (err: any) {
      setError(err.message || 'Error al enviar correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Recuperar contraseña</h1>

        <p style={styles.subtitle}>
          Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
        </p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <button
          style={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar instrucciones'}
        </button>

        {message && (
          <p style={{ color: 'green', marginBottom: '10px', fontSize: '14px' }}>
            {message}
          </p>
        )}

        {error && (
          <p style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
            {error}
          </p>
        )}

        <button
          style={styles.back}
          onClick={() => navigate('/')}
        >
          Volver al login
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
  title: {
    marginBottom: '10px',
    fontSize: '22px',
    fontWeight: 700,
    color: '#1f2937',
  },
  subtitle: {
    marginBottom: '20px',
    fontSize: '14px',
    color: '#6b7280',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
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
    marginBottom: '12px',
  },
  back: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: '13px',
  },
};
