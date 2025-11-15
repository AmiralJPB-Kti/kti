import { useState, FormEvent, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Head from 'next/head';

const LoginPage = () => {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/mon-compte');
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      // Manually set the session on the client-side
      const { session, user } = data;
      if (session && user) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        const redirectPath = router.query.redirect || '/mon-compte';
        router.push(redirectPath as string);
      } else {
        throw new Error('Session invalide reçue du serveur.');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
        </form>
        {/* We can add links for Sign Up and Forgot Password later */}
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
  }
};

export default LoginPage;
