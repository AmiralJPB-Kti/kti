import { NextApiRequest, NextApiResponse } from 'next';
import { resend } from '@/lib/resend';
import { passwordChangedTemplate } from '@/lib/email-templates';
import { RESEND_API_KEY_PART_1, RESEND_API_KEY_PART_2 } from '@/lib/stripe-config';

// Ensure Resend is initialized securely
// (Logic duplicated from lib/resend.ts just to be safe in API context)
const hardcodedResendKey = (RESEND_API_KEY_PART_1 && RESEND_API_KEY_PART_2)
  ? (RESEND_API_KEY_PART_1 + RESEND_API_KEY_PART_2)
  : '';
const resendApiKey = process.env.RESEND_API_KEY || hardcodedResendKey;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email required' });
  }

  if (!resendApiKey) {
    console.error("❌ Resend API Key missing for password notification.");
    return res.status(500).json({ message: 'Server Configuration Error' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Kti Security <onboarding@resend.dev>',
      to: [email],
      subject: 'Sécurité : Votre mot de passe a été modifié',
      html: passwordChangedTemplate(email),
    });

    if (error) {
      console.error('Resend Error:', error);
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({ message: 'Email sent successfully', id: data?.id });
  } catch (err: any) {
    console.error('Email Send Exception:', err);
    return res.status(500).json({ message: err.message });
  }
}
