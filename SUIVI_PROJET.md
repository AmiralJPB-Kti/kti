# Suivi du Projet Kti

## Contexte Général
**Projet :** Site e-commerce "kti.badie.eu" (Domaine chez OVH).
**Objectif :** Création et déploiement d'une boutique en ligne familiale.
**Équipe :** AmiralJP et sa sœur.
**Niveau technique :** Compétences limitées, nécessité d'un accompagnement pas-à-pas et pédagogique de la part de l'assistant (Gemini).
**Langue préférentielle :** Français.
**Stack Technique :** GitHub, Supabase, Vercel, Stripe, Sanity, Resend.

---

**Dernière mise à jour :** 07 Décembre 2025 (Fin de session, Nuit du 7 au 8)
**État :** En Production (Entièrement Fonctionnel ✅)

Ce document sert de point de repère pour reprendre le développement. Il résume les accomplissements techniques et l'état actuel du projet.

---

## 1. Accomplissements de la session du 22/11/2025 au 04/12/2025
*Voir historique des versions précédentes pour le détail de ces sessions.*

---

## 2. Accomplissements de la session du 05/12/2025 (Newsletter RGPD & Autonomie)
*Voir section détaillée ci-dessus ou dans les versions précédentes.*

---

## 3. Pour la prochaine fois

**Priorités :**
1.  **Tests & Recette Complète :** Valider le flux complet avec la nouvelle gestion d'adresse et les emails newsletter.
2.  **Design & UX :** Le site est fonctionnel, mais le design (CSS) doit être peaufiné (Page d'accueil, Fiches produits, Panier).
3.  **Finalisation Contenu Pages Légales :** Rédiger et publier les textes définitifs des Mentions Légales et CGV dans Sanity.

---

## 4. Accomplissements de la session du 06/12/2025 (Newsletter Admin & Sécurité)
*Voir section détaillée ci-dessus.*

---

## 5. Accomplissements de la session du 07/12/2025

### A. Assistant de Rédaction IA (Newsletter) & Assistant Intelligent
*   **Objectif :** Faciliter la rédaction des newsletters et d'autres communications (SAV, relances) via l'IA.
*   **Technologie :** Intégration de l'API Google Gemini (`gemini-2.5-flash`) via la librairie `@google/generative-ai`.
*   **Nouvelles Fonctionnalités :**
    *   **Newsletter (`/admin/newsletter`) :** Suggestion de sujets et amélioration de texte.
    *   **Assistant Intelligent (`/admin/assistant`) :** Génération de relances paiements, commandes fournisseurs, posts réseaux sociaux, réponses SAV.
*   **Correctifs Techniques :**
    *   Résolution d'un bug bloquant sur la génération de Newsletter (modèle IA incompatible avec le format tableau). Passage à une invite texte unique et au modèle `gemini-2.5-flash`.
    *   Ajout de logs d'erreurs détaillés pour l'IA.

### B. Résolution Critique de Déploiement Vercel (Variables d'Environnement)
*   **Problème :** Les variables d'environnement (`STRIPE_...`, `GOOGLE_GEMINI_...`, `SANITY_...`) étaient invisibles pour l'application en production malgré un déploiement réussi, causant des erreurs (Clé API manquante, Paiements HS).
*   **Diagnostic :** Confusion entre les paramètres "d'Équipe" (Team Settings, icône tilde `~`) et les paramètres du "Projet" (`kti`). Les variables étaient définies au mauvais endroit.
*   **Solution :**
    *   Déplacement de **toutes** les variables vers la configuration spécifique du Projet sur Vercel (`Project Settings > Environment Variables`).
    *   Nettoyage des scripts de debug (`debug-env.ts`) et de configuration (`next.config.ts`) après résolution.
    *   Mise en place d'une procédure stricte : **Toujours configurer les variables dans le PROJET, pas dans l'ÉQUIPE.**

### C. Sécurité & Maintenance (Next.js & Dépendances)
*   **Sécurité ("React2Shell") :** Vérification et mise à jour de sécurité contre la vulnérabilité CVE-2025-55182.
    *   Le projet est sécurisé avec **Next.js 15.5.7** (version stable).
    *   Tentative de passage à v16 (rejetée pour incompatibilité) puis stabilisation sur v15.x.
*   **Nettoyage des Dépendances (Maintenance) :**
    *   Résolution des avertissements `npm warn deprecated` bloquant les logs.
    *   Mise à jour coordonnée de `sanity` (vers `^4.20.3`) et `next-sanity` (vers `^11.6.10`) pour éliminer les conflits de dépendances (`peer dependencies`).
    *   Mise à jour globale des paquets (`npm update`).

---

## 6. Idées & Évolutions Futures (Roadmap)

### A. Secrétaire Virtuelle IA (Projet "Boîte Mail Intelligente")
*   **Concept :** Le site se connecte à la boîte mail pro (OVH, Gmail, etc.) via IMAP.
*   **Fonctionnement :**
    *   Surveillance périodique des nouveaux messages.
    *   Analyse par l'IA (Gemini) : Résumé du contenu + Détection de l'intention (Devis, SAV, Spam...).
    *   Proposition automatique d'un brouillon de réponse.
*   **Interface Admin :** Tableau de bord pour valider/modifier/envoyer les réponses pré-générées.
*   **Gestion Multi-Comptes & Gmail :**
    *   Implémentation d'une gestion sécurisée pour plusieurs comptes de messagerie (ex: OVH et Gmail).
    *   Pour Gmail, utilisation des "Mots de passe d'application" (sécurité Google) à la place du mot de passe principal du compte. La logique IMAP reste la même pour les différents services.
