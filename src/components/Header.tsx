import React from 'react';
import Logo from './Logo';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import CartIcon from './CartIcon';

const Header: React.FC = () => {
  const { itemCount } = useCart();

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

