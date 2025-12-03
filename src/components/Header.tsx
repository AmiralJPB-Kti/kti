import React, { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCart } from '@/context/CartContext';
import CartIcon from './CartIcon';
import SearchIcon from './SearchIcon';
import { createClient } from '@/lib/supabase/client'; // Import Supabase client

interface HeaderProps {
  forceLoggedOut?: boolean;
}

const Header: React.FC<HeaderProps> = ({ forceLoggedOut = false }) => {
  const { itemCount } = useCart();
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // State to hold user info

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login'); // Redirect to login page after logout
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(searchTerm)}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.8rem 0',
      backgroundColor: 'rgba(44, 44, 44, 0.85)', // Dark anthracite with transparency (matches --color-heading)
      backdropFilter: 'blur(10px)', // Glass effect
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', width: '100%', flexWrap: 'wrap' }}>
        <Link href="/" passHref>
          <Logo />
        </Link>
        <nav>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <li><Link href="/" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontFamily: 'var(--font-headings)', fontSize: '1.2rem', letterSpacing: '0.5px' }}>Accueil</Link></li>
            <li><Link href="/produits" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontFamily: 'var(--font-headings)', fontSize: '1.2rem', letterSpacing: '0.5px' }}>Produits</Link></li>
            <li><Link href="/a-propos" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontFamily: 'var(--font-headings)', fontSize: '1.2rem', letterSpacing: '0.5px' }}>L'Atelier</Link></li>
            
            {user && !forceLoggedOut ? (
              <>
                <li><Link href="/mon-compte" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontFamily: 'var(--font-headings)', fontSize: '1.2rem' }}>Compte</Link></li>
                <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--color-accent-white)', fontFamily: 'var(--font-headings)', fontSize: '1.2rem', cursor: 'pointer' }}>Déconnexion</button></li>
              </>
            ) : (
              <li><Link href="/login" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontFamily: 'var(--font-headings)', fontSize: '1.2rem' }}>Connexion</Link></li>
            )}

            {/* Search Bar Component */}
            <li style={{ display: 'flex', alignItems: 'center' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Rechercher..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: isSearchOpen ? '150px' : '0',
                            padding: isSearchOpen ? '5px 10px' : '0',
                            border: isSearchOpen ? '1px solid #ccc' : 'none',
                            borderRadius: '20px',
                            outline: 'none',
                            transition: 'all 0.3s ease-in-out',
                            opacity: isSearchOpen ? 1 : 0,
                            pointerEvents: isSearchOpen ? 'auto' : 'none',
                            backgroundColor: '#fff',
                            color: '#333',
                            marginRight: '5px',
                            fontFamily: 'var(--font-body)'
                        }}
                    />
                    <button 
                        type="button" // Make it type button so it doesn't submit form on click unless intended
                        onClick={isSearchOpen && !searchTerm ? toggleSearch : (isSearchOpen ? handleSearchSubmit : toggleSearch) as any} 
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--color-accent-white)', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '5px'
                        }}
                        aria-label="Rechercher"
                    >
                        <SearchIcon size={22} />
                    </button>
                </form>
            </li>

            <li>
              <Link href="/panier" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <CartIcon />
                {itemCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-10px',
                    backgroundColor: 'var(--color-accent-red)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-body)'
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