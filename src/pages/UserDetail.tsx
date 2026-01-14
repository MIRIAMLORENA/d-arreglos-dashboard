import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config/api';
import { resetTechnicianPenalties } from '../services/admin-users.service';
import { getTechnicianOperationalSummary } from '../services/admin-users.service';
import Modal from '../components/Modal';
import { getAdminCategories } from '../services/admin-categories.service';

type UserDetail = {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;

  // 🔵 DATOS PERSONALES (PRISMA REAL)
  fechaNacimiento?: string;
  genero?: string;
  curp?: string;
  municipio?: string;
  estado?: string;
  city?: string;
  avatarUrl?: string;

  ratingAvg?: number;
  ratingCount?: number;
  audienceCount?: number;


  role: string;
  isActive: boolean;
  createdAt: string;

  technicianProfile?: any;
};

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [techSummary, setTechSummary] = useState<any>(null);
  const [loadingTechSummary, setLoadingTechSummary] = useState(false);
  const [isTechProfileModalOpen, setIsTechProfileModalOpen] = useState(false);
  const [formBio, setFormBio] = useState('');
  const [formYearsOfExp, setFormYearsOfExp] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formBasePrice, setFormBasePrice] = useState<string>('');
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<
  { id: string; name: string }[]
>([]);


  const [formBankName, setFormBankName] = useState('');
  const [formBankAccountHolder, setFormBankAccountHolder] = useState('');
  const [formClabe, setFormClabe] = useState('');
  const [formRfc, setFormRfc] = useState('');


  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
 
  // ✅ MODAL: EDITAR INFORMACIÓN PERSONAL (ADMIN)
const [isEditPersonalModalOpen, setIsEditPersonalModalOpen] = useState(false);

const [formFullName, setFormFullName] = useState('');
const [formPhone, setFormPhone] = useState('');
const [formGenero, setFormGenero] = useState('');
const [formFechaNacimiento, setFormFechaNacimiento] = useState('');
const [formCurp, setFormCurp] = useState('');
const [formCityPersonal, setFormCityPersonal] = useState('');
const [formMunicipio, setFormMunicipio] = useState('');
const [formEstado, setFormEstado] = useState('');



  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('admin_token');

      const response = await fetch(`${API_URL}/admin-users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
setUser(data);

// 🔵 SI ES TÉCNICO, CARGAR RESUMEN OPERATIVO
if (data.technicianProfile) {
  setLoadingTechSummary(true);

  
  try {
    const summary = await getTechnicianOperationalSummary(data.id);
    setTechSummary(summary);
  } catch (e) {
    console.error('Error cargando resumen del técnico', e);
    setTechSummary(null);
  } finally {
    setLoadingTechSummary(false);
  }
}

setLoading(false);

    };

    fetchUser();
  }, [id]);

  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const data = await getAdminCategories();
      setAllCategories(data);
    } catch (error) {
      console.error('Error cargando categorías', error);
    }
  };

  fetchCategories();
}, []);


  // 🔵 Precargar datos del perfil técnico al abrir el modal
useEffect(() => {
  if (!isTechProfileModalOpen || !user?.technicianProfile) return;

  const techProfile = user.technicianProfile;

  setFormBio(techProfile.bio || '');
  setFormYearsOfExp(techProfile.yearsOfExp?.toString() || '');
  setFormSkills(techProfile.skills || '');
  setFormBasePrice(
  techProfile.basePrice !== null && techProfile.basePrice !== undefined
    ? techProfile.basePrice.toString()
    : ''
);
  setFormCity(techProfile.city || '');

  setFormCategories(
  techProfile.technicianCategories
    ? techProfile.technicianCategories.map((tc: any) => tc.category.id)
    : []
);


  setFormBankName(techProfile.bankName || '');
  setFormBankAccountHolder(techProfile.accountHolder || '');
  setFormClabe(techProfile.clabe || '');
  setFormRfc(user.technicianProfile.rfc || '');


  setFormImagePreview(techProfile.imageUrl || null);
}, [isTechProfileModalOpen, user]);

// 🔵 Precargar datos al abrir el modal de Información Personal
useEffect(() => {
  if (!isEditPersonalModalOpen || !user) return;

  setFormFullName(user.fullName || '');
  setFormPhone(user.phone || '');
  setFormGenero(user.genero || '');
  setFormFechaNacimiento(
    user.fechaNacimiento
      ? new Date(user.fechaNacimiento).toISOString().split('T')[0]
      : ''
  );
  setFormCurp(user.curp || '');
  setFormCityPersonal(user.city || '');
  setFormMunicipio(user.municipio || '');
  setFormEstado(user.estado || '');
}, [isEditPersonalModalOpen, user]);



  if (loading) return <p>Cargando usuario...</p>;
  if (!user) return <p>Usuario no encontrado</p>;

  const tech = user.technicianProfile;

  const isTechnicianProfileComplete = !!(
  tech &&
  tech.bio &&
  tech.yearsOfExp &&
  tech.city &&
  tech.technicianCategories &&
  tech.technicianCategories.length >= 1 &&
  tech.technicianCategories.length <= 3 &&
  tech.bankName &&
  tech.accountHolder &&
  tech.clabe &&
  tech.imageUrl

);


  const handleResetPenalties = async () => {
  if (!user || !tech) return;

  const ok = confirm(
    '¿Seguro que deseas limpiar las penalizaciones y el bloqueo EXPRESS de este técnico?'
  );

  if (!ok) return;

  try {
    await resetTechnicianPenalties(user.id);

    // Refetch del usuario
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${API_URL}/admin-users/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    setUser(data);

    alert('✅ Penalizaciones limpiadas correctamente');
  } catch (err) {
    console.error(err);
    alert('❌ Error al limpiar penalizaciones');
  }
};


  // 🔵 Avatar prioridad: user → técnico → fallback
  const avatarSrc =
  tech?.imageUrl ||
  user.avatarUrl ||
  undefined;

  const handleSaveTechProfile = async () => {
  try {
    const token = localStorage.getItem('admin_token');

    const payload: any = {
  bio: formBio,
  skills: formSkills,
  yearsOfExp: Number(formYearsOfExp),
  city: formCity,
  categoryIds: formCategories,
  bankName: formBankName,
  accountHolder: formBankAccountHolder,
  clabe: formClabe,
  rfc: formRfc || undefined,
  imageUrl: formImagePreview,
};

// 👇 SOLO si el admin escribió algo
if (formBasePrice !== '') {
  payload.basePrice = Number(formBasePrice);
}


    let response;

    if (!tech) {
      // 👉 CREAR PERFIL TÉCNICO
      response = await fetch(`${API_URL}/technicians`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payload,
          userId: user.id,
        }),
      });
    } else {
      // 👉 ACTUALIZAR PERFIL TÉCNICO
      response = await fetch(`${API_URL}/technicians/${tech.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      throw new Error('Error al guardar perfil técnico');
    }

    // 🔁 Refrescar usuario
    const userRes = await fetch(`${API_URL}/admin-users/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const updatedUser = await userRes.json();
    setUser(updatedUser);

    setIsTechProfileModalOpen(false);
    alert('✅ Perfil técnico guardado correctamente');
  } catch (err) {
    console.error(err);
    alert('❌ Error al guardar el perfil técnico');
  }
};




  return (
    <div style={{ background: '#f8fafc', padding: 32 }}>
      <h2 style={{ fontSize: 22, marginBottom: 20 }}>Detalle del Usuario</h2>

      {/* ===================== */}
      {/* HEADER */}
      {/* ===================== */}
      <section style={card}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Avatar name={user.fullName} src={avatarSrc} />

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 20, margin: 0 }}>
              {user.fullName || 'Sin nombre'}
            </h3>
            <p style={mutedLg}>Rol: {user.role}</p>
            <p style={mutedSm}>User ID: {user.id}</p>
          </div>

          <span style={badge(user.isActive ? 'green' : 'red')}>
            {user.isActive ? 'Activo' : 'Suspendido'}
          </span>
        </div>

        <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
          El estado del usuario se gestiona desde el listado de usuarios.
        </p>
      </section>

      {/* ===================== */}
      {/* INFORMACIÓN PERSONAL */}
      {/* ===================== */}
      <section style={card}>
        <h3 style={sectionTitle}>Información personal</h3>

        <button
  onClick={() => setIsEditPersonalModalOpen(true)}
  style={{
    marginTop: 10,
    padding: '8px 14px',
    borderRadius: 8,
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  }}
>
  ✏️ Editar información personal
</button>


        <div style={{ ...grid, marginTop: 20 }}>

          <Info label="Email" value={user.email} />
          <Info label="Teléfono" value={user.phone} />
          <Info label="Género" value={user.genero} />
          <Info
            label="Fecha de nacimiento"
            value={
              user.fechaNacimiento
                ? new Date(user.fechaNacimiento).toLocaleDateString()
                : undefined
            }
          />
          <Info label="CURP" value={user.curp} />
          <Info label="Ciudad" value={user.city} />
          <Info label="Municipio" value={user.municipio} />
          <Info label="Estado" value={user.estado} />
          <Info
            label="Fecha de registro"
            value={new Date(user.createdAt).toLocaleString()}
          />
        </div>
      </section>

      {/* ===================== */}
{/* ESTADO DEL USUARIO */}
{/* ===================== */}
<section style={card}>
  <h3 style={sectionTitle}>Estado del usuario</h3>

  <div style={grid}>
    <Info
      label="Calificación promedio"
      value={
        user.ratingAvg !== undefined
          ? user.ratingAvg.toFixed(2)
          : '—'
      }
    />

    <Info
      label="Total de calificaciones"
      value={user.ratingCount ?? '—'}
    />

    <Info
      label="Audiencia"
      value={user.audienceCount ?? '—'}
    />
  </div>
</section>


      {/* ===================== */}
      {/* PERFIL TÉCNICO */}
      {/* ===================== */}
      <section style={card}>
        <h3 style={sectionTitle}>Perfil técnico</h3>

        {!tech ? (
          <div>
  <p style={{ ...mutedLg, marginBottom: 12 }}>
    Este usuario no tiene perfil de técnico.
  </p>

  <button
    onClick={() => setIsTechProfileModalOpen(true)}
    style={{
      background: '#2563eb',
      color: '#fff',
      padding: '10px 16px',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
    }}
  >
    🧩 Completar perfil técnico
  </button>
</div>

        ) : (
          <>

          <div style={{ marginBottom: 16 }}>
  {isTechnicianProfileComplete ? (
    <span style={{ color: '#15803d', fontWeight: 600 }}>
      ✅ Perfil técnico completo
    </span>
  ) : (
    <span style={{ color: '#ca8a04', fontWeight: 600 }}>
      ⚠️ Perfil técnico incompleto
    </span>
  )}

  <div style={{ marginBottom: 20 }}>
  <button
    onClick={() => setIsTechProfileModalOpen(true)}
    style={{
      background: '#2563eb',
      color: '#fff',
      padding: '10px 16px',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
    }}
  >
    {isTechnicianProfileComplete
      ? '✏️ Editar perfil técnico'
      : '🧩 Completar perfil técnico'}
  </button>
</div>

</div>


          {/* FOTO DEL TÉCNICO */}
{tech.imageUrl && (
  <div style={{ marginBottom: 20 }}>
    <div
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: '#334155',
        marginBottom: 6,
      }}
    >
      Foto del técnico
    </div>

    <img
      src={tech.imageUrl}
      alt="foto-tecnico"
      style={{
        width: 120,
        height: 120,
        borderRadius: 12,
        objectFit: 'cover',
        border: '1px solid #e5e7eb',
      }}
      onError={(e) => {
        console.error('❌ Error cargando imagen del técnico:', tech.imageUrl);
        e.currentTarget.style.display = 'none';
      }}
    />
  </div>
)}

            <p style={mutedSm}>Technician ID: {tech.id}</p>

            <h4 style={subTitle}>Datos profesionales</h4>
            <div style={grid}>
              <Info label="Bio" value={tech.bio} />
              <Info label="Habilidades" value={tech.skills} />
              <Info label="Años de experiencia" value={tech.yearsOfExp} />
              <Info
                label="Precio base"
                value={tech.basePrice ? `$${tech.basePrice}` : undefined}
              />
              <Info label="Ciudad" value={tech.city} />
              <Info label="Banco" value={tech.bankName} />
              <Info label="Titular de la cuenta" value={tech.accountHolder} />
              <Info label="CLABE" value={tech.clabe} />
              <Info label="RFC" value={tech.rfc} />


              <div>
  <strong>Categorías</strong>
  {tech.technicianCategories && tech.technicianCategories.length > 0 ? (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
      {tech.technicianCategories.map((tc: any) => (
        <span
          key={tc.category.id}
          style={{
            background: '#e5e7eb',
            padding: '4px 10px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {tc.category.name}
        </span>
      ))}
    </div>
  ) : (
    <div style={{ marginTop: 6 }}>—</div>
  )}
</div>



            </div>

            <hr style={hr} />

            <h4 style={subTitle}>Estado técnico</h4>
            <div style={grid}>
              <Info label="Disponible" value={tech.isAvailable ? 'Sí' : 'No'} />
              <Info label="Verificado" value={tech.isVerified ? 'Sí' : 'No'} />
              <Info label="Destacado" value={tech.isFeatured ? 'Sí ⭐' : 'No'} />
            </div>

            <hr style={hr} />

            {/* ===================== */}
{/* ADMIN — VERIFICAR TÉCNICO */}
{/* ===================== */}
{isTechnicianProfileComplete && !tech.isVerified && (
  <div style={{ marginTop: 16 }}>
    <button
      onClick={async () => {
        const ok = confirm(
          '¿Deseas marcar este técnico como VERIFICADO?'
        );
        if (!ok) return;

        try {
          const token = localStorage.getItem('admin_token');

          // 👉 ENDPOINT EXISTENTE
          await fetch(`${API_URL}/technicians/${tech.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              isVerified: true,
            }),
          });

          // 🔁 Refrescar usuario
          const response = await fetch(
            `${API_URL}/admin-users/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const updatedUser = await response.json();
          setUser(updatedUser);

          alert('✅ Técnico marcado como VERIFICADO');
        } catch (err) {
          console.error(err);
          alert('❌ Error al verificar técnico');
        }
      }}
      style={{
        background: '#16a34a',
        color: '#fff',
        padding: '10px 18px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      ✅ Marcar como verificado
    </button>
  </div>
)}


          </>
        )}
      </section>

      {/* ===================== */}
      {/* ESTADO OPERATIVO */}
      {/* ===================== */}
      {tech && (
        <section style={card}>
          <h3 style={sectionTitle}>Estado operativo del técnico</h3>

          <div style={grid}>
            <Info label="Calificación promedio" value={tech.ratingAvg?.toFixed(2)} />
            <Info label="Total de calificaciones" value={tech.ratingCount} />
            <Info label="Nivel de penalización" value={tech.penaltyLevel} />

          </div>

          <p style={{ marginTop: 12, fontSize: 14 }}>
            <p style={{ marginTop: 12, fontSize: 14 }}>

  

  {/* 🔵 BLOQUEO EXPRESS */}
  {tech.expressBlockedUntil && (
    <span style={{ color: '#1d4ed8', display: 'block' }}>
      🚫 <strong>Bloqueo EXPRESS</strong> hasta{' '}
      <strong>{new Date(tech.expressBlockedUntil).toLocaleString()}</strong>
    </span>
  )}

  {/* 🟢 TODO OK */}
  {!tech.expressBlockedUntil && (
  <span style={{ color: '#15803d' }}>
    ✅ Sin bloqueos operativos activos.
  </span>
)}

{/* 🧹 ADMIN — LIMPIAR PENALIZACIONES */}
{(tech.penaltyLevel > 0 || tech.expressBlockedUntil) && (
  <div style={{ marginTop: 16 }}>
    <button
      onClick={handleResetPenalties}
      style={{
        background: '#f97316',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      🧹 Limpiar penalizaciones
    </button>
  </div>
)}

{/* ===================== */}
{/* 📊 RESUMEN OPERATIVO */}
{/* ===================== */}
{loadingTechSummary && (
  <p style={{ fontSize: 14, color: '#64748b', marginTop: 12 }}>
    ⏳ Cargando resumen operativo del técnico...
  </p>
)}

{techSummary && (
  <section style={{ marginTop: 24 }}>
    <h4 style={subTitle}>📊 Resumen operativo del técnico</h4>

    <div style={grid}>
      <Info
        label="Servicios completados"
        value={techSummary.completedTotal}
      />

      <Info
        label="EXPRESS completados"
        value={techSummary.completedExpress}
      />

      <Info
        label="NORMALES completados"
        value={techSummary.completedNormal}
      />

      <Info
        label="Servicios asignados"
        value={techSummary.assignedTotal}
      />

      <Info
        label="Rechazos del técnico"
        value={techSummary.technicianRejections}
      />

      <Info
        label="Cancelaciones del usuario"
        value={techSummary.cancelledByUser}
      />
    </div>
  </section>
)}



</p>

          </p>
        </section>
      )}

      {/* ===================== */}
      {/* DATOS TÉCNICOS */}
      {/* ===================== */}
      {import.meta.env.DEV && (
        <section style={card}>
          <details>
            <summary style={{ cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>
              Ver datos técnicos del backend
            </summary>

            <pre style={jsonBlock}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </section>
      )}

      <Modal
  isOpen={isTechProfileModalOpen}
  onClose={() => setIsTechProfileModalOpen(false)}
  title="Perfil técnico"
  width="720px"
>
  {/* PASO 2.3: aquí irá el formulario */}
  <form
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  }}
>


  {/* FOTO */}
  <div style={{ gridColumn: '1 / -1' }}>

    <label style={labelStyle}>Foto del técnico</label>

    {formImagePreview && (
      <img
        src={formImagePreview}
        alt="preview"
        style={{
          width: 120,
          height: 120,
          borderRadius: 12,
          objectFit: 'cover',
          marginBottom: 8,
          border: '1px solid #e5e7eb',
        }}
      />
    )}

    <input
  type="text"
  placeholder="Pega aquí el URL de la imagen (Cloudinary)"
  value={formImagePreview || ''}
  onChange={(e) => setFormImagePreview(e.target.value)}
  style={{
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #cbd5f5',
    fontSize: 14,
  }}
/>

    <p style={{ fontSize: 12, color: '#64748b' }}>
       Pega aquí el URL de la imagen del técnico (Cloudinary).
    </p>
  </div>

  {/* BIO */}
  <div style={{ gridColumn: '1 / -1' }}>

    <label style={labelStyle}>Descripción / Bio</label>
    <textarea
  value={formBio}
  onChange={(e) => setFormBio(e.target.value)}
  rows={3}
  style={{
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #cbd5f5',
    fontSize: 14,
    resize: 'vertical',
  }}
/>

  </div>

  {/* HABILIDADES */}
<div style={{ gridColumn: '1 / -1' }}>
  <label style={labelStyle}>Habilidades</label>
  <input
    value={formSkills}
    onChange={(e) => setFormSkills(e.target.value)}
    placeholder="Ej. Plomería general, instalaciones, reparaciones"
    style={{
      width: '100%',
      padding: '8px 10px',
      borderRadius: 6,
      border: '1px solid #cbd5f5',
      fontSize: 14,
    }}
  />
</div>


  {/* EXPERIENCIA */}
  <div>
    <label style={labelStyle}>Años de experiencia</label>
    <input
  type="number"
  value={formYearsOfExp}
  onChange={(e) => setFormYearsOfExp(e.target.value)}
  style={{
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #cbd5f5',
    fontSize: 14,
  }}
/>

  </div>

  {/* PRECIO BASE (OPCIONAL) */}
<div>
  <label style={labelStyle}>Precio base (opcional)</label>
  <input
    type="number"
    placeholder="Ej. 350"
    value={formBasePrice}
    onChange={(e) => setFormBasePrice(e.target.value)}
    style={{
      width: '100%',
      padding: '8px 10px',
      borderRadius: 6,
      border: '1px solid #cbd5f5',
      fontSize: 14,
    }}
  />
</div>


  {/* CIUDAD */}
<div>
  <label style={labelStyle}>Ciudad</label>
  <select
    value={formCity}
    onChange={(e) => setFormCity(e.target.value)}
    style={{
  width: '100%',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #cbd5f5',
  fontSize: 14,
}}

  >
    <option value="">Selecciona una ciudad</option>
    <option value="Tuxtla Gutiérrez">Tuxtla Gutiérrez</option>
    <option value="San Cristóbal de las Casas">
      San Cristóbal de las Casas
    </option>
    <option value="Tapachula">Tapachula</option>
  </select>
</div>


  {/* CATEGORÍAS */}
<div style={{ gridColumn: '1 / -1' }}>
  <label style={labelStyle}>Categorías (máx. 3)</label>

  <select
  value=""
  onChange={(e) => {
    const categoryId = e.target.value;
    if (!categoryId) return;
    if (formCategories.includes(categoryId)) return;
    if (formCategories.length >= 3) return;

    setFormCategories([...formCategories, categoryId]);
  }}

    style={{
      width: '100%',
      padding: '8px 10px',
      borderRadius: 6,
      border: '1px solid #cbd5f5',
      fontSize: 14,
      marginTop: 6,
    }}
  >
    <option value="">Selecciona una categoría</option>
    {allCategories.map((cat) => (
  <option key={cat.id} value={cat.id}>
    {cat.name}
  </option>
))}

  </select>

  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
  {formCategories.map((catId) => {
    const category = allCategories.find((c) => c.id === catId);

    return (
      <span
        key={catId}
        style={{
          background: '#dbeafe',
          padding: '4px 10px',
          borderRadius: 12,
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {category ? category.name : catId}
        <button
          type="button"
          onClick={() =>
            setFormCategories(formCategories.filter((c) => c !== catId))
          }
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          ×
        </button>
      </span>
    );
  })}
</div>


  <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
    {formCategories.length}/3 seleccionadas
  </div>
</div>


  <hr />

  {/* DATOS BANCARIOS */}
  <h4 style={{ ...subTitle, gridColumn: '1 / -1' }}>
  Datos bancarios
</h4>


  <div>
    <label style={labelStyle}>Banco</label>
    <input
  value={formBankName}
  onChange={(e) => setFormBankName(e.target.value)}
  style={{
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #cbd5f5',
    fontSize: 14,
  }}
/>

  </div>

  <div>
    <label style={labelStyle}>Titular de la cuenta</label>
    <input
  value={formBankAccountHolder}
  onChange={(e) => setFormBankAccountHolder(e.target.value)}
  style={{
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #cbd5f5',
    fontSize: 14,
  }}
/>

  </div>

  <div>
    <label style={labelStyle}>CLABE</label>
    <input
  value={formClabe}
  onChange={(e) => setFormClabe(e.target.value)}
  style={{
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #cbd5f5',
    fontSize: 14,
  }}
/>

<div>
  <label style={labelStyle}>RFC (opcional)</label>
  <input
    value={formRfc}
    onChange={(e) => setFormRfc(e.target.value)}
    placeholder="Ej. GODE561231GR8"
    style={{
      width: '100%',
      padding: '8px 10px',
      borderRadius: 6,
      border: '1px solid #cbd5f5',
      fontSize: 14,
    }}
  />
</div>


  </div>
<div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
  <button
    type="button"
    onClick={handleSaveTechProfile}
    style={{
      background: '#2563eb',
      color: '#fff',
      padding: '10px 18px',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
    }}
  >
    💾 Guardar perfil técnico
  </button>
</div>

</form>

</Modal>

<Modal
  isOpen={isEditPersonalModalOpen}
  onClose={() => setIsEditPersonalModalOpen(false)}
  title="Editar información personal"
  width="720px"
>
  <form
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20,
    }}
  >
    {/* EMAIL — SOLO LECTURA */}
    <div style={{ gridColumn: '1 / -1' }}>
      <label style={labelStyle}>Email</label>
      <input
        value={user?.email || ''}
        disabled
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #e5e7eb',
          background: '#f1f5f9',
          fontSize: 14,
        }}
      />
    </div>

    {/* NOMBRE */}
    <div>
      <label style={labelStyle}>Nombre completo</label>
      <input
        value={formFullName}
        onChange={(e) => setFormFullName(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #cbd5f5',
          fontSize: 14,
        }}
      />
    </div>

    {/* TELÉFONO */}
    <div>
      <label style={labelStyle}>Teléfono</label>
      <input
        value={formPhone}
        onChange={(e) => setFormPhone(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #cbd5f5',
          fontSize: 14,
        }}
      />
    </div>

    {/* GÉNERO */}
    <div>
      <label style={labelStyle}>Género</label>
      <select
        value={formGenero}
        onChange={(e) => setFormGenero(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #cbd5f5',
          fontSize: 14,
        }}
      >
        <option value="">Selecciona</option>
        <option value="MASCULINO">Masculino</option>
        <option value="FEMENINO">Femenino</option>
        <option value="OTRO">Otro</option>
      </select>
    </div>

    {/* FECHA NACIMIENTO */}
    <div>
      <label style={labelStyle}>Fecha de nacimiento</label>
      <input
        type="date"
        value={formFechaNacimiento}
        onChange={(e) => setFormFechaNacimiento(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #cbd5f5',
          fontSize: 14,
        }}
      />
    </div>

    {/* CURP */}
    <div>
      <label style={labelStyle}>CURP</label>
      <input
        value={formCurp}
        onChange={(e) => setFormCurp(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #cbd5f5',
          fontSize: 14,
        }}
      />
    </div>

    {/* CIUDAD */}
<div>
  <label style={labelStyle}>Ciudad</label>
  <select
    value={formCityPersonal}
    onChange={(e) => setFormCityPersonal(e.target.value)}
    style={{
      width: '100%',
      padding: '8px 10px',
      borderRadius: 6,
      border: '1px solid #cbd5f5',
      fontSize: 14,
    }}
  >
    <option value="">Selecciona una ciudad</option>
    <option value="Tuxtla Gutiérrez">Tuxtla Gutiérrez</option>
    <option value="San Cristóbal de las Casas">
      San Cristóbal de las Casas
    </option>
    <option value="Tapachula">Tapachula</option>
  </select>
</div>


    {/* MUNICIPIO */}
    <div>
      <label style={labelStyle}>Municipio</label>
      <input
        value={formMunicipio}
        onChange={(e) => setFormMunicipio(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #cbd5f5',
          fontSize: 14,
        }}
      />
    </div>

    {/* ESTADO */}
    <div>
      <label style={labelStyle}>Estado</label>
      <input
        value={formEstado}
        onChange={(e) => setFormEstado(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #cbd5f5',
          fontSize: 14,
        }}
      />
    </div>

    {/* FECHA REGISTRO — SOLO LECTURA */}
    <div style={{ gridColumn: '1 / -1' }}>
      <label style={labelStyle}>Fecha de registro</label>
      <input
        value={user ? new Date(user.createdAt).toLocaleString() : ''}
        disabled
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #e5e7eb',
          background: '#f1f5f9',
          fontSize: 14,
        }}
      />
    </div>

    {/* BOTONES */}
    <div
      style={{
        gridColumn: '1 / -1',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 10,
      }}
    >
      <button
        type="button"
        onClick={() => setIsEditPersonalModalOpen(false)}
        style={{
          background: '#e5e7eb',
          padding: '10px 16px',
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Cancelar
      </button>

      <button
  type="button"
  onClick={async () => {
    try {
      const token = localStorage.getItem('admin_token');

      await fetch(`${API_URL}/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formFullName,
          phone: formPhone,
          genero: formGenero || undefined,
          fechaNacimiento: formFechaNacimiento
            ? new Date(formFechaNacimiento)
            : undefined,
          curp: formCurp || undefined,
          city: formCityPersonal || undefined,
          municipio: formMunicipio || undefined,
          estado: formEstado || undefined,
        }),
      });

      // 🔁 Refrescar usuario
      const response = await fetch(`${API_URL}/admin-users/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = await response.json();
      setUser(updatedUser);

      setIsEditPersonalModalOpen(false);
      alert('✅ Información personal actualizada');
    } catch (err) {
      console.error(err);
      alert('❌ Error al guardar información personal');
    }
  }}
  style={{
    background: '#2563eb',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
  }}
>
  💾 Guardar cambios
</button>

    </div>
  </form>
</Modal>


    </div>
  );
}

/* ===================== */
/* COMPONENTES */
/* ===================== */
function Info({ label, value }: { label: string; value?: any }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value ?? '—'}</div>
    </div>
  );
}

function Avatar({ name, src }: { name?: string; src?: string }) {
  if (src) {
    return (
      <img
      key={src}   // 👈 ESTA LÍNEA ES LA CLAVE
        src={src}
        alt="avatar"
        style={{ width: 72, height: 72, borderRadius: '50%' }}
      />
    );
  }

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: '#c7d2fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        fontWeight: 700,
        color: '#1e3a8a',
      }}
    >
      {initials}
    </div>
  );
}

/* ===================== */
/* ESTILOS */
/* ===================== */
const card: React.CSSProperties = {
  background: '#fff',
  padding: 24,
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  marginBottom: 24,
};

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 16,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  marginBottom: 12,
};

const subTitle: React.CSSProperties = {
  fontSize: 16,
  marginBottom: 8,
};

const mutedLg: React.CSSProperties = {
  fontSize: 15,
  color: '#64748b',
};

const mutedSm: React.CSSProperties = {
  fontSize: 13,
  color: '#64748b',
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#334155',
};

const valueStyle: React.CSSProperties = {
  fontSize: 15,
  color: '#0f172a',
};

const badge = (color: 'green' | 'red'): React.CSSProperties => ({
  background: color === 'green' ? '#dcfce7' : '#fee2e2',
  color: color === 'green' ? '#166534' : '#991b1b',
  padding: '6px 14px',
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
});

const hr: React.CSSProperties = {
  margin: '20px 0',
};

const jsonBlock: React.CSSProperties = {
  background: '#020617',
  color: '#e5e7eb',
  padding: 16,
  borderRadius: 8,
  overflowX: 'auto',
  fontSize: 12,
  marginTop: 12,
};
