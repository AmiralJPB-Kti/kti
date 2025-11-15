import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev', // This is a placeholder. You should use a verified domain email.
        to: 'kti@badie.eu', // REPLACE THIS WITH YOUR ACTUAL RECIPIENT EMAIL
        subject: `Nouveau message de contact de ${name}`,
        html: `
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });

      if (error) {
        console.error('Resend email error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ message: 'Email envoyé avec succès !', data });

    } catch (err: any) {
      console.error('API error:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
