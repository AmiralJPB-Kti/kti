# Étape 2 : Création de la Boutique (Sans Sanity)

Copiez et collez l'intégralité du code ci-dessous dans votre éditeur SQL Supabase, puis cliquez sur **"Run"**. 
Cela va créer la nouvelle table pour que votre sœur puisse gérer ses produits directement dans l'interface Admin.

```sql
-- 1. TABLE DES PRODUITS (Boutique)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- Pour l'URL (ex: sac-elegant-bleu)
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    images TEXT[] DEFAULT '{}', -- Liste des URLs des photos
    is_active BOOLEAN DEFAULT true, -- En ligne ou non
    is_on_order BOOLEAN DEFAULT false, -- Produit "Sur commande"
    creation_template_id UUID REFERENCES creations_templates(id), -- Lien vers l'Atelier
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SÉCURITÉ (RLS)
-- ------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Autorise la lecture publique pour tout le monde (pour que les clients voient les produits)
CREATE POLICY "Lecture publique des produits" ON products FOR SELECT USING (true);

-- Autorise tout pour les admins
CREATE POLICY "Gestion Admin des produits" ON products FOR ALL USING (true);
```

### Action suivante :
Une fois ce code exécuté, n'oubliez pas de créer un **Bucket** nommé `product-images` dans la section **Storage** de Supabase et de le mettre en **Public**.
