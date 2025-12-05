import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Unsubscribe() {
  const router = useRouter();
  const { id } = router.query;
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleUnsubscribe = async () => {
    if (!id) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Erreur lors de la désinscription');
      
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans">
      <Head>
        <title>Désinscription Newsletter | Kt'i</title>
      </Head>

      <Header />

      <main className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="max-w-md w-full bg-neutral-800 p-8 rounded-lg shadow-lg border border-neutral-700">
          <h1 className="text-3xl font-heading mb-6 text-white">Désinscription</h1>

          {status === 'idle' && (
            <>
              <p className="text-gray-300 mb-8">
                Voulez-vous vraiment vous désinscrire de la newsletter de l'Atelier Kt'i ?<br/>
                Vous ne recevrez plus nos actualités ni nos invitations.
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleUnsubscribe}
                  className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-bold"
                >
                  Confirmer la désinscription
                </button>
                <Link href="/" className="text-gray-400 hover:text-white text-sm">
                  Annuler et retourner à l'accueil
                </Link>
              </div>
            </>
          )}

          {status === 'loading' && (
            <p className="text-xl animate-pulse">Traitement en cours...</p>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <p className="text-lg">Votre désinscription a bien été prise en compte.</p>
              <p className="text-gray-400 text-sm">Nous sommes désolés de vous voir partir !</p>
              <Link 
                href="/"
                className="inline-block mt-4 px-6 py-2 border border-white rounded hover:bg-white hover:text-black transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div>
              <p className="text-red-400 mb-4">Une erreur est survenue. Le lien est peut-être invalide ou expiré.</p>
              <Link href="/" className="underline">Retour à l'accueil</Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
