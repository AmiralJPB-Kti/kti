import { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Head from 'next/head';

export default function AdminAssistant() {
  const [mode, setMode] = useState('social_post');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const modes = [
    { id: 'social_post', label: '📱 Post Réseaux Sociaux', desc: 'Instagram, Facebook (avec émojis & hashtags)' },
    { id: 'payment_reminder', label: '💸 Relance Paiement', desc: 'Pour les clients en retard (doux ou ferme)' },
    { id: 'supplier_order', label: '📦 Commande Fournisseur', desc: 'Demande de devis ou commande matière' },
    { id: 'support_reply', label: '🤝 Réponse SAV / Client', desc: 'Répondre à une question ou une plainte' },
    { id: 'correction', label: '✍️ Correction Simple', desc: 'Juste corriger les fautes et le style' },
  ];

  const handleGenerate = async () => {
    if (!input.trim()) return alert("Donnez-moi un peu de contexte d'abord !");
    
    setLoading(true);
    setCopied(false);
    
    try {
      const res = await fetch('/api/admin/assistant/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, mode })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setOutput(data.generatedText);
    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Assistant IA - Admin Kt'i</title>
      </Head>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#1F2937' }}>🧠 Assistant Intelligent</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Dites-moi ce que vous voulez dire, je m'occupe de la rédaction.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
          
          {/* COLONNE GAUCHE : ENTRÉE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* 1. Choix du Mode */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '1rem' }}>1. Que voulez-vous écrire ?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {modes.map(m => (
                  <label 
                    key={m.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      padding: '10px',
                      border: mode === m.id ? '2px solid #2563EB' : '1px solid #eee',
                      backgroundColor: mode === m.id ? '#EFF6FF' : 'white',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="mode" 
                      value={m.id} 
                      checked={mode === m.id} 
                      onChange={(e) => setMode(e.target.value)}
                      style={{ accentColor: '#2563EB' }}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>{m.label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Contexte */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>2. Donnez-moi le contexte (en vrac)</label>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: Retard paiement M. Martin facture 102, 50 euros. C'est la 2ème relance, soyez un peu ferme."
                rows={6}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  border: '1px solid #ddd', 
                  fontFamily: 'sans-serif',
                  resize: 'vertical'
                }}
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '10px'
                }}
              >
                {loading ? 'Rédaction en cours...' : '✨ Générer le texte'}
              </button>
            </div>

          </div>

          {/* COLONNE DROITE : SORTIE */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold' }}>Résultat :</label>
                {output && (
                  <button 
                    onClick={handleCopy}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.9rem',
                      backgroundColor: copied ? '#059669' : '#E5E7EB',
                      color: copied ? 'white' : '#374151',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copied ? 'Copié ! ✅' : '📋 Copier'}
                  </button>
                )}
              </div>
              
              <textarea 
                readOnly={false} // On laisse l'user modifier s'il veut ajuster avant de copier
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="Le texte généré apparaîtra ici..."
                style={{ 
                  flex: 1,
                  width: '100%', 
                  padding: '15px', 
                  borderRadius: '6px', 
                  border: '1px solid #ddd', 
                  fontFamily: 'sans-serif',
                  backgroundColor: '#FAFAFA',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  resize: 'none',
                  minHeight: '400px'
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
