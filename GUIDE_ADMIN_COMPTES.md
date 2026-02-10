# 🔐 Guide de Gestion des Comptes (Admin & Vendeur)

Ce document explique comment gérer les accès au site **Kti** (https://kti.badie.eu).
Il y a deux niveaux d'administration distincts qu'il faut bien différencier.

---

## 1. Gérer le Contenu (Textes, Produits, Photos)
**Outil :** Sanity Studio
**Pour qui ?** Toi, ou une personne qui t'aide à rédiger les fiches produits.

C'est la partie la plus simple. Tu as la main totale dessus.

### Ajouter une personne
1.  Connecte-toi sur **[sanity.io/manage](https://www.sanity.io/manage)** (avec ton compte Google).
2.  Clique sur le projet **"Kti"**.
3.  Va dans l'onglet **"Members"** (Membres).
4.  Clique sur le bouton orange **"Add Member"**.
5.  Entre l'adresse email de la personne.
6.  Choisis son rôle :
    *   **Administrator :** A tous les droits (y compris supprimer le projet, attention !).
    *   **Editor :** Peut modifier les textes et produits, mais pas la structure du site. (Recommandé pour une aide).

### Supprimer une personne
1.  Dans la même liste "Members".
2.  Clique sur les trois petits points `...` à côté du nom de la personne.
3.  Choisis **"Remove from project"**.
4.  La personne perd immédiatement l'accès au Studio.

---

## 2. Gérer les Ventes & Factures (Espace Vendeur)
**Outil :** Site Web /admin
**Pour qui ?** Toi, et les personnes de confiance qui encaissent de l'argent pour toi (Salons).

Cette partie est **hautement sécurisée** car elle touche aux données clients et à la facturation légale.
L'accès se fait en deux étapes de sécurité.

### A. La Liste Blanche (Sécurité Technique)
Pour qu'une personne puisse se connecter à l'espace `/admin`, son email doit être **autorisé techniquement** par le serveur.

*   **Actuellement autorisés :** `kti@badie.eu`, `kti.atelier@gmail.com`, `jp@badie.eu`.
*   **Comment modifier ?**
    Ce n'est pas accessible via un simple bouton pour l'instant. Si tu veux ajouter une nouvelle adresse email (ex: une stagiaire ou une amie qui tient le stand avec toi), il faut demander à l'administrateur technique (JP) d'ajouter cet email dans la configuration du serveur (Variables d'environnement Vercel).

### B. Le Compte de Connexion
Une fois l'email autorisé sur la liste blanche, la personne doit simplement se créer un compte ou se connecter.

*   **Si la personne a déjà un compte Google :** Elle peut utiliser le bouton "Connexion Google".
*   **Sinon :** Il faut lui créer un compte email/mot de passe via l'interface de base de données (Supabase).

---

## 3. L'Email "Officiel" du site

Le site envoie des emails automatiques (Confirmations de commande, Factures, Notifications).
L'adresse utilisée pour ces envois et pour recevoir les alertes est configurée dans le "Cerveau" du site.

*   **Email actuel :** `kti@badie.eu`
*   **Pour le changer :** Si tu changes d'adresse pro principale, il faut prévenir l'administrateur technique pour qu'il mette à jour la variable `NEXT_PUBLIC_CONTACT_EMAIL` dans le système. Cela mettra à jour instantanément :
    *   L'adresse sur les factures PDF.
    *   Le destinataire des alertes "Nouvelle commande".
    *   L'expéditeur des emails clients.

---

## 4. Paramètres Mondial Relay (Point Relais)

Le site utilise le widget officiel Mondial Relay pour permettre aux clients de choisir leur point de collecte.

*   **Mode actuel :** Démonstration (BDTEST13).
*   **Pour passer en Production :** 
    Une fois que tu as tes propres identifiants Mondial Relay (Code Enseigne), il faut demander à l'administrateur technique de mettre à jour la variable `NEXT_PUBLIC_MONDIAL_RELAY_BRAND` dans Vercel. 
    Cela fera disparaître le message "Compte de démonstration" sur la carte.
