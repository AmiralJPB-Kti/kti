-- ⚠️ ATTENTION : CE SCRIPT EFFACE TOUTES LES DONNÉES DE VENTE !
-- À utiliser UNIQUEMENT pour la mise en production (remise à zéro).
-- Il ne supprime PAS les comptes utilisateurs (Admins/Clients).

BEGIN;

-- 1. Vider les lignes de commande (Détails produits)
DELETE FROM public.order_items;

-- 2. Vider les commandes (En-têtes)
DELETE FROM public.orders;

-- 3. Réinitialiser la numérotation des factures
-- On supprime les compteurs d'années. La prochaine facture repartira à FAC-202X-00001.
DELETE FROM public.invoice_sequences;

-- 4. (Optionnel) Réinitialiser les séquences d'ID si elles existent
-- Si vos IDs sont des entiers auto-incrémentés, on les remet à 1.
-- Si ce sont des UUIDs, cette partie ne fera rien ou échouera (sans gravité avec le IF EXISTS).
ALTER SEQUENCE IF EXISTS public.orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.order_items_id_seq RESTART WITH 1;

COMMIT;

-- Vérification finale
SELECT count(*) as nb_commandes FROM public.orders;
SELECT count(*) as nb_sequences FROM public.invoice_sequences;
