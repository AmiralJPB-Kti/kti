import { useState, FormEvent, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Head from 'next/head';
import Link from 'next/link';

const LoginPage = () => {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if user is already fully logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if the session is from a full password authentication
        const lastAmr = user.amr?.slice(-1)[0];
        if (lastAmr?.method === 'password') {
          // If fully authenticated, redirect to the account page
          router.push('/mon-compte');
        }
        // Otherwise, if the session is temporary (e.g., from password recovery),
        // do nothing and let the user log in normally.
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Email ou mot de passe invalide.'); // Keep a generic message for security
      console.error('Login error:', error.message);
    } else {
      // On successful login, Supabase client handles the session.
      // The onAuthStateChange listener elsewhere will pick it up.
      // We just need to redirect the user.
      const redirectPath = router.query.redirect || '/mon-compte';
      router.push(redirectPath as string);
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Connexion | Kt'i</title>
      </Head>
      <Header />
      <main className="container" style={{ paddingTop: '4rem', maxWidth: '480px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Connexion</h1>
        <form onSubmit={handleLogin} style={styles.form}>
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
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={styles.button} disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link href="/mot-de-passe-oublie" style={styles.link}>
              Mot de passe oublié ?
            </Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <p>Pas encore de compte ? <Link href="/inscription" style={styles.link}>S'inscrire</Link></p>
          </div>
        </form>
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
  link: {
    color: '#0070f3',
    textDecoration: 'none',
  }
};

export default LoginPage;
