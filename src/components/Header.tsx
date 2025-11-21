import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';
import CartIcon from './CartIcon';
import { createClient } from '@/lib/supabase/client'; // Import Supabase client

interface HeaderProps {
  forceLoggedOut?: boolean;
}

const Header: React.FC<HeaderProps> = ({ forceLoggedOut = false }) => {
  const { itemCount } = useCart();
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // State to hold user info

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login'); // Redirect to login page after logout
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 0',
      backgroundColor: 'var(--color-heading)', // Dark background
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0, width: '100%' }}>
        <Link href="/" passHref>
          <Logo />
        </Link>
        <nav>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <li><Link href="/" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontWeight: 'bold' }}>Accueil</Link></li>
            <li><Link href="/produits" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontWeight: 'bold' }}>Produits</Link></li>
            <li><Link href="/a-propos" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontWeight: 'bold' }}>Mon Histoire</Link></li>
            <li><Link href="/contact" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontWeight: 'bold' }}>Contact</Link></li>
            {user && !forceLoggedOut ? (
              <>
                <li><Link href="/mon-compte" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontWeight: 'bold' }}>Mon Compte</Link></li>
                <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--color-accent-white)', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Déconnexion</button></li>
              </>
            ) : (
              <li><Link href="/login" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontWeight: 'bold' }}>Connexion</Link></li>
            )}
            <li>
              <Link href="/panier" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <CartIcon />
                {itemCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-12px',
                    backgroundColor: 'var(--color-accent-red)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}>
                    {itemCount}
                  </span>
                )}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;


