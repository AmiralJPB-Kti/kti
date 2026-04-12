-- CRÉATION DES POLITIQUES D'ÉCRITURE SÉCURISÉES (Admin uniquement)
-- ------------------------------------------------------------------
-- Cette règle autorise les opérations INSERT, UPDATE et DELETE 
-- uniquement aux utilisateurs authentifiés.

CREATE POLICY "Écriture admin" ON "public"."materials" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Écriture admin" ON "public"."creations_templates" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Écriture admin" ON "public"."creation_materials" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Écriture admin" ON "public"."production_logs" FOR ALL TO authenticated USING (true) WITH CHECK (true);
