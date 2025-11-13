import React from 'react';
import Logo from './Logo';
import Link from 'next/link';

const Header: React.FC = () => {
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
        {/* Navigation will go here */}
        <nav>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '1.5rem' }}>
            <li><Link href="/" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontWeight: 'bold' }}>Accueil</Link></li>
            <li><Link href="/produits" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontWeight: 'bold' }}>Produits</Link></li>
            <li><Link href="/a-propos" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontWeight: 'bold' }}>À Propos</Link></li>
            <li><Link href="/contact" style={{ textDecoration: 'none', color: 'var(--color-accent-white)', fontWeight: 'bold' }}>Contact</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
