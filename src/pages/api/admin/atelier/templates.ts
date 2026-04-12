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
        // Récupère les modèles avec leurs matériaux liés en une seule fois
        const { data: templates, error: getError } = await supabaseAdmin
          .from('creations_templates')
          .select(`
            *,
            creation_materials (
              id,
              material_id,
              quantity_used,
              materials (*)
            )
          `)
          .order('name', { ascending: true });

        if (getError) throw getError;
        return res.status(200).json(templates);

      case 'POST':
        const { name, description, labor_cost_per_unit, overhead_cost_per_unit, margin_percent, materials } = req.body;
        
        // 1. Créer le template
        const { data: newTemplate, error: templateError } = await supabaseAdmin
          .from('creations_templates')
          .insert([{
            name,
            description,
            labor_cost_per_unit,
            overhead_cost_per_unit,
            margin_percent,
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (templateError) throw templateError;

        // 2. Lier les matériaux si présents
        if (materials && materials.length > 0) {
          const materialLinks = materials.map((m: any) => ({
            creation_template_id: newTemplate.id,
            material_id: m.material_id,
            quantity_used: m.quantity_used
          }));

          const { error: linksError } = await supabaseAdmin
            .from('creation_materials')
            .insert(materialLinks);

          if (linksError) throw linksError;
        }

        return res.status(201).json(newTemplate);

      case 'PUT':
        const { id, materials: updatedMaterials, ...updateData } = req.body;
        
        // 1. Mettre à jour les infos de base
        const { error: putError } = await supabaseAdmin
          .from('creations_templates')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (putError) throw putError;

        // 2. Mettre à jour les matériaux (Supprimer et recréer pour plus de simplicité)
        if (updatedMaterials) {
          await supabaseAdmin.from('creation_materials').delete().eq('creation_template_id', id);
          
          if (updatedMaterials.length > 0) {
            const materialLinks = updatedMaterials.map((m: any) => ({
              creation_template_id: id,
              material_id: m.material_id,
              quantity_used: m.quantity_used
            }));
            const { error: linksError } = await supabaseAdmin.from('creation_materials').insert(materialLinks);
            if (linksError) throw linksError;
          }
        }

        return res.status(200).json({ success: true });

      case 'DELETE':
        const { id: deleteId } = req.query;
        const { error: deleteError } = await supabaseAdmin
          .from('creations_templates')
          .delete()
          .eq('id', deleteId);

        if (deleteError) throw deleteError;
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Atelier Templates API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
