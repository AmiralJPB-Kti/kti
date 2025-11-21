

import { useState, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Head from 'next/head';
import Link from 'next/link';

const InscriptionPage = () => {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for show/hide password

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setMessage('Inscription réussie ! Veuillez vérifier votre e-mail pour confirmer votre compte.');
      // Optionally redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Inscription | Kt'i</title>
      </Head>
      <Header />
      <main className="container" style={{ paddingTop: '4rem', maxWidth: '480px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Inscription</h1>
        <form onSubmit={handleSignUp} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="email">Adresse e-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="password">Mot de passe</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

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

          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}
          {message && (
            <div style={styles.successMessage}>
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={styles.button} disabled={loading}>
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p>Déjà un compte ? <Link href="/login" style={styles.link}>Connectez-vous</Link></p>
        </div>
      </main>
    </>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '1.5rem',
    backgroundColor: '#f9f9f9',
    padding: '2rem',
    borderRadius: '8px',
    border: '1px solid #eee',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as 'column',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  button: {
    padding: '1rem',
    fontSize: '1.1rem',
    marginTop: '1rem',
  },
  errorMessage: {
    padding: '1rem',
    borderRadius: '4px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    textAlign: 'center' as 'center',
  },
  successMessage: {
    padding: '1rem',
    borderRadius: '4px',
    backgroundColor: '#d4edda',
    color: '#155724',
    textAlign: 'center' as 'center',
  },
  link: {
    color: '#0070f3',
    textDecoration: 'none',
  }
};

export default InscriptionPage;

