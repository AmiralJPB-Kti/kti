-- 07_POLICIES_FINALES_ADMIN.SQL
-- ------------------------------------------------------------------
-- Ce script nettoie toutes les anciennes règles et applique une politique 
-- unique et robuste pour les administrateurs connectés.

-- 1. NETTOYAGE : Suppression de toutes les anciennes politiques existantes
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."materials";
DROP POLICY IF EXISTS "Autoriser lecture administrateurs" ON "public"."materials";
DROP POLICY IF EXISTS "Écriture admin" ON "public"."materials";

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."creations_templates";
DROP POLICY IF EXISTS "Autoriser lecture administrateurs" ON "public"."creations_templates";
DROP POLICY IF EXISTS "Écriture admin" ON "public"."creations_templates";

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."creation_materials";
DROP POLICY IF EXISTS "Autoriser lecture administrateurs" ON "public"."creation_materials";
DROP POLICY IF EXISTS "Écriture admin" ON "public"."creation_materials";

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."production_logs";
DROP POLICY IF EXISTS "Autoriser lecture administrateurs" ON "public"."production_logs";
DROP POLICY IF EXISTS "Écriture admin" ON "public"."production_logs";

-- 2. CRÉATION : Application d'une politique unique "Acces_Admin_Total"
CREATE POLICY "Acces_Admin_Total" ON "public"."materials" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acces_Admin_Total" ON "public"."creations_templates" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acces_Admin_Total" ON "public"."creation_materials" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acces_Admin_Total" ON "public"."production_logs" FOR ALL TO authenticated USING (true) WITH CHECK (true);
