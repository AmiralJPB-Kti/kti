import { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Head from 'next/head';
import { manualNewsletterTemplate } from '@/lib/email-templates';

export default function AdminNewsletter() {
  const [formData, setFormData] = useState({
    subject: 'Nouvelles de Kt\'i',
    title: 'Bonjour !',
    message: 'Voici les dernières nouvelles...', // Les retours à la ligne sont conservés.
    imageUrl: '',
    buttonText: 'Voir la boutique',
    buttonLink: 'https://kti.badie.eu/produits'
  });

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<{ field: 'message' | 'subject' | null }>({ field: null });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSuggestSubject = async () => {
    if (!formData.message && !formData.title) {
      alert("Écrivez d'abord un petit message ou un titre pour que je puisse suggérer un sujet pertinent !");
      return;
    }

    setGenerating({ field: 'subject' });
    try {
      const res = await fetch('/api/admin/newsletter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Titre: ${formData.title}\nMessage: ${formData.message}`,
          type: 'subject'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur IA');
      
      // On propose les choix à l'utilisateur
      const choices = data.generatedText.split('\n').filter((l: string) => l.trim().length > 0);
      const choice = prompt(
        "Voici 3 idées de sujets générées par l'IA.\nCopiez celui qui vous plait ou tapez le numéro (1-3) pour l'appliquer automatiquement :\n\n" + 
        choices.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')
      );

      if (choice) {
        const index = parseInt(choice) - 1;
        if (!isNaN(index) && choices[index]) {
            setFormData(prev => ({ ...prev, subject: choices[index].replace(/^\d+\.\s*/, '').replace(/^-\s*/, '') }));
        } else if (choice.length > 3) {
            setFormData(prev => ({ ...prev, subject: choice }));
        }
      }

    } catch (error: any) {
      alert("Erreur IA : " + error.message);
    } finally {
      setGenerating({ field: null });
    }
  };

  const handleGenerateMessage = async () => {
    if (!formData.message || formData.message.length < 5) {
      alert("Écrivez quelques mots en vrac dans la zone de message pour donner une base à l'IA.");
      return;
    }

    setGenerating({ field: 'message' });
    try {
      const res = await fetch('/api/admin/newsletter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: formData.message,
          type: 'message'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur IA');

      if (confirm("L'IA a proposé une nouvelle version. Voulez-vous remplacer votre texte actuel ?\n\n(Annuler pour garder votre texte)")) {
        setFormData(prev => ({ ...prev, message: data.generatedText }));
      }

    } catch (error: any) {
      alert("Erreur IA : " + error.message);
    } finally {
      setGenerating({ field: null });
    }
  };

  const handleSendTest = async () => {
    const testEmail = prompt("À quelle adresse envoyer le test ?", "votre-email@exemple.com");
    if (!testEmail) return;

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'test',
          testEmail
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'envoi');

      setStatus({ type: 'success', message: `Test envoyé à ${testEmail} ! Vérifiez vos spams.` });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSendBlast = async () => {
    if (!confirm("ATTENTION : Vous allez envoyer cet email à TOUS les abonnés actifs.\n\nÊtes-vous sûr ?")) return;
    
    const confirmation = prompt("Pour confirmer, tapez 'ENVOYER' en majuscules :");
    if (confirmation !== 'ENVOYER') {
        alert("Envoi annulé.");
        return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'broadcast'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'envoi');

      setStatus({ type: 'success', message: `Newsletter envoyée avec succès à ${data.count} abonnés !` });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Generate preview HTML safely (for visual check only)
  const previewHtml = manualNewsletterTemplate(
      formData.title,
      formData.message,
      formData.imageUrl || null,
      formData.buttonText,
      formData.buttonLink,
      'PREVIEW_ID'
  );

  return (
    <AdminLayout>
      <Head>
        <title>Générateur de Newsletter - Admin Kt\'i</title>
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#1F2937' }}>💌 Générateur de Newsletter</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          
          {/* Formulaire */}
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>1. Configuration</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Sujet de l'email (Vu dans la boîte de réception)
                  <button 
                    onClick={handleSuggestSubject}
                    disabled={generating.field === 'subject'}
                    style={{ 
                      marginLeft: '10px', 
                      fontSize: '0.8rem', 
                      padding: '2px 8px', 
                      cursor: 'pointer',
                      backgroundColor: '#EEF2FF',
                      border: '1px solid #6366F1',
                      color: '#4338CA',
                      borderRadius: '12px'
                    }}
                  >
                    {generating.field === 'subject' ? 'Thinking...' : '💡 Idées IA'}
                  </button>
                </label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Grand Titre (Dans l'email)</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontWeight: 'bold' }}>Votre Message</label>
                    <button 
                        onClick={handleGenerateMessage}
                        disabled={generating.field === 'message'}
                        style={{ 
                        fontSize: '0.85rem', 
                        padding: '4px 10px', 
                        cursor: 'pointer',
                        backgroundColor: '#F0FDF4', // Vert très clair
                        border: '1px solid #16A34A', // Vert
                        color: '#15803D',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                        }}
                    >
                        {generating.field === 'message' ? 'Réécriture...' : '✨ Améliorer avec l\'IA'}
                    </button>
                </div>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={8}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'sans-serif' }}
                />
                <small style={{ color: '#666' }}>Les retours à la ligne sont conservés.</small>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>URL Image (Optionnel)</label>
                <input 
                  type="text" 
                  name="imageUrl"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Texte Bouton</label>
                  <input 
                    type="text" 
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Lien Bouton</label>
                  <input 
                    type="text" 
                    name="buttonLink"
                    value={formData.buttonLink}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Prévisualisation et Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>2. Aperçu (Approximatif)</h2>
              <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                {/* Render HTML Preview inside an iframe to isolate styles or just a div if simple */}
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '2px solid #E5E7EB' }}>
               <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#DC2626' }}>3. Zone d'Envoi</h2>
               
               {status.message && (
                 <div style={{ 
                   padding: '1rem', 
                   marginBottom: '1rem',
                   borderRadius: '4px',
                   backgroundColor: status.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                   color: status.type === 'success' ? '#065F46' : '#991B1B'
                 }}>
                   {status.message}
                 </div>
               )}

               <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                 <button
                   onClick={handleSendTest}
                   disabled={loading}
                   style={{
                     padding: '12px',
                     backgroundColor: '#4B5563',
                     color: 'white',
                     border: 'none',
                     borderRadius: '6px',
                     fontSize: '1rem',
                     cursor: loading ? 'not-allowed' : 'pointer',
                     opacity: loading ? 0.7 : 1
                   }}
                 >
                   {loading ? 'Envoi...' : '🧪 M\'envoyer un TEST d\'abord'}
                 </button>

                 <button
                   onClick={handleSendBlast}
                   disabled={loading}
                   style={{
                     padding: '15px',
                     backgroundColor: '#DC2626',
                     color: 'white',
                     border: 'none',
                     borderRadius: '6px',
                     fontWeight: 'bold',
                     fontSize: '1.1rem',
                     cursor: loading ? 'not-allowed' : 'pointer',
                     opacity: loading ? 0.7 : 1
                   }}
                 >
                   {loading ? 'Envoi en cours...' : '🚀 ENVOYER À TOUS LES ABONNÉS'}
                 </button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
