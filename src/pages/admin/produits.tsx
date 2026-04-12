import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Head from 'next/head';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  is_active: boolean;
  is_on_order: boolean;
  creation_template_id: string | null;
  creations_templates?: { name: string };
}

export default function AdminProduits() {
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const supabase = createClient();

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 1,
    images: [],
    is_active: true,
    is_on_order: false,
    creation_template_id: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/atelier/templates')
      ]);
      const [pData, tData] = await Promise.all([pRes.json(), tRes.json()]);
      setProducts(pData);
      setTemplates(tData);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData({
        ...formData,
        images: [...(formData.images || []), publicUrl]
      });
    } catch (err: any) {
      alert('Erreur upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { ...formData, id: editingId } : formData;

    try {
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Erreur lors de l\'enregistrement');
      
      await fetchData();
      resetForm();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 1,
      images: [],
      is_active: true,
      is_on_order: false,
      creation_template_id: null
    });
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData(p);
    setShowForm(true);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit définitivement ?')) return;
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <AdminLayout>
      <Head>
        <title>Gestion des Produits - Boutique Kti</title>
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Kaushan Script, cursive', color: '#2C2C2C', margin: 0 }}>Gestion de la Boutique</h1>
          <button 
            onClick={() => { showForm ? resetForm() : setShowForm(true) }}
            style={{ background: '#0055A4', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '4px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {showForm ? 'Annuler' : '+ Nouveau Produit'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #ddd' }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? 'Modifier le sac' : 'Mettre en vente une nouvelle création'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Nom du Sac / Création</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.6rem' }} placeholder="ex: Sac 'L'Aventurière' en lin" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Prix de vente (€)</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} style={{ width: '100%', padding: '0.6rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Stock Initial</label>
                  <input type="number" step="1" required value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.6rem' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Description</label>
                <textarea 
                  rows={4} 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  style={{ width: '100%', padding: '0.6rem', fontFamily: 'inherit' }} 
                  placeholder="Détails du produit, dimensions, matières..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Lien avec l'Atelier (optionnel)</label>
                  <select 
                    value={formData.creation_template_id || ''} 
                    onChange={e => setFormData({...formData, creation_template_id: e.target.value || null})}
                    style={{ width: '100%', padding: '0.6rem' }}
                  >
                    <option value="">-- Non lié à un modèle --</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <small style={{ color: '#666' }}>Permettra le déstockage automatique des matières premières.</small>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', paddingTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                    En ligne sur le site
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.is_on_order} onChange={e => setFormData({...formData, is_on_order: e.target.checked})} />
                    Sur Commande uniquement
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '1rem' }}>Photos du produit</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  {formData.images?.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                      <img src={url} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}>×</button>
                    </div>
                  ))}
                  <label style={{ width: '100px', height: '100px', border: '2px dashed #ccc', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', fontSize: '24px', color: '#999' }}>
                    {uploading ? '...' : '+'}
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading || uploading} style={{ width: '100%', background: '#2C2C2C', color: 'white', padding: '1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
                {loading ? 'Enregistrement...' : editingId ? 'Mettre à jour le Produit' : 'Mettre en Ligne'}
              </button>
            </form>
          </div>
        )}

        {/* Liste des Produits */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #eee', position: 'relative' }}>
              {!p.is_active && (
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#666', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75em', zIndex: 1 }}>Brouillon / Hors ligne</div>
              )}
              <div style={{ height: '200px', background: '#f8f8f8' }}>
                {p.images && p.images[0] ? (
                  <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>Aucune photo</div>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{p.name}</h3>
                  <div style={{ fontWeight: 'bold', color: '#0055A4' }}>{p.price.toFixed(2)} €</div>
                </div>
                <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '1rem', minHeight: '3em' }}>
                  {p.description ? p.description.substring(0, 60) + '...' : 'Pas de description.'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9em' }}>
                  <div>
                    Stock: <span style={{ fontWeight: 'bold', color: p.stock > 0 ? '#28a745' : '#dc3545' }}>{p.stock}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => startEdit(p)} style={{ background: '#f0f0f0', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }} title="Modifier">✏️</button>
                    <button onClick={() => deleteProduct(p.id)} style={{ background: '#fff0f0', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }} title="Supprimer">🗑️</button>
                  </div>
                </div>
                {p.creations_templates && (
                  <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid #eee', fontSize: '0.75em', color: '#0055A4' }}>
                    🧵 Modèle Atelier : {p.creations_templates.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
            Boutique vide. Votre sœur peut ajouter son premier sac en cliquant sur le bouton bleu !
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
