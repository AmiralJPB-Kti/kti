import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Head from 'next/head';

interface Material {
  id: string;
  name: string;
  unit_cost: number;
  purchase_unit: string;
  quantity_in_unit: number;
  current_stock: number;
  low_stock_threshold: number;
  notes: string | null;
}

export default function AtelierStocks() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Material>>({
    name: '',
    unit_cost: 0,
    purchase_unit: 'mètre',
    quantity_in_unit: 1,
    current_stock: 0,
    low_stock_threshold: 0,
    notes: ''
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/admin/atelier/materials');
      if (!res.ok) throw new Error('Impossible de charger les matériaux');
      const data = await res.json();
      setMaterials(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/atelier/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Erreur lors de l\'enregistrement');
      
      await fetchMaterials();
      setShowForm(false);
      setFormData({
        name: '',
        unit_cost: 0,
        purchase_unit: 'mètre',
        quantity_in_unit: 1,
        current_stock: 0,
        low_stock_threshold: 0,
        notes: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce matériau ?')) return;
    try {
      const res = await fetch(`/api/admin/atelier/materials?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchMaterials();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Calcul du coût à l'unité de consommation (ex: prix au mètre ou à la pièce)
  const getUnitCostDetail = (material: Material) => {
    const costPerConsUnit = material.unit_cost / material.quantity_in_unit;
    return `${costPerConsUnit.toFixed(3)} € / ${material.purchase_unit === 'mètre' ? 'cm' : 'u'}`;
  };

  return (
    <AdminLayout>
      <Head>
        <title>Gestion des Stocks - Atelier Kti</title>
      </Head>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Kaushan Script, cursive', color: '#2C2C2C', margin: 0 }}>Gestion des Stocks & Matériaux</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ background: '#0055A4', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '4px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {showForm ? 'Annuler' : '+ Nouveau Matériau'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #ddd' }}>
            <h3 style={{ marginTop: 0 }}>Ajouter une matière première</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Nom du Matériau</label>
                <input 
                  type="text" required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem' }} 
                  placeholder="ex: Tissu Liberty, Zip 20cm..."
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Coût d'Achat Global (€)</label>
                <input 
                  type="number" step="0.01" required 
                  value={formData.unit_cost}
                  onChange={e => setFormData({...formData, unit_cost: parseFloat(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Unité d'Achat</label>
                <select 
                  value={formData.purchase_unit}
                  onChange={e => setFormData({...formData, purchase_unit: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="mètre">Mètre (linéaire)</option>
                  <option value="unité">Unité (pièce)</option>
                  <option value="lot">Lot (paquet)</option>
                  <option value="bobine">Bobine (fil)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Qté dans l'Unité (ex: 100 pour 1m)</label>
                <input 
                  type="number" step="0.1" required 
                  value={formData.quantity_in_unit}
                  onChange={e => setFormData({...formData, quantity_in_unit: parseFloat(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem' }} 
                />
                <small style={{ color: '#666' }}>Si mètre, mettre 100 pour cm.</small>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Stock Actuel</label>
                <input 
                  type="number" step="0.1" 
                  value={formData.current_stock}
                  onChange={e => setFormData({...formData, current_stock: parseFloat(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Seuil Alerte</label>
                <input 
                  type="number" step="0.1" 
                  value={formData.low_stock_threshold}
                  onChange={e => setFormData({...formData, low_stock_threshold: parseFloat(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem' }} 
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem' }}>Notes</label>
                <textarea 
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem' }} 
                />
              </div>
              <button type="submit" style={{ gridColumn: '1 / -1', background: '#28a745', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Enregistrer le Matériau
              </button>
            </form>
          </div>
        )}

        {loading && !materials.length ? (
          <p>Chargement des stocks...</p>
        ) : (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f4f4f4' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Nom</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Prix Achat</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Coût Unit.</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Stock</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => {
                  const isLow = m.current_stock <= m.low_stock_threshold;
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{m.name}</div>
                        <div style={{ fontSize: '0.8em', color: '#666' }}>{m.notes}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {m.unit_cost.toFixed(2)} € / {m.purchase_unit}
                      </td>
                      <td style={{ padding: '1rem', color: '#0055A4', fontWeight: 'bold' }}>
                        {getUnitCostDetail(m)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '0.25rem 0.6rem', 
                          borderRadius: '12px', 
                          fontWeight: 'bold',
                          background: isLow ? '#ffebee' : '#e8f5e9',
                          color: isLow ? '#c62828' : '#2e7d32',
                          border: `1px solid ${isLow ? '#ef9a9a' : '#a5d6a7'}`
                        }}>
                          {m.current_stock} {m.purchase_unit === 'mètre' ? 'cm' : 'u'}
                        </span>
                        {isLow && <div style={{ fontSize: '0.7em', color: '#c62828', marginTop: '4px' }}>Réappro nécessaire !</div>}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            onClick={() => startEdit(m)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                            title="Modifier"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => deleteMaterial(m.id)}
                            style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '1.2rem' }}
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {materials.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                Votre inventaire est vide. Commencez par ajouter vos tissus et accessoires !
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
