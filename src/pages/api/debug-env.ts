import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérification simple de la présence des variables critiques
  const checks = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'OK' : 'MISSING',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'OK' : 'MISSING',
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY ? 'OK' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV
  };

  res.status(200).json({
    status: 'Environment Check',
    checks: checks
  });
}