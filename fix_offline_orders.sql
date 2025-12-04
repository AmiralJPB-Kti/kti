-- AUTORISER LES COMMANDES SANS UTILISATEUR
-- Nécessaire pour les ventes "Salon" où le client n'a pas de compte.

ALTER TABLE public.orders
ALTER COLUMN user_id DROP NOT NULL;
