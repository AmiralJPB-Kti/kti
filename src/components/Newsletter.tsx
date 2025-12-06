import React, { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Une erreur est survenue");
      }

      setStatus('success');
      setMessage('Merci ! Vous êtes bien inscrit aux nouvelles de l\'atelier.');
      setEmail('');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <div className="pt-2">
      <h3 className="text-lg font-heading text-white mb-4">Restons en contact</h3>
      <p className="text-gray-300 text-sm mb-4">
        Inscrivez-vous pour découvrir les prochaines créations et les lieux d'exposition.
      </p>

      {status === 'success' ? (
        <div className="p-3 bg-green-800/30 border border-green-600 rounded text-green-200 text-sm">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="Votre email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-white text-white placeholder-gray-400 transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-2 bg-white text-black font-heading rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Inscription...' : 'S\'inscrire'}
          </button>
          {status === 'error' && (
            <p className="text-red-400 text-xs mt-1">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}
