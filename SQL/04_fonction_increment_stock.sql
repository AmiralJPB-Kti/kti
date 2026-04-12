-- Fonction pour incrémenter le stock d'un matériau
-- ------------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_material_stock(row_id UUID, amount NUMERIC)
RETURNS void AS $$
BEGIN
    UPDATE materials
    SET current_stock = current_stock + amount
    WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;

-- On supprime les triggers de déstockage automatique lors d'une suppression (DELETE)
-- car on veut désormais laisser le choix à l'utilisateur depuis l'interface.
DROP TRIGGER IF EXISTS trigger_restore_stock ON production_logs;
DROP FUNCTION IF EXISTS restore_material_stock();
