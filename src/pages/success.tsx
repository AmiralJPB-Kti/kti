import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';

const SuccessPage = () => {
  const { clearCart } = useCart();
  const supabase = createClient();

  // Clear the cart rigorously once the component mounts
  useEffect(() => {
    const performCleanup = async () => {
      // 1. Clear Context state
      clearCart();

      // 2. Manually clear LocalStorage (Brute force fix)
      // We need to know WHICH key to clear (guest or user)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        localStorage.removeItem(`cart_items_${user.id}`);
      }
      localStorage.removeItem('cart_items_guest'); // Clear guest cart too just in case
    };

    performCleanup();
  }, [clearCart, supabase]);

  return (
    <>
      <Head>
        <title>Merci pour votre commande ! | Kt'i</title>
      </Head>
      <Header />
      <main className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#f9f9f9', padding: '2rem', borderRadius: '8px', border: '1px solid #eee' }}>
          <h1>Merci pour votre commande !</h1>
          <p>Votre paiement a été accepté avec succès.</p>
          <p>Vous recevrez bientôt un e-mail de confirmation avec les détails de votre commande.</p>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/" className="btn btn-primary">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default SuccessPage;
