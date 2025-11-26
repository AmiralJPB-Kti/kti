import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const envVars = Object.keys(process.env);
  const stripeKeyStatus = process.env.STRIPE_SECRET_KEY 
    ? `Present (Length: ${process.env.STRIPE_SECRET_KEY.length})` 
    : 'MISSING';
  
  const webhookSecretStatus = process.env.STRIPE_WEBHOOK_SECRET 
    ? 'Present' 
    : 'MISSING';

  res.status(200).json({
    status: 'Environment Debug',
    stripeKey: stripeKeyStatus,
    webhookSecret: webhookSecretStatus,
    allEnvVarKeys: envVars.filter(key => !key.includes('SECRET') && !key.includes('KEY')), // Hide sensitive keys from list just in case
    nodeEnv: process.env.NODE_ENV,
  });
}
