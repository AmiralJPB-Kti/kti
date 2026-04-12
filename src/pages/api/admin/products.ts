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
        // Récupère tous les produits, avec les infos de l'Atelier si liées
        const { data: products, error: getError } = await supabaseAdmin
          .from('products')
          .select(`
            *,
            creations_templates (name)
          `)
          .order('created_at', { ascending: false });

        if (getError) throw getError;
        return res.status(200).json(products);

      case 'POST':
        const productData = req.body;
        
        // Génération du slug automatiquement à partir du nom
        const slug = productData.name
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-');

        const { data: newProduct, error: postError } = await supabaseAdmin
          .from('products')
          .insert([{ ...productData, slug, updated_at: new Date().toISOString() }])
          .select()
          .single();

        if (postError) throw postError;
        return res.status(201).json(newProduct);

      case 'PUT':
        const { id, ...updateData } = req.body;
        
        // Mise à jour du slug si le nom a changé
        let updatedSlug = updateData.slug;
        if (updateData.name) {
          updatedSlug = updateData.name
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
        }

        const { data: updatedProduct, error: putError } = await supabaseAdmin
          .from('products')
          .update({ 
            ...updateData, 
            slug: updatedSlug,
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .select()
          .single();

        if (putError) throw putError;
        return res.status(200).json(updatedProduct);

      case 'DELETE':
        const { id: deleteId } = req.query;
        const { error: deleteError } = await supabaseAdmin
          .from('products')
          .delete()
          .eq('id', deleteId);

        if (deleteError) throw deleteError;
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Boutique Products API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
