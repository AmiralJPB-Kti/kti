# Suivi du Projet Kti

## Contexte Général
**Projet :** Site e-commerce "kti.badie.eu" (Domaine chez OVH).
**Objectif :** Création et déploiement d'une boutique en ligne familiale.
**Équipe :** AmiralJP et sa sœur.
**Niveau technique :** Compétences limitées, nécessité d'un accompagnement pas-à-pas et pédagogique de la part de l'assistant (Gemini).
**Langue préférentielle :** Français.
**Stack Technique :** GitHub, Supabase, Vercel, Stripe, Sanity, Resend.

---

**Dernière mise à jour :** 07 Décembre 2025
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

---

## 4. Accomplissements de la session du 06/12/2025

### A. Outil "Générateur de Newsletter" pour Administrateurs
*   **Objectif :** Permettre l'envoi facile et autonome de newsletters formatées, sans compétence technique (HTML/CSS), à tous les abonnés.
*   **Interface Utilisateur (`/admin/newsletter`) :**
    *   Formulaire guidé avec des champs clairs : Sujet, Titre, Message, URL d'Image (pour images uniquement), Texte du Bouton, Lien du Bouton.
    *   Prévisualisation en temps réel (approximative) du rendu de l'email.
    *   Boutons d'action sécurisés : "M'envoyer un TEST" (pour vérifier le rendu) et "ENVOYER À TOUS LES ABONNÉS" (avec double confirmation pour éviter les erreurs).
    *   Ajout d'un lien direct dans le menu de l'interface Admin pour un accès rapide.
*   **Fonctionnalités Backend (`/api/admin/newsletter/send`) :**
    *   API sécurisée pour l'envoi.
    *   Récupère la liste des abonnés actifs depuis Supabase.
    *   Utilise un template d'email responsive et professionnel, inclus le logo Kt'i et un lien de désinscription personnalisé pour chaque abonné.
    *   Prend en charge l'envoi de tests individuels et la diffusion massive.
    *   Le processus d'envoi de masse est optimisé pour éviter les timeouts et gérer les limites de l'API Resend en envoyant par petits lots (chunks).
*   **Amélioration des Templates Emails :**
    *   Création d'un `manualNewsletterTemplate` réutilisable et personnalisable.

### B. Précision sur l'utilisation des images
*   Le champ "URL Image" est strictement destiné à des liens d'images (JPG, PNG, GIF).
*   Pour intégrer du contenu vidéo, la recommandation est d'utiliser une vignette (image) de la vidéo, puis de rendre cette vignette (ou un bouton dédié) cliquable vers la plateforme hébergeant la vidéo (YouTube, Vimeo, Facebook, etc.).

### C. Maintenance & Sécurité (Next.js & ESLint)
*   **Mise à jour Critique (CVE-2025-55182) :** Passage de Next.js `15.1.9` à `15.5.7` suite à une alerte de sécurité RCE (Remote Code Execution) de Vercel.
*   **Correction Configuration ESLint :**
    *   Migration de la configuration ESLint pour la rendre compatible avec ESLint 9 et le nouveau format "Flat Config".
    *   Utilisation de `FlatCompat` pour assurer la compatibilité avec `eslint-config-next`.
    *   Installation des dépendances manquantes (`typescript-eslint`, `@eslint/eslintrc`, etc.).
    *   Mise à jour du script de linting (`npm run lint` exécute désormais `eslint .`).
    *   Exclusion du dossier `.sanity/runtime/` pour corriger les erreurs de parsing.
*   **Validation :** `npm run build` passe avec succès. `npm run lint` est fonctionnel et remonte les avertissements de qualité de code (à traiter ultérieurement).

### D. Améliorations & Corrections Diverses
*   **Corrections Typographiques :** Uniformisation des apostrophes (d\' vers d') dans le composant Newsletter (`src/components/Newsletter.tsx`) et dans l'interface d'administration de la newsletter (`src/pages/admin/newsletter.tsx`).
*   **Fiabilisation du Rapport Quotidien (CRON) :**
    *   Diagnostic du problème de non-envoi du rapport des commandes journalières via Vercel CRON.
    *   Ajout de logs détaillés et assouplissement temporaire de la vérification de sécurité (`CRON_SECRET`) dans `/api/cron/daily-report.ts` pour faciliter le débogage sur Vercel.
    *   Validation du fonctionnement du script via un test local (envoi d'email et récupération des commandes).
*   **Correctif Widget Mondial Relay :** Résolution du problème d'affichage intermittent de la carte "Point Relais" sur la page de livraison (`src/pages/livraison.tsx`) en ajoutant un délai et une vérification de présence DOM lors de l'initialisation du widget.
*   **Standardisation des Adresses :**
    *   Implémentation de la conversion automatique en majuscules pour les champs `rue`, `ville`, `code postal` et `pays` dans le formulaire d'adresse (`src/components/AddressForm.tsx`) côté frontend.
    *   Fourniture d'un script SQL (`force_uppercase_address_trigger.sql`) pour créer un trigger Supabase garantissant que ces mêmes champs sont toujours stockés en majuscules dans la base de données, assurant une cohérence maximale.

---

## 5. Accomplissements de la session du 07/12/2025

### A. Assistant de Rédaction IA (Newsletter)
*   **Objectif :** Faciliter la rédaction des newsletters pour les administrateurs en proposant des corrections de style et des idées de sujets.
*   **Technologie :** Intégration de l'API Google Gemini (`gemini-2.5-flash`) via la librairie `@google/generative-ai`.
*   **Nouvelles Fonctionnalités (`/admin/newsletter`) :**
    *   **Bouton "💡 Idées IA" :** Suggère 3 objets d'email percutants basés sur le contenu du message.
    *   **Bouton "✨ Améliorer avec l'IA" :** Réécrit le brouillon du message pour le rendre plus professionnel, chaleureux et sans fautes.
*   **Backend (`/api/admin/newsletter/generate`) :** Nouvelle route API sécurisée qui agit comme interface entre le site et l'IA de Google.
*   **⚠️ Déploiement Vercel (Rappel Important) :** La variable d'environnement `GOOGLE_GEMINI_API_KEY` a été ajoutée localement (`.env.local`). **Elle doit impérativement être ajoutée manuellement dans les réglages du projet sur Vercel** pour que la fonctionnalité marche en production.

### B. Assistant Intelligent Polyvalent
*   **Objectif :** Créer un outil centralisé pour générer divers types de contenu textuel (relances de paiement, commandes fournisseurs, posts réseaux sociaux, réponses SAV, corrections).
*   **Technologie :** Utilise également l'API Google Gemini (`gemini-2.5-flash`) avec des "personnalités" (prompts système) adaptées à chaque besoin.
*   **Nouvelle Interface (`/admin/assistant`) :**
    *   Permet de choisir le "Type de message" via un menu déroulant.
    *   Un champ "Contexte" pour donner les idées en vrac à l'IA.
    *   Bouton "✨ Générer le texte" pour lancer la rédaction.
    *   Zone "Résultat" avec bouton "📋 Copier" pour réutiliser facilement le texte.
*   **Backend (`/api/admin/assistant/generate`) :** Nouvelle route API qui adapte l'instruction à l'IA en fonction du mode choisi.
*   **Mise à jour du Menu Admin :** Ajout d'un lien "🧠 Assistant IA" dans le menu de gauche de l'administration pour un accès facile.
*   **⚠️ Déploiement Vercel (Rappel Important) :** Comme pour l'assistant newsletter, l'Assistant Intelligent dépend de la variable d'environnement `GOOGLE_GEMINI_API_KEY`. Assurez-vous qu'elle est bien configurée sur Vercel.

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