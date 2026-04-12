import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Récupère l'historique de production avec le nom du modèle
        const { data: logs, error: getError } = await supabaseAdmin
          .from('production_logs')
          .select(`
            *,
            creations_templates (name)
          `)
          .order('date_produced', { ascending: false });

        if (getError) throw getError;
        return res.status(200).json(logs);

      case 'POST':
        const { creation_template_id, quantity_produced, date_produced } = req.body;
        
        if (!creation_template_id || !quantity_produced) {
          return res.status(400).json({ error: 'Données manquantes' });
        }

        // L'insertion va déclencher le trigger SQL "trigger_deduct_stock" automatiquement
        const { data: newLog, error: postError } = await supabaseAdmin
          .from('production_logs')
          .insert([{
            creation_template_id,
            quantity_produced,
            date_produced: date_produced || new Date().toISOString()
          }])
          .select()
          .single();

        if (postError) throw postError;
        return res.status(201).json(newLog);

      case 'DELETE':
        const { id: deleteId, restock } = req.query;
        
        if (restock === 'true') {
          // 1. Récupérer les infos du log avant suppression
          const { data: log, error: fetchError } = await supabaseAdmin
            .from('production_logs')
            .select('*')
            .eq('id', deleteId)
            .single();
            
          if (fetchError) throw fetchError;

          // 2. Récupérer la recette (matériaux utilisés)
          const { data: recipe, error: recipeError } = await supabaseAdmin
            .from('creation_materials')
            .select('material_id, quantity_used')
            .eq('creation_template_id', log.creation_template_id);
            
          if (recipeError) throw recipeError;

          // 3. Rendre les matériaux au stock un par un
          for (const item of recipe) {
            const { error: updateError } = await supabaseAdmin.rpc('increment_material_stock', {
              row_id: item.material_id,
              amount: item.quantity_used * log.quantity_produced
            });
            if (updateError) throw updateError;
          }
        }

        // 4. Supprimer le log
        const { error: deleteError } = await supabaseAdmin
          .from('production_logs')
          .delete()
          .eq('id', deleteId);

        if (deleteError) throw deleteError;
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Atelier Production API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
