import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestConfig() {
  const [status, setStatus] = useState<any>({});

  useEffect(() => {
    const supabase = createClient();
    
    // Check session
    supabase.auth.getSession().then(({ data }) => {
      setStatus((prev: any) => ({
        ...prev,
        session: data.session ? `Connecté: ${data.session.user.email}` : 'Non connecté',
      }));
    });

    // Check env vars (Client side)
    setStatus((prev: any) => ({
      ...prev,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK (Défini)' : 'ERREUR: MANQUANT',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK (Défini)' : 'ERREUR: MANQUANT',
        NEXT_PUBLIC_ADMIN_EMAILS: process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'ATTENTION: MANQUANT OU VIDE',
      }
    }));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Diagnostic Configuration Vercel</h1>
      <div style={{ backgroundColor: '#f4f4f4', padding: '1rem', borderRadius: '5px' }}>
        <pre>{JSON.stringify(status, null, 2)}</pre>
      </div>
      <p>
        <strong>Instructions :</strong><br/>
        1. Si une variable est marquée "MANQUANT", allez dans Vercel &gt; Settings &gt; Environment Variables.<br/>
        2. Assurez-vous qu'elles sont bien définies pour l'environnement "Production".<br/>
        3. Une fois le test fini, demandez-moi de supprimer cette page.
      </p>
    </div>
  );
}
