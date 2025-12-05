import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { 
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY_PART_1, 
  SUPABASE_SERVICE_ROLE_KEY_PART_2 
} from '../../../lib/stripe-config';

// Reconstruction de la clé admin pour modifier la base
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || (SUPABASE_SERVICE_ROLE_KEY_PART_1 + SUPABASE_SERVICE_ROLE_KEY_PART_2);

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID manquant' });
  }

  try {
    // On désactive l'abonné (Soft Delete) pour conserver l'historique et gérer les réinscriptions
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Désinscription réussie' });
  } catch (error: any) {
    console.error('Erreur désinscription:', error);
    res.status(500).json({ message: error.message });
  }
}
