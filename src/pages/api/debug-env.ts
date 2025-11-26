import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // List ALL keys, sorted
  const allKeys = Object.keys(process.env).sort();
  
  const stripeDetails = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'PRESENT' : 'MISSING',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'PRESENT' : 'MISSING',
  };

  res.status(200).json({
    debug: 'Verifying ALL Env Vars',
    specificChecks: stripeDetails,
    availableEnvVars: allKeys, // List of all keys available to the process
  });
}
