import type { NextApiRequest, NextApiResponse } from 'next';
import { resend } from '@/lib/resend';
import { welcomeEmailTemplate } from '@/lib/email-templates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'Kti <contact@badie.eu>',
        to: [email],
        subject: 'Bienvenue chez Kt\'i !',
        html: welcomeEmailTemplate(email),
      });

      if (error) {
        console.error('❌ Resend API Error:', error);
        return res.status(400).json({ error });
      }

      console.log('✅ Welcome email sent successfully to:', email, 'ID:', data?.id);
      res.status(200).json({ message: 'Email sent successfully', data });
    } catch (err: any) {
      console.error('❌ Server Exception sending email:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
