import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Head from 'next/head';

const ADMIN_EMAIL = 'kti@badie.eu';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.email !== ADMIN_EMAIL) {
        // Not admin
        router.push('/login');
      } else {
        setAuthorized(true);
      }
      setLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Chargement...</div>;
  if (!authorized) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Head>
        <title>Admin Kti</title>
      </Head>
      
      {/* Sidebar */}
      <aside style={{ 
        width: '250px', 
        backgroundColor: '#2C2C2C', 
        color: 'white', 
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ fontFamily: 'Kaushan Script, cursive', marginBottom: '2rem', color: '#fff' }}>Kt'i Admin</h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/admin" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem', borderRadius: '4px', backgroundColor: router.pathname === '/admin' ? '#0055A4' : 'transparent' }}>
            📊 Tableau de bord
          </Link>
          <Link href="/admin/offline-order" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem', borderRadius: '4px', backgroundColor: router.pathname === '/admin/offline-order' ? '#0055A4' : 'transparent' }}>
            📝 Saisie Vente (Salon)
          </Link>
          <Link href="/" style={{ color: '#aaa', textDecoration: 'none', padding: '0.5rem', marginTop: '2rem' }}>
            ← Retour au site
          </Link>
          
          <button 
            onClick={handleLogout}
            style={{ 
              marginTop: '0.5rem', 
              background: 'transparent', 
              border: '1px solid #555', 
              color: '#aaa', 
              padding: '0.5rem', 
              cursor: 'pointer',
              borderRadius: '4px',
              textAlign: 'left'
            }}
          >
            Déconnexion
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f5f5f5', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
