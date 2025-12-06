# Suivi du Projet Kti

## Contexte Général
**Projet :** Site e-commerce "kti.badie.eu" (Domaine chez OVH).
**Objectif :** Création et déploiement d'une boutique en ligne familiale.
**Équipe :** AmiralJP et sa sœur.
**Niveau technique :** Compétences limitées, nécessité d'un accompagnement pas-à-pas et pédagogique de la part de l'assistant (Gemini).
**Langue préférentielle :** Français.
**Stack Technique :** GitHub, Supabase, Vercel, Stripe, Sanity, Resend.

---

**Dernière mise à jour :** 05 Décembre 2025
**État :** En Production (Entièrement Fonctionnel ✅)

Ce document sert de point de repère pour reprendre le développement. Il résume les accomplissements techniques et l'état actuel du projet.

---

## 1. Accomplissements de la session du 22/11/2025 au 04/12/2025
*Voir historique des versions précédentes pour le détail de ces sessions.*

---

## 2. Accomplissements de la session du 05/12/2025 (Newsletter RGPD & Autonomie)

### A. Newsletter & Conformité RGPD
*   **Bug Fix (Erreur 500) :** Correction de l'API d'inscription qui échouait en production à cause de clés Supabase manquantes. Utilisation de la configuration robuste "Split-Key".
*   **Droit à l'oubli :**
    *   Création d'une API de désinscription (`/api/newsletter/unsubscribe`) utilisant le "Soft Delete" (`is_active: false`) pour préserver l'historique.
    *   Création d'une page de confirmation de désinscription.
*   **Expérience Utilisateur :**
    *   Ajout d'un lien obligatoire "Se désinscrire" dans tous les emails.
    *   Gestion intelligente de la réinscription : Un ancien abonné qui revient est accueilli par un email "Bon retour" au lieu d'être bloqué.
    *   Ajout d'un bouton "Visiter la boutique" dans les emails de bienvenue.

### B. Autonomie Totale via Sanity (CMS)
*   **Objectif :** Permettre à l'équipe de modifier le pied de page et l'aspect du site sans toucher au code.
*   **Nouvelles Fonctionnalités Sanity :**
    *   **Contrôle Opacité Bannière :** Ajout d'un curseur (Slider) pour régler l'intensité du filtre noir sur la bannière d'accueil (0-100%).
    *   **Gestion Footer :** Ajout de champs pour le Texte du pied de page, les liens Réseaux Sociaux (Instagram, Facebook) et l'Email de contact.
*   **Frontend :**
    *   Le Footer récupère désormais dynamiquement ces infos.
    *   La bannière s'adapte en temps réel au réglage d'opacité.
*   **Correction Technique :** Optimisation des requêtes GROQ pour cibler spécifiquement le document Singleton (`_id == "siteSettings"`) et éviter les conflits avec d'anciens brouillons.

### C. Gestion Vidéo (YouTube & Vimeo)
*   **Amélioration YouTube :** Support ajouté pour les URLs "Shorts" (`youtube.com/shorts/...`).
*   **Support Vimeo Natif :** Implémentation d'une détection automatique des liens Vimeo pour utiliser leur lecteur officiel (iframe) au lieu du lecteur générique, résolvant les problèmes d'affichage (écran noir).
*   **Fix Dimension :** Correction CSS pour forcer le lecteur Vimeo à occuper 100% de l'espace disponible.

---

## 3. Pour la prochaine fois

**Priorités :**
1.  **Tests & Recette Complète :** Valider le flux complet avec la nouvelle gestion d'adresse et les emails newsletter.
2.  **Design & UX :** Le site est fonctionnel, mais le design (CSS) doit être peaufiné (Page d'accueil, Fiches produits, Panier).
3.  **Finalisation Contenu Pages Légales :** Rédiger et publier les textes définitifs des Mentions Légales et CGV dans Sanity.
