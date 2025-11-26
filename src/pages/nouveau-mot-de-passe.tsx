
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@/lib/supabase/client';
import styles from '@/styles/Home.module.css';
import Header from '@/components/Header';

const NouveauMotDePasse = () => {
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Ce listener permet à Supabase de gérer l'échange de token (Hash -> Session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log("Mode récupération de mot de passe détecté");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    // 0. Get user email before update (needed for notification)
    const { data: { user } } = await supabase.auth.getUser();
    
    // Safety check: if session was lost right before this call or never established
    if (!user) {
      setError("Erreur de session. Le lien est invalide ou a expiré. Veuillez refaire une demande de mot de passe oublié.");
      setLoading(false);
      return;
    }
    
    const userEmail = user.email;

    // 1. Mise à jour du mot de passe grâce à la session temporaire
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      // Display the actual error message from Supabase for debugging
      setError(updateError.message);
      console.error('Error updating password:', updateError.message);
    } else {
      // 1.5 Send Notification Email (Async, non-blocking)
      if (userEmail) {
        fetch('/api/send-password-changed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
        }).catch(err => console.error("Failed to send password notification:", err));
      }

      // 2. Déconnexion immédiate pour détruire la session temporaire
      await supabase.auth.signOut();
      
      setMessage('Votre mot de passe a été mis à jour. Vous allez être redirigé vers la page de connexion.');
      
      // 3. Redirection vers la page de connexion
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
    
    setLoading(false);
  };

  if (!isSessionReady) {
    return (
      <>
        <Header forceLoggedOut={true} />
        <main className={styles.main}>
          <div className={styles.container}>
             <p style={{textAlign: 'center', padding: '2rem'}}>🔍 Vérification du lien de sécurité en cours...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header forceLoggedOut={true} />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Choisir un nouveau mot de passe</h1>

          <form onSubmit={handleUpdatePassword} className={styles.form}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={styles.input}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                style={{ height: '1rem', width: '1rem' }}
              />
              <label htmlFor="showPassword" style={{ marginBottom: 0, userSelect: 'none', fontWeight: 'normal' }}>Afficher les mots de passe</label>
            </div>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>

          {message && <p className={styles.successMessage}>{message}</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
      </main>
    </>
  );
};

export default NouveauMotDePasse;
