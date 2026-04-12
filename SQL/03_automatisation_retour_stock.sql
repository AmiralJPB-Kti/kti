-- AUTOMATISATION DU RETOUR EN STOCK LORS D'UNE SUPPRESSION
-- ------------------------------------------------------------------

-- 1. Fonction qui "rend" les matériaux au stock
CREATE OR REPLACE FUNCTION restore_material_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- On fait l'inverse exact de la fonction de déduction
    UPDATE materials
    SET current_stock = current_stock + (cm.quantity_used * OLD.quantity_produced)
    FROM creation_materials cm
    WHERE cm.material_id = materials.id
    AND cm.creation_template_id = OLD.creation_template_id;
    
    -- On utilise OLD ici car l'entrée est en train d'être supprimée
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 2. Activation de l'automatisme sur la suppression
DROP TRIGGER IF EXISTS trigger_restore_stock ON production_logs;
CREATE TRIGGER trigger_restore_stock
AFTER DELETE ON production_logs
FOR EACH ROW
EXECUTE FUNCTION restore_material_stock();

-- 3. Optionnel : Fonction de mise à jour (si on change la quantité produite)
CREATE OR REPLACE FUNCTION update_material_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. On rend l'ancienne quantité au stock (OLD)
    UPDATE materials
    SET current_stock = current_stock + (cm.quantity_used * OLD.quantity_produced)
    FROM creation_materials cm
    WHERE cm.material_id = materials.id
    AND cm.creation_template_id = OLD.creation_template_id;

    -- 2. On retire la nouvelle quantité du stock (NEW)
    UPDATE materials
    SET current_stock = current_stock - (cm.quantity_used * NEW.quantity_produced)
    FROM creation_materials cm
    WHERE cm.material_id = materials.id
    AND cm.creation_template_id = NEW.creation_template_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- On active l'automatisme sur la modification
DROP TRIGGER IF EXISTS trigger_update_stock ON production_logs;
CREATE TRIGGER trigger_update_stock
AFTER UPDATE ON production_logs
FOR EACH ROW
EXECUTE FUNCTION update_material_stock();
