import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { 
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY_PART_1,
  SUPABASE_SERVICE_ROLE_KEY_PART_2
} from '../../../lib/stripe-config';

// 1. Initialize Supabase Admin Client
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // TODO: Add Admin Authentication Check here (verify session token)
  // For now, we rely on the secrecy of the route or frontend protection, 
  // but in prod, check req.headers.authorization

  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: error.message });
  }
}
