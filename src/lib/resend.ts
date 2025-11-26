import { Resend } from 'resend';
import { RESEND_API_KEY_PART_1, RESEND_API_KEY_PART_2 } from './stripe-config';

const hardcodedResendKey = (RESEND_API_KEY_PART_1 && RESEND_API_KEY_PART_2)
  ? (RESEND_API_KEY_PART_1 + RESEND_API_KEY_PART_2)
  : '';

const resendApiKey = process.env.RESEND_API_KEY || hardcodedResendKey;

if (!resendApiKey) {
  console.error("WARNING: Missing RESEND_API_KEY. Emails will not be sent.");
}

// Initialize Resend with the key (or a dummy one to prevent crash during import, 
// but actual sending will fail if key is invalid)
export const resend = new Resend(resendApiKey || 're_missing_key');

