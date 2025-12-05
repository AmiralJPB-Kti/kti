import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { 
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY_PART_1, 
  SUPABASE_SERVICE_ROLE_KEY_PART_2 
} from '../../../lib/stripe-config';
import { resend } from '../../../lib/resend';
import { newsletterWelcomeTemplate, newsletterReactivationTemplate } from '../../../lib/email-templates';

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
    // 1. Vérifier si l'email existe déjà (y compris inactif)
    const { data: existingUser, error: searchError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .single();

    // Si une erreur autre que "No rows found" survient
    if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
    }

    if (existingUser) {
        // CAS A : L'utilisateur existe déjà
        if (existingUser.is_active) {
            // Déjà inscrit et actif
            return res.status(409).json({ message: 'Vous êtes déjà inscrit !' });
        } else {
            // CAS B : Réinscription (était inactif) -> On réactive
            const { data: reactivatedUser, error: updateError } = await supabase
                .from('newsletter_subscribers')
                .update({ is_active: true, subscribed_at: new Date().toISOString() }) // On met à jour la date aussi
                .eq('id', existingUser.id)
                .select()
                .single();
            
            if (updateError) throw updateError;

            // Envoi Email "Bon retour"
            await resend.emails.send({
                from: 'Atelier Kt\'i <contact@badie.eu>',
                to: [email],
                subject: 'Ravi de vous revoir chez Kt\'i !',
                html: newsletterReactivationTemplate(email, existingUser.id),
            });

            return res.status(200).json({ message: 'Bon retour parmi nous !' });
        }
    }

    // CAS C : Nouvel utilisateur (N'existe pas en base)
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }])
      .select() 
      .single();

    if (error) {
      throw error;
    }

    // Envoi Email Bienvenue (Standard)
    if (data) {
      await resend.emails.send({
        from: 'Atelier Kt\'i <contact@badie.eu>',
        to: [email],
        subject: 'Bienvenue à l\'Atelier Kt\'i !',
        html: newsletterWelcomeTemplate(email, data.id),
      });
    }

    return res.status(200).json({ message: 'Inscription réussie !' });
  } catch (error) {
    console.error('Erreur newsletter:', error);
    return res.status(500).json({ message: 'Erreur serveur interne' });
  }
}
