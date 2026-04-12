-- SUPPRESSION DES POLITIQUES PRÉCÉDENTES (Nettoyage)
-- ------------------------------------------------------------------
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."materials";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."creations_templates";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."creation_materials";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."production_logs";

-- CRÉATION DES POLITIQUES DE LECTURE SÉCURISÉES (Admin uniquement)
-- ------------------------------------------------------------------
-- Cette règle autorise la lecture (SELECT) uniquement aux utilisateurs authentifiés.
-- Elle est appliquée aux tables clés de l'atelier.

CREATE POLICY "Lecture admin" ON "public"."materials" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture admin" ON "public"."creations_templates" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture admin" ON "public"."creation_materials" FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lecture admin" ON "public"."production_logs" FOR SELECT TO authenticated USING (true);
