import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Head from 'next/head';

interface Material {
  id: string;
  name: string;
  unit_cost: number;
  quantity_in_unit: number;
  purchase_unit: string;
}

interface TemplateMaterial {
  material_id: string;
  quantity_used: number;
  materials?: Material; // Pour l'affichage
}

interface CreationTemplate {
  id: string;
  name: string;
  description: string | null;
  labor_cost_per_unit: number;
  overhead_cost_per_unit: number;
  margin_percent: number;
  creation_materials: TemplateMaterial[];
}

export default function AtelierModeles() {
  const [templates, setTemplates] = useState<CreationTemplate[]>([]);
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreationTemplate>>({
    name: '',
    description: '',
    labor_cost_per_unit: 15, // Valeur par défaut
    overhead_cost_per_unit: 2,
    margin_percent: 50,
    creation_materials: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, mRes] = await Promise.all([
        fetch('/api/admin/atelier/templates'),
        fetch('/api/admin/atelier/materials')
      ]);
      const [tData, mData] = await Promise.all([tRes.json(), mRes.json()]);
      setTemplates(tData);
      setMaterialsList(mData);
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  };

  const addMaterialRow = () => {
    setFormData({
      ...formData,
      creation_materials: [...(formData.creation_materials || []), { material_id: '', quantity_used: 1 }]
    });
  };

  const removeMaterialRow = (index: number) => {
    const newMats = [...(formData.creation_materials || [])];
    newMats.splice(index, 1);
    setFormData({ ...formData, creation_materials: newMats });
  };

  const updateMaterialRow = (index: number, field: keyof TemplateMaterial, value: any) => {
    const newMats = [...(formData.creation_materials || [])];
    newMats[index] = { ...newMats[index], [field]: value };
    setFormData({ ...formData, creation_materials: newMats });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { ...formData, id: editingId } : formData;

    try {
      const res = await fetch('/api/admin/atelier/templates', {
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
      labor_cost_per_unit: 15,
      overhead_cost_per_unit: 2,
      margin_percent: 50,
      creation_materials: []
    });
  };

  const startEdit = (template: CreationTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      description: template.description,
      labor_cost_per_unit: template.labor_cost_per_unit,
      overhead_cost_per_unit: template.overhead_cost_per_unit,
      margin_percent: template.margin_percent,
      creation_materials: template.creation_materials.map(m => ({
        material_id: m.material_id,
        quantity_used: m.quantity_used
      }))
    });
    setShowForm(true);
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Supprimer ce modèle ?')) return;
    await fetch(`/api/admin/atelier/templates?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  // Logique de Calcul
  const calculateCosts = (templateMats: TemplateMaterial[], labor: number, overhead: number, margin: number) => {
    let materialsCost = 0;
    templateMats.forEach(tm => {
      const mat = materialsList.find(m => m.id === tm.material_id);
      if (mat) {
        materialsCost += (mat.unit_cost / mat.quantity_in_unit) * tm.quantity_used;
      }
    });

    const costPrice = materialsCost + (Number(labor) || 0) + (Number(overhead) || 0);
    const suggestedPrice = costPrice * (1 + (Number(margin) || 0) / 100);

    return { materialsCost, costPrice, suggestedPrice };
  };

  return (
    <AdminLayout>
      <Head>
        <title>Modèles de Création - Atelier Kti</title>
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Kaushan Script, cursive', color: '#2C2C2C', margin: 0 }}>Modèles & Recettes</h1>
          <button 
            onClick={() => { showForm ? resetForm() : setShowForm(true) }}
            style={{ background: '#0055A4', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '4px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {showForm ? 'Annuler' : '+ Nouveau Modèle'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #ddd' }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? 'Modifier le modèle' : 'Créer un nouveau modèle de sac'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Nom du Modèle</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.6rem' }} placeholder="ex: Sac 'L'Élégant'" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Main d'œuvre (€)</label>
                  <input type="number" step="0.5" value={formData.labor_cost_per_unit} onChange={e => setFormData({...formData, labor_cost_per_unit: parseFloat(e.target.value)})} style={{ width: '100%', padding: '0.6rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Frais Fixes (€)</label>
                  <input type="number" step="0.1" value={formData.overhead_cost_per_unit} onChange={e => setFormData({...formData, overhead_cost_per_unit: parseFloat(e.target.value)})} style={{ width: '100%', padding: '0.6rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Marge (%)</label>
                  <input type="number" value={formData.margin_percent} onChange={e => setFormData({...formData, margin_percent: parseFloat(e.target.value)})} style={{ width: '100%', padding: '0.6rem' }} />
                </div>
              </div>

              <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '6px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0 }}>Composants & Matériaux</h4>
                  <button type="button" onClick={addMaterialRow} style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}>+ Ajouter un matériau</button>
                </div>

                {formData.creation_materials?.map((row, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '1rem', marginBottom: '0.8rem', alignItems: 'center' }}>
                    <select 
                      required 
                      value={row.material_id} 
                      onChange={e => updateMaterialRow(index, 'material_id', e.target.value)}
                      style={{ padding: '0.5rem' }}
                    >
                      <option value="">-- Choisir une matière --</option>
                      {materialsList.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.purchase_unit === 'mètre' ? 'cm' : 'u'})</option>
                      ))}
                    </select>
                    <input 
                      type="number" step="0.1" required 
                      value={row.quantity_used} 
                      onChange={e => updateMaterialRow(index, 'quantity_used', parseFloat(e.target.value))}
                      style={{ padding: '0.5rem' }} 
                      placeholder="Qté"
                    />
                    <div style={{ color: '#666', fontSize: '0.9em' }}>
                      {(() => {
                        const m = materialsList.find(mat => mat.id === row.material_id);
                        if (!m) return '0.00 €';
                        const cost = (m.unit_cost / m.quantity_in_unit) * row.quantity_used;
                        return `${cost.toFixed(2)} €`;
                      })()}
                    </div>
                    <button type="button" onClick={() => removeMaterialRow(index)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                  </div>
                ))}
              </div>

              {/* Résumé en direct */}
              <div style={{ borderTop: '2px solid #eee', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '3rem', textAlign: 'right' }}>
                <div>
                  <div style={{ color: '#666', fontSize: '0.9em' }}>Coût Matières</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{calculateCosts(formData.creation_materials || [], 0, 0, 0).materialsCost.toFixed(2)} €</div>
                </div>
                <div>
                  <div style={{ color: '#0055A4', fontWeight: 'bold' }}>PRIX DE REVIENT</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#0055A4' }}>
                    {calculateCosts(formData.creation_materials || [], formData.labor_cost_per_unit || 0, formData.overhead_cost_per_unit || 0, formData.margin_percent || 0).costPrice.toFixed(2)} €
                  </div>
                </div>
                <div>
                  <div style={{ color: '#28a745', fontWeight: 'bold' }}>PRIX DE VENTE SUGGÉRÉ</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.8rem', color: '#28a745' }}>
                    {calculateCosts(formData.creation_materials || [], formData.labor_cost_per_unit || 0, formData.overhead_cost_per_unit || 0, formData.margin_percent || 0).suggestedPrice.toFixed(2)} €
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', background: '#2C2C2C', color: 'white', padding: '1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '2rem', fontSize: '1.1rem' }}>
                {loading ? 'Enregistrement...' : editingId ? 'Mettre à jour le Modèle' : 'Enregistrer le Modèle'}
              </button>
            </form>
          </div>
        )}

        {/* Liste des Modèles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {templates.map(t => {
            const { costPrice, suggestedPrice } = calculateCosts(t.creation_materials, t.labor_cost_per_unit, t.overhead_cost_per_unit, t.margin_percent);
            return (
              <div key={t.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: '#2C2C2C' }}>{t.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => startEdit(t)} style={{ background: '#f0f0f0', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => deleteTemplate(t.id)} style={{ background: '#fff0f0', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
                
                <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '1rem' }}>{t.creation_materials.length} composants utilisés</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #eee' }}>
                    <span>Prix de revient :</span>
                    <span style={{ fontWeight: 'bold' }}>{costPrice.toFixed(2)} €</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed #eee' }}>
                    <span>Marge appliquée :</span>
                    <span>{t.margin_percent}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontSize: '1.2rem' }}>
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>Prix de vente :</span>
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>{suggestedPrice.toFixed(2)} €</span>
                  </div>
                </div>

                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', fontSize: '0.85em' }}>
                  <strong>Aperçu composants :</strong>
                  <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
                    {t.creation_materials.slice(0, 3).map((m, i) => (
                      <li key={i}>{m.materials?.name} ({m.quantity_used}{m.materials?.purchase_unit === 'mètre' ? 'cm' : 'u'})</li>
                    ))}
                    {t.creation_materials.length > 3 && <li>... (+{t.creation_materials.length - 3} autres)</li>}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {templates.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
            Aucun modèle enregistré. Cliquez sur le bouton bleu pour créer votre première recette de fabrication !
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
