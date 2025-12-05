import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { 
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY_PART_1, 
  SUPABASE_SERVICE_ROLE_KEY_PART_2 
} from '../../../lib/stripe-config';

// Initialisation du client Supabase avec la configuration robuste (Split Key)
// On utilise la clé Service Role pour garantir l'accès backend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || (SUPABASE_SERVICE_ROLE_KEY_PART_1 + SUPABASE_SERVICE_ROLE_KEY_PART_2);

const supabase = createClient(supabaseUrl, supabaseKey);

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
