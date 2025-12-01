import Head from 'next/head';
import Header from '@/components/Header';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';

const ContactPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pre-fill message if coming from a product page
  useEffect(() => {
    if (router.query.product) {
      const productName = decodeURIComponent(router.query.product as string);
      const productRef = router.query.reference ? decodeURIComponent(router.query.reference as string) : '';
      
      const refText = productRef ? ` (Réf: ${productRef})` : '';
      
      setMessage(`Bonjour,\n\nJe souhaiterais commander une création similaire au modèle "${productName}"${refText}.\n\nVoici mes préférences (couleurs, détails...) :\n`);
    }
  }, [router.query.product, router.query.reference]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        // Si la réponse n'est pas du JSON (ex: erreur 500 serveur brut), on lit le texte
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(response.statusText || "Une erreur inconnue est survenue serveur.");
      }

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      setStatusMessage({ type: 'success', text: 'Merci pour votre message ! Nous vous répondrons bientôt.' });
      // Reset form
      setName('');
      setEmail('');
      setMessage('');

    } catch (error: any) {
      console.error("Erreur contact:", error);
      setStatusMessage({ type: 'error', text: error.message || "Erreur de connexion." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact | Kt'i</title>
      </Head>
      <Header />
      <main className="container" style={{ paddingTop: '2rem', maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Contactez-nous</h1>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
          Pour toute question concernant une commande, un produit, ou pour toute autre demande, n'hésitez pas à remplir le formulaire ci-dessous.
        </p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="name">Votre nom</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="email">Votre email</label>
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
            <label htmlFor="message">Votre message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              style={styles.textarea}
            />
          </div>

          {statusMessage && (
            <div style={{
              ...styles.statusMessage,
              backgroundColor: statusMessage.type === 'success' ? '#d4edda' : '#f8d7da',
              color: statusMessage.type === 'success' ? '#155724' : '#721c24',
            }}>
              {statusMessage.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={styles.button} disabled={submitting}>
            {submitting ? 'Envoi en cours...' : 'Envoyer le message'}
          </button>
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
  textarea: {
    padding: '0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  button: {
    padding: '1rem',
    fontSize: '1.1rem',
    marginTop: '1rem',
  },
  statusMessage: {
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center' as 'center',
  }
};

export default ContactPage;