import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { resend } from '../../../lib/resend';
import { dailyReportTemplate } from '../../../lib/email-templates';
import { 
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY_PART_1,
  SUPABASE_SERVICE_ROLE_KEY_PART_2
} from '../../../lib/stripe-config';

// Reconstruct Supabase Keys for Admin Access
const hardcodedSupabaseUrl = SUPABASE_URL;
const hardcodedServiceKey = (SUPABASE_SERVICE_ROLE_KEY_PART_1 && SUPABASE_SERVICE_ROLE_KEY_PART_2) 
  ? (SUPABASE_SERVICE_ROLE_KEY_PART_1 + SUPABASE_SERVICE_ROLE_KEY_PART_2) 
  : '';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || hardcodedSupabaseUrl;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || hardcodedServiceKey;

const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Security Check (Optional but recommended)
  // Vercel Cron sends an authorization header, but we can also use a simple query param or env var
  const authHeader = req.headers.authorization;
  if (req.query.key !== process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
     // Allow running without secret in development if needed, or just fail.
     // For now, if no secret is configured in env, we might want to be careful.
     // Let's assume if CRON_SECRET is set, we check it.
     if (process.env.CRON_SECRET) {
         return res.status(401).json({ error: 'Unauthorized' });
     }
  }

  try {
    // 2. Define the time range (Today 00:00 to 23:59 in Europe/Paris ideally, or just UTC)
    // Simple approach: Get all orders created > Yesterday 23:00 UTC (approx midnight FR)
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString();

    console.log(`📊 Generating Daily Report for: ${todayISO} to ${tomorrowISO}`);

    // 3. Fetch Orders from Supabase
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          product_name,
          quantity,
          price
        )
      `)
      .gte('created_at', todayISO)
      .lt('created_at', tomorrowISO)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // 4. Calculate Stats
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount_total || 0), 0);
    const dateString = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // 5. Send Email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Kti Bot <contact@badie.eu>',
      to: ['kti@badie.eu'], // Admin email
      subject: `📊 Rapport du ${dateString} (${orders.length} commandes)`,
      html: dailyReportTemplate(dateString, orders, totalRevenue),
    });

    if (emailError) {
      console.error('❌ Error sending daily report email:', emailError);
      return res.status(500).json({ error: emailError });
    }

    console.log('✅ Daily report sent:', emailData?.id);

    res.status(200).json({ 
      success: true, 
      message: 'Report sent', 
      date: dateString,
      ordersCount: orders.length,
      revenue: totalRevenue 
    });

  } catch (err: any) {
    console.error('❌ Internal Server Error:', err);
    res.status(500).json({ error: err.message });
  }
}
