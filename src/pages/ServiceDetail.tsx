import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config/api';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const token = localStorage.getItem('admin_token');

        const response = await fetch(
          `${API_URL}/admin/requests/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        console.log('DETALLE SERVICE 👉', data);
        setService(data);
      } catch (error) {
        console.error('Error cargando detalle del servicio', error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (loading) return <p>Cargando servicio...</p>;
  if (!service) return <p>Servicio no encontrado</p>;

  return (
    <div style={{ background: '#fff', padding: 24 }}>
      <h2>Detalle del Servicio</h2>

      {/* ===================== */}
      {/* DATOS GENERALES */}
      {/* ===================== */}
      <section style={section}>
        <h3>Datos generales</h3>
        <p><strong>ID:</strong> {service.id}</p>
        <p><strong>Estado:</strong> {service.status}</p>
        <p>
          <strong>Fecha:</strong>{' '}
          {new Date(service.createdAt).toLocaleString()}
        </p>
      </section>

            {/* ===================== */}
      {/* PROBLEMA REPORTADO */}
      {/* ===================== */}
      <section style={section}>
        <h3>Problema reportado</h3>

        <p>
          <strong>Título:</strong>{' '}
          {service.title}
        </p>

        <p>
          <strong>Descripción:</strong>
        </p>

        <p style={{ marginTop: 8 }}>
          {service.description}
        </p>
      </section>


      {/* ===================== */}
      {/* USUARIO */}
      {/* ===================== */}
      <section style={section}>
        <h3>Usuario</h3>
        <p><strong>Nombre:</strong> {service.user?.fullName}</p>
        <p><strong>Email:</strong> {service.user?.email}</p>
        <p><strong>Ciudad:</strong> {service.user?.city}</p>
      </section>

            {/* ===================== */}
      {/* TÉCNICO */}
      {/* ===================== */}
      <section style={section}>
        <h3>Técnico</h3>

        {service.technician?.user ? (
          <>
            <p>
              <strong>Nombre:</strong>{' '}
              {service.technician.user.fullName}
            </p>

            <p>
              <strong>Email:</strong>{' '}
              {service.technician.user.email}
            </p>

            <p>
              <strong>Teléfono:</strong>{' '}
              {service.technician.user.phone ?? '—'}
            </p>
          </>
        ) : (
          <p>No hay técnico asignado</p>
        )}
      </section>


      {/* ===================== */}
      {/* CATEGORÍA */}
      {/* ===================== */}
      <section style={section}>
        <h3>Categoría</h3>
        <p>{service.category?.name}</p>
      </section>

      {/* ===================== */}
      {/* PAGO */}
      {/* ===================== */}
      <section style={section}>
        <h3>Pago</h3>
        {service.payment ? (
          <>
            <p>
              <strong>Monto:</strong> $
              {service.payment.amount}
            </p>
            <p>
              <strong>Estado:</strong>{' '}
              {service.payment.status}
            </p>
          </>
        ) : (
          <p>No hay pago registrado</p>
        )}
      </section>

      {/* ===================== */}
      {/* UBICACIÓN */}
      {/* ===================== */}
      <section style={section}>
        <h3>Ubicación</h3>
        <p><strong>Dirección:</strong> {service.address}</p>
        <p><strong>Ciudad:</strong> {service.city}</p>
        <p><strong>Latitud:</strong> {service.userLat ?? '—'}</p>
        <p><strong>Longitud:</strong> {service.userLng ?? '—'}</p>
      </section>

            {/* ===================== */}
      {/* TIPO DE SERVICIO */}
      {/* ===================== */}
      <section style={section}>
        <h3>Tipo de servicio</h3>
        <p>
          <strong>Express:</strong>{' '}
          {service.isExpress ? 'Sí' : 'No'}
        </p>
      </section>

            {/* ===================== */}
      {/* COSTOS */}
      {/* ===================== */}
      <section style={section}>
        <h3>Costos</h3>
        <p>
          <strong>Precio estimado:</strong>{' '}
          {service.estimatedPrice
            ? `$${service.estimatedPrice}`
            : '—'}
        </p>
      </section>

            {/* ===================== */}
      {/* IMÁGENES */}
      {/* ===================== */}
      <section style={section}>
        <h3>Imágenes</h3>

        {service.imageUrls?.length > 0 ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {service.imageUrls.map((url: string, i: number) => (
              <img
                key={i}
                src={url}
                alt={`img-${i}`}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                }}
              />
            ))}
          </div>
        ) : service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt="img"
            style={{
              width: 120,
              height: 120,
              objectFit: 'cover',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
            }}
          />
        ) : (
          <p>No hay imágenes</p>
        )}
      </section>

            {/* ===================== */}
      {/* GARANTÍA */}
      {/* ===================== */}
      <section style={section}>
        <h3>Garantía</h3>

        <p>
          <strong>Días:</strong>{' '}
          {service.guaranteeDays ?? '—'}
        </p>

        <p>
          <strong>Inicio:</strong>{' '}
          {service.guaranteeStartAt
            ? new Date(service.guaranteeStartAt).toLocaleString()
            : '—'}
        </p>

        <p>
          <strong>Expira:</strong>{' '}
          {service.guaranteeExpiresAt
            ? new Date(service.guaranteeExpiresAt).toLocaleString()
            : '—'}
        </p>
      </section>

            {/* ===================== */}
      {/* FECHAS */}
      {/* ===================== */}
      <section style={section}>
        <h3>Fechas importantes</h3>

        <p>
          <strong>Programado:</strong>{' '}
          {service.scheduledFor
            ? new Date(service.scheduledFor).toLocaleString()
            : '—'}
        </p>

        <p>
          <strong>Finalizado:</strong>{' '}
          {service.finishedAt
            ? new Date(service.finishedAt).toLocaleString()
            : '—'}
        </p>

        <p>
          <strong>Completado:</strong>{' '}
          {service.completedAt
            ? new Date(service.completedAt).toLocaleString()
            : '—'}
        </p>
      </section>

            {service.status === 'CANCELLED' && (
        <section style={section}>
          <h3>Cancelación</h3>
          <p>
            <strong>Cancelado por:</strong>{' '}
            {service.cancelledBy ?? '—'}
          </p>
        </section>
      )}

      {/* ===================== */}
      {/* DEBUG (DEV) */}
      {/* ===================== */}
      {import.meta.env.DEV && (
        <section style={section}>
          <h3>Debug</h3>
          <pre style={jsonBlock}>
            {JSON.stringify(service, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}

const section: React.CSSProperties = {
  marginTop: 24,
  padding: 16,
  border: '1px solid #e5e7eb',
  borderRadius: 6,
};

const jsonBlock: React.CSSProperties = {
  background: '#0f172a',
  color: '#e5e7eb',
  padding: 16,
  borderRadius: 6,
  fontSize: 12,
  overflowX: 'auto',
};
