import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';

const AccountPage = () => {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login'); // Redirect to login if not authenticated
      } else {
        setUser(user);
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  if (loading) {
    return (
      <>
        <Head><title>Chargement...</title></Head>
        <Header />
        <main className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <p>Chargement des informations utilisateur...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Mon Compte | Kt'i</title>
      </Head>
      <Header />
      <main className="container" style={{ paddingTop: '4rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Mon Compte</h1>
        {user && (
          <div style={{ backgroundColor: '#f9f9f9', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
            <p><strong>Email :</strong> {user.email}</p>
            <p><strong>ID Utilisateur :</strong> {user.id}</p>
            {/* More user details can be added here */}
            <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Mes Informations</h2>
            <p>Ici, vous pourrez gérer vos coordonnées, adresses de livraison, etc.</p>
            <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Mes Commandes</h2>
            <p>Ici, vous pourrez visualiser l'historique et le suivi de vos commandes.</p>
            <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Mes Échanges</h2>
            <p>Ici, vous pourrez consulter vos échanges avec l'artisan.</p>
          </div>
        )}
      </main>
    </>
  );
};

export default AccountPage;
