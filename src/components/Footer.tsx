const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', padding: '2rem', marginTop: '2rem', borderTop: '1px solid #eee', color: '#666' }}>
      <p>© {new Date().getFullYear()} Kt'i. Tous droits réservés.</p>
      {/* Les liens vers les mentions légales et CGV viendront ici plus tard */}
    </footer>
  );
};
export default Footer;