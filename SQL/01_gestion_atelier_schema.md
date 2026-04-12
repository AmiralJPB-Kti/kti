# Étape 1 : Création de la structure de l'Atelier

Copiez et collez l'intégralité du code ci-dessous dans votre éditeur SQL Supabase, puis cliquez sur **"Run"**.

```sql
-- 1. CRÉATION DES TABLES
-- ------------------------------------------------------------------

-- Table des matières premières (tissus, zips, boutons...)
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL, -- Prix total d'achat
    purchase_unit TEXT NOT NULL, -- ex: "mètre", "bobine"
    quantity_in_unit NUMERIC(10, 3) NOT NULL, -- ex: 1.40 pour 1m40
    current_stock NUMERIC(10, 3) DEFAULT 0,
    low_stock_threshold NUMERIC(10, 3) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des modèles de sacs (vos "recettes")
CREATE TABLE IF NOT EXISTS creations_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    labor_cost_per_unit NUMERIC(10, 2) DEFAULT 0,
    overhead_cost_per_unit NUMERIC(10, 2) DEFAULT 0,
    margin_percent NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table qui lie les matériaux aux sacs (ex: Sac A utilise 1m de Tissu B)
CREATE TABLE IF NOT EXISTS creation_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creation_template_id UUID REFERENCES creations_templates(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    quantity_used NUMERIC(10, 3) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de suivi de fabrication
CREATE TABLE IF NOT EXISTS production_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creation_template_id UUID REFERENCES creations_templates(id),
    quantity_produced INTEGER NOT NULL DEFAULT 1,
    date_produced TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AUTOMATISATION DU STOCK (TRIGGER)
-- ------------------------------------------------------------------

-- Cette fonction retire automatiquement les matériaux du stock quand vous fabriquez un sac
CREATE OR REPLACE FUNCTION deduct_material_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE materials
    SET current_stock = current_stock - (cm.quantity_used * NEW.quantity_produced)
    FROM creation_materials cm
    WHERE cm.material_id = materials.id
    AND cm.creation_template_id = NEW.creation_template_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- On active l'automatisme
DROP TRIGGER IF EXISTS trigger_deduct_stock ON production_logs;
CREATE TRIGGER trigger_deduct_stock
AFTER INSERT ON production_logs
FOR EACH ROW
EXECUTE FUNCTION deduct_material_stock();

-- 3. SÉCURITÉ
-- ------------------------------------------------------------------
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE creations_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE creation_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_logs ENABLE ROW LEVEL SECURITY;

-- Autorise tout pour le moment (plus simple pour débuter)
CREATE POLICY "Accès Admin" ON materials FOR ALL USING (true);
CREATE POLICY "Accès Admin" ON creations_templates FOR ALL USING (true);
CREATE POLICY "Accès Admin" ON creation_materials FOR ALL USING (true);
CREATE POLICY "Accès Admin" ON production_logs FOR ALL USING (true);
```
