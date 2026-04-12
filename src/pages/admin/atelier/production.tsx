import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Head from 'next/head';

interface Log {
  id: string;
  creation_template_id: string;
  quantity_produced: number;
  date_produced: string;
  creations_templates: { name: string };
}

interface Template {
  id: string;
  name: string;
}

export default function AtelierProduction() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    creation_template_id: '',
    quantity_produced: 1,
    date_produced: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lRes, tRes] = await Promise.all([
        fetch('/api/admin/atelier/production'),
        fetch('/api/admin/atelier/templates')
      ]);
      const [lData, tData] = await Promise.all([lRes.json(), tRes.json()]);
      setLogs(lData);
      setTemplates(tData);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/atelier/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de l\'enregistrement');
      }
      
      await fetchData();
      setShowForm(false);
      alert('Fabrication enregistrée ! Les stocks ont été mis à jour automatiquement.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <Head>
        <title>Suivi de Production - Atelier Kti</title>
      </Head>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Kaushan Script, cursive', color: '#2C2C2C', margin: 0 }}>Suivi de Production</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ background: '#0055A4', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '4px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {showForm ? 'Fermer' : '+ Nouvelle Fabrication'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0 }}>Qu'avez-vous fabriqué aujourd'hui ?</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Modèle de création</label>
                <select 
                  required 
                  value={formData.creation_template_id} 
                  onChange={e => setFormData({...formData, creation_template_id: e.target.value})}
                  style={{ width: '100%', padding: '0.6rem' }}
                >
                  <option value="">-- Sélectionner un sac --</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Quantité</label>
                <input 
                  type="number" min="1" required 
                  value={formData.quantity_produced}
                  onChange={e => setFormData({...formData, quantity_produced: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: '0.6rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Date</label>
                <input 
                  type="date" required 
                  value={formData.date_produced}
                  onChange={e => setFormData({...formData, date_produced: e.target.value})}
                  style={{ width: '100%', padding: '0.6rem' }}
                />
              </div>
              <button type="submit" disabled={loading} style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                {loading ? '...' : 'Valider'}
              </button>
            </form>
          </div>
        )}

        {/* Historique */}
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f4f4f4' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Modèle fabriqué</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Quantité</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{formatDate(log.date_produced)}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{log.creations_templates?.name}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ background: '#e3f2fd', color: '#0d47a1', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>
                      x {log.quantity_produced}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8em', color: '#666' }}>Déstockage effectué ✓</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && !loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              Aucune fabrication enregistrée. Vos créations s'afficheront ici.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
