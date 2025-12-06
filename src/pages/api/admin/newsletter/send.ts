import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { 
  SUPABASE_URL, 
  SUPABASE_SERVICE_ROLE_KEY_PART_1, 
  SUPABASE_SERVICE_ROLE_KEY_PART_2 
} from '@/lib/stripe-config';
import { resend } from '@/lib/resend';
import { manualNewsletterTemplate } from '@/lib/email-templates';

// Initialize Supabase with Service Role (Admin Access)
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

  try {
    const { 
      type, // 'test' | 'broadcast'
      testEmail,
      subject,
      title,
      message,
      imageUrl,
      buttonText,
      buttonLink
    } = req.body;

    // Basic Validation
    if (!subject || !title || !message) {
      return res.status(400).json({ message: 'Champs obligatoires manquants (Sujet, Titre, Message)' });
    }

    // ---------------------------------------------------------
    // MODE TEST : Envoi simple
    // ---------------------------------------------------------
    if (type === 'test') {
      if (!testEmail) return res.status(400).json({ message: 'Email de test manquant' });

      const emailHtml = manualNewsletterTemplate(
        title,
        message,
        imageUrl,
        buttonText,
        buttonLink,
        'TEST_ID_123' // Fake ID for preview
      );

      await resend.emails.send({
        from: 'Atelier Kt\'i <contact@badie.eu>',
        to: [testEmail],
        subject: `[TEST] ${subject}`,
        html: emailHtml,
      });

      return res.status(200).json({ message: 'Test envoyé', count: 1 });
    }

    // ---------------------------------------------------------
    // MODE BROADCAST : Envoi Massif
    // ---------------------------------------------------------
    if (type === 'broadcast') {
      // 1. Fetch active subscribers
      const { data: subscribers, error } = await supabase
        .from('newsletter_subscribers')
        .select('id, email')
        .eq('is_active', true);

      if (error) throw error;
      if (!subscribers || subscribers.length === 0) {
        return res.status(400).json({ message: 'Aucun abonné actif trouvé.' });
      }

      // 2. Send Emails (Sequential Loop for safety/simplicity with Resend)
      // We use a loop to personalize the unsubscribe link for each user.
      // For larger lists, we would use a queue, but for < 100, this is fine.
      let successCount = 0;
      let failCount = 0;

      // Process in chunks of 10 concurrently to speed up but not overwhelm
      const CHUNK_SIZE = 10;
      for (let i = 0; i < subscribers.length; i += CHUNK_SIZE) {
        const chunk = subscribers.slice(i, i + CHUNK_SIZE);
        
        await Promise.all(chunk.map(async (sub) => {
            try {
                const emailHtml = manualNewsletterTemplate(
                    title,
                    message,
                    imageUrl,
                    buttonText,
                    buttonLink,
                    sub.id // Real Subscriber ID for Unsubscribe Link
                );

                await resend.emails.send({
                    from: 'Atelier Kt\'i <contact@badie.eu>',
                    to: [sub.email],
                    subject: subject,
                    html: emailHtml,
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to send to ${sub.email}`, err);
                failCount++;
            }
        }));
      }

      return res.status(200).json( {
        message: 'Campagne envoyée', 
        count: successCount, 
        failures: failCount,
        total: subscribers.length 
      });
    }

    return res.status(400).json({ message: 'Type d\'envoi invalide' });

  } catch (error: any) {
    console.error('API Newsletter Error:', error);
    return res.status(500).json({ message: error.message || 'Erreur serveur interne' });
  }
}
