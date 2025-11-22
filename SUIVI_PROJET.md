# Suivi du Projet Kti
**Dernière mise à jour :** 22 Novembre 2025
**État :** En Production (Fonctionnel sur Vercel)

Ce document sert de point de repère pour reprendre le développement. Il résume les accomplissements techniques et l'état actuel du projet.

---

## 1. Accomplissements de la session du 22/11/2025

### A. Gestion de la Livraison (Tunnel d'achat complet)
Nous avons transformé le processus d'achat pour inclure une étape de livraison avant le paiement.
*   **Panier (`src/pages/panier.tsx`) :** Le bouton "Passer la commande" redirige désormais vers `/livraison` au lieu de déclencher Stripe immédiatement.
*   **Page Livraison (`src/pages/livraison.tsx`) :** Nouvelle page créée. Elle permet de :
    *   Choisir parmi les adresses enregistrées du client (Supabase).
    *   Ajouter une nouvelle adresse.
    *   Cocher l'option "Cadeau".
    *   Calculer les frais de port (Actuellement fixés à 5€).
*   **API Session Stripe (`src/pages/api/checkout_sessions.ts`) :**
    *   Reçoit désormais les infos `shipping` et `isGift`.
    *   Ajoute les frais de port comme une ligne comptable sur la facture Stripe.
    *   Stocke l'adresse et l'option cadeau dans les `metadata` de la session.
    *   Désactivation de la collecte d'adresse par Stripe (pour éviter la double saisie).
*   **Webhook Stripe (`src/pages/api/webhooks/stripe.ts`) :**
    *   Mise à jour pour lire les `metadata` (adresse, cadeau).
    *   Enregistrement de ces infos dans les nouvelles colonnes de la table `orders` de Supabase (`shipping_street`, `is_gift`, etc.).

### B. Infrastructure & Outils
*   **Remplacement de Ngrok par Stripe CLI :**
    *   Installation et configuration de `stripe-cli`.
    *   Création d'une documentation d'équipe : `Methode_GitHub_Stripe-Cli.md` à la racine.
*   **Nettoyage du Code :**
    *   Suppression de la fonctionnalité "Conversation" abandonnée (`src/pages/conversation/[id].tsx` supprimé).
    *   Correction des types TypeScript pour l'objet User (propriété `amr` castée avec `any`).
    *   Suppression du fichier `package-lock.json` orphelin à la racine du dossier `Dev`.

### C. Déploiement Vercel (Fiabilisation)
Nous avons résolu plusieurs erreurs bloquantes qui empêchaient le déploiement sur Vercel.
*   **Problème :** Vercel n'arrivait pas à lire les variables d'environnement pour Sanity et Supabase au moment du build (prerendering).
*   **Solution "Ceinture et Bretelles" :** Nous avons inscrit les valeurs de production directement comme valeurs par défaut dans le code.
    *   `src/sanity/env.ts` : IDs de projet et dataset Sanity en dur par défaut.
    *   `src/lib/supabase/client.ts` : URL et Clé Anon Supabase en dur par défaut.
*   **Résultat :** Le build passe ("Compiled successfully") et le site est en ligne.

---

## 2. Pour la prochaine fois

Pour reprendre le travail, il suffira de :
1.  **Lire ce fichier** pour se remettre en contexte.
2.  **Lancer l'environnement local :**
    *   Terminal 1 : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
    *   Mettre à jour `.env.local` avec la clé secrète Stripe.
    *   Terminal 2 : `npm run dev`

### Idées d'évolutions futures
*   Améliorer le calcul des frais de port (règles plus complexes).
*   Ajouter d'autres modes de livraison (Points Relais).
*   Peaufiner le design de la page Livraison.
