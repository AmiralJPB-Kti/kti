-- 08_POLICIES_ECRITURE_PRODUITS.SQL
-- ------------------------------------------------------------------
-- Ce script autorise les opérations d'écriture pour la table products.
-- Il permet l'ajout de nouveaux produits et la mise à jour des informations 
-- (y compris les références aux images multiples).

DROP POLICY IF EXISTS "Écriture admin" ON "public"."products";

CREATE POLICY "Écriture admin" ON "public"."products" 
FOR ALL TO authenticated USING (true) WITH CHECK (true);
