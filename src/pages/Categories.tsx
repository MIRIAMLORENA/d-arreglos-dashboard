import { useEffect, useState } from 'react';
import {
  getAdminCategories,
  deleteCategory,
  createCategory,
  updateCategory,
} from '../services/admin-categories.service';

/* ===============================
   CONFIG CLOUDINARY
   =============================== */
const CLOUDINARY_CLOUD_NAME = 'dd4nvr2ae';
const CLOUDINARY_UPLOAD_PRESET = 'darreglos_upload';


type Category = {
  id: string;
  name: string;
  imageUrl?: string | null;
  description?: string | null; // descripción de la categoría
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Form states
  const [formName, setFormName] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err) {
      setError('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* ===============================
     CLOUDINARY UPLOAD
     =============================== */
  const uploadToCloudinary = async (file: File) => {
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    setUploading(false);

    return data.secure_url as string;
  };

  /* ===============================
     FORM SUBMIT (CREATE / UPDATE)
     =============================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (editingId) {
      await updateCategory(editingId, {
  name: formName,
  imageUrl: formImageUrl || undefined,
  description: formDescription || undefined,
});

    } else {
      await createCategory({
  name: formName,
  imageUrl: formImageUrl || undefined,
  description: formDescription || undefined,
});

    }

    setFormName('');
    setFormImageUrl('');
    setEditingId(null);
    setFormDescription('');

    loadCategories();
  };

  const startEdit = (category: Category) => {
  setEditingId(category.id);
  setFormName(category.name);
  setFormImageUrl(category.imageUrl || '');
  setFormDescription(category.description || '');
};


  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría? Esta acción no se puede deshacer.')) return;
    await deleteCategory(id);
    loadCategories();
  };

  if (loading) return <p>Cargando categorías...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Categorías</h2>

      {/* ===================== */}
      {/* FORMULARIO */}
      {/* ===================== */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          padding: 16,
          marginTop: 16,
          marginBottom: 24,
          borderRadius: 8,
        }}
      >
        <h3>{editingId ? 'Editar categoría' : 'Nueva categoría'}</h3>

        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <input
            type="text"
            placeholder="Nombre"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            style={{ flex: 1 }}
          />

          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              if (!e.target.files?.[0]) return;
              const url = await uploadToCloudinary(e.target.files[0]);
              setFormImageUrl(url);
            }}
          />

          <button type="submit" disabled={uploading}>
            {uploading
              ? 'Subiendo...'
              : editingId
              ? 'Actualizar'
              : 'Crear'}
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
  <textarea
    placeholder="Descripción de la categoría (qué incluye este servicio)"
    value={formDescription}
    onChange={(e) => setFormDescription(e.target.value)}
    rows={3}
    style={{
      width: '100%',
      padding: 8,
      resize: 'vertical',
    }}
  />
</div>


        {formImageUrl && (
          <div style={{ marginTop: 12 }}>
            <strong>Preview ícono:</strong>
            <div
              style={{
                marginTop: 8,
                width: 48,
                height: 48,
                background: '#f3f4f6',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={formImageUrl}
                alt="preview"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
          </div>
        )}

        {editingId && (
  <button
    type="button"
    onClick={() => {
      setEditingId(null);
      setFormName('');
      setFormImageUrl('');
      setFormDescription('');
    }}
    style={{ marginTop: 8 }}
  >
    Cancelar edición
  </button>
)}

      </form>

      {/* ===================== */}
      {/* TABLA */}
      {/* ===================== */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: '#fff',
        }}
      >
        <thead>
          <tr>
            <th style={th}>Ícono</th>
            <th style={th}>Nombre</th>
            <th style={th}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((c) => {

            return (
              <tr key={c.id}>
                <td style={td}>
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      style={{
                        width: 36,
                        height: 36,
                        objectFit: 'contain',
                        background: '#f3f4f6',
                        borderRadius: 6,
                        padding: 4,
                      }}
                    />
                  ) : (
                    '—'
                  )}
                </td>

                <td style={td}>
  <div style={{ fontWeight: 500 }}>{c.name}</div>

  {c.description && (
    <div
      style={{
        marginTop: 4,
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 1.4,
      }}
    >
      {c.description}
    </div>
  )}
</td>



                <td style={td}>
  <div
    style={{
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
    }}
  >
    <button
      onClick={() => startEdit(c)}
    >
      Editar
    </button>

    <button
      onClick={() => handleDelete(c.id)}
      style={{ color: '#dc2626' }}
    >
      Eliminar
    </button>
  </div>
</td>

              </tr>
            );
          })}
        </tbody>
      </table>
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
