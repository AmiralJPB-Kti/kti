import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Log to check if the API key is loaded
  console.log('Resend API Key loaded:', resendApiKey ? `Yes, starts with ${resendApiKey.slice(0, 5)}...` : 'No');

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe sont requis.' });
  }

  // Get customer IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress;

  // Attempt to sign in the user
  const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // If sign-in fails, log the attempt
    console.log(`Failed login attempt for ${email} from IP ${ip}`);
    await supabaseAdmin.from('login_attempts').insert({
      user_email: email,
      ip_address: ip,
    });
    return res.status(401).json({ error: 'Email ou mot de passe invalide.' });
  }

  // If sign-in is successful, send a notification email
  console.log('Login successful. Attempting to send notification email...');
  try {
    const { data, error } = await resend.emails.send({
      from: 'support@badie.eu', // Replace with your verified domain
      to: 'rapport@badie.eu', // REPLACE THIS with your admin email
      subject: '✅ Nouvelle connexion sur le site Kt\'i',
      html: `
        <p>Une connexion a été détectée pour l\'utilisateur :</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Adresse IP:</strong> ${ip}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
      `,
    });

    if (error) {
      // Log the specific error from Resend
      console.error('Resend email sending error:', error);
    } else {
      console.log('Resend email sent successfully:', data);
    }

  } catch (emailError) {
    // Log any other unexpected error during email sending
    console.error('Failed to send login notification email (catch block):', emailError);
  }

  // Return the session data to the client
  res.status(200).json(signInData);
}
