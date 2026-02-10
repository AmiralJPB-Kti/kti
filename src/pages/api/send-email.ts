import { NextApiRequest, NextApiResponse } from 'next';
import { resend } from '../../lib/resend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    try {
      // 1. Email to Admin
      const sendAdmin = resend.emails.send({
        from: 'contact@badie.eu',
        to: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'kti@badie.eu',
        replyTo: email, // Allow admin to reply directly to user
        subject: `Nouveau message de contact de ${firstName} ${lastName}`,
        html: `
          <h3>Nouveau message via le formulaire de contact</h3>
          <p><strong>Prénom:</strong> ${firstName}</p>
          <p><strong>Nom:</strong> ${lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        `,
      });

      // 2. Acknowlegment Email to User
      const sendAck = resend.emails.send({
        from: 'contact@badie.eu',
        to: email,
        subject: `Nous avons bien reçu votre message - Kt'i`,
        html: `
          <p>Bonjour ${firstName},</p>
          <p>Nous avons bien reçu votre message et nous vous en remercions.</p>
          <p>Nous traiterons votre demande dans les plus brefs délais.</p>
          <hr />
          <p><strong>Rappel de votre message :</strong></p>
          <p style="white-space: pre-wrap; color: #555;">${message}</p>
          <br />
          <p>Cordialement,</p>
          <p>L'équipe Kt'i</p>
          <p><a href="https://kti.badie.eu">kti.badie.eu</a></p>
        `,
      });

      // Send both in parallel
      await Promise.all([sendAdmin, sendAck]);

      res.status(200).json({ message: 'Emails envoyés avec succès !' });

    } catch (err: any) {
      console.error('API error:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
