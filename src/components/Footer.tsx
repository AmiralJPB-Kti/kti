import Link from 'next/link';

const Footer = () => {
  return (
    <footer style={{ 
      textAlign: 'center', 
      padding: '2rem', 
      marginTop: '2rem', 
      borderTop: '1px solid #eee', 
      color: '#666',
      backgroundColor: '#f9f9f9'
    }}>
      <nav style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <Link href="/legal/mentions-legales" style={{ textDecoration: 'none', color: '#666' }}>Mentions Légales</Link>
        <Link href="/legal/cgv" style={{ textDecoration: 'none', color: '#666' }}>CGV</Link>
        <Link href="/contact" style={{ textDecoration: 'none', color: '#666' }}>Contact</Link>
      </nav>
      <p style={{ fontSize: '0.9rem' }}>© {new Date().getFullYear()} Kt'i. Tous droits réservés.</p>
    </footer>
  );
};
export default Footer;