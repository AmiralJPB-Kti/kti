import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialisation du client Supabase
// On utilise les clés publiques car on a autorisé l'INSERT public dans la table via RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://votre-projet.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'votre-cle-publique';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Email invalide' });
  }

  try {
    // Insertion dans Supabase
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }]);

    if (error) {
      // Gestion du cas "Email déjà enregistré" (code erreur unique constraint violation)
      if (error.code === '23505') {
        return res.status(409).json({ message: 'Vous êtes déjà inscrit !' });
      }
      throw error;
    }

    return res.status(200).json({ message: 'Inscription réussie !' });
  } catch (error) {
    console.error('Erreur newsletter:', error);
    return res.status(500).json({ message: 'Erreur serveur interne' });
  }
}
