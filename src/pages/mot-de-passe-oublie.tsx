
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from '@/styles/Home.module.css';
import Header from '@/components/Header';

const MotDePasseOublie = () => {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
    });

    if (resetError) {
      setError('Erreur lors de la demande de réinitialisation. Veuillez réessayer.');
      console.error('Error resetting password:', resetError.message);
    } else {
      setMessage('Si un compte existe pour cette adresse, un e-mail de réinitialisation a été envoyé.');
    }

    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Mot de passe oublié</h1>
          <p className={styles.description}>
            Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
          </p>

          <form onSubmit={handlePasswordReset} className={styles.form}>
            <input
              type="email"
              placeholder="Votre adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>

          {message && <p className={styles.successMessage}>{message}</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
      </main>
    </>
  );
};

export default MotDePasseOublie;
