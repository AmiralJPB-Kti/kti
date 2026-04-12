import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // TODO: Add strict admin session check here (middleware usually handles it, but extra safety is good)
  
  try {
    switch (method) {
      case 'GET':
        const { data: materials, error: getError } = await supabaseAdmin
          .from('materials')
          .select('*')
          .order('name', { ascending: true });

        if (getError) throw getError;
        return res.status(200).json(materials);

      case 'POST':
        const { name, unit_cost, purchase_unit, quantity_in_unit, current_stock, low_stock_threshold, notes } = req.body;
        
        const { data: newMaterial, error: postError } = await supabaseAdmin
          .from('materials')
          .insert([{
            name,
            unit_cost,
            purchase_unit,
            quantity_in_unit,
            current_stock,
            low_stock_threshold,
            notes,
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (postError) throw postError;
        return res.status(201).json(newMaterial);

      case 'PUT':
        const { id, ...updateData } = req.body;
        
        const { data: updatedMaterial, error: putError } = await supabaseAdmin
          .from('materials')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (putError) throw putError;
        return res.status(200).json(updatedMaterial);

      case 'DELETE':
        const { id: deleteId } = req.query;
        
        const { error: deleteError } = await supabaseAdmin
          .from('materials')
          .delete()
          .eq('id', deleteId);

        if (deleteError) throw deleteError;
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Atelier Materials API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
