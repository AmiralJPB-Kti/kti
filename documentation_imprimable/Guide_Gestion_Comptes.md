# 🔐 Guide de Gestion des Comptes (Admin & Vendeur)

Ce document explique comment gérer les accès au site **Kti** (https://kti.badie.eu).
Il y a deux niveaux d'administration distincts.

---

## 1. Gérer le Contenu (Textes, Produits, Photos)
**Outil :** Sanity Studio ([kti.badie.eu/studio](https://kti.badie.eu/studio))
**Pour qui ?** Les rédacteurs de fiches produits.

C'est la partie la plus simple. Tu as la main totale dessus.

### Ajouter une personne
1.  Connecte-toi sur **[sanity.io/manage](https://www.sanity.io/manage)**.
2.  Clique sur le projet **"Kti"**.
3.  Va dans l'onglet **"Members"** (Membres).
4.  Clique sur le bouton orange **"Add Member"**.
5.  Entre l'adresse email de la personne.
6.  Choisis son rôle :
    *   **Administrator :** A tous les droits.
    *   **Editor :** Peut modifier les textes et produits (Recommandé).

### Supprimer une personne
1.  Dans la même liste "Members".
2.  Clique sur les trois petits points `...` à côté du nom de la personne.
3.  Choisis **"Remove from project"**.

---

## 2. Gérer les Ventes & Factures (Espace Vendeur)
**Outil :** Site Web Admin ([kti.badie.eu/admin](https://kti.badie.eu/admin))
**Pour qui ?** Les personnes qui encaissent de l'argent.

Cette partie est **hautement sécurisée**.

### A. Autoriser un nouvel email (Liste Blanche)
Pour qu'une personne puisse se connecter à l'espace `/admin`, son email doit être autorisé par le serveur.

*   **Actuellement autorisés :** Tes adresses habituelles.
*   **Pour ajouter quelqu'un :** Il faut demander à l'administrateur technique d'ajouter cet email dans la configuration du serveur (Variables d'environnement).

### B. Connexion
Une fois l'email autorisé :
*   **Si la personne a un compte Google :** Elle utilise "Connexion Google".
*   **Sinon :** Il faut lui créer un compte email/mot de passe via Supabase.

---

## 3. L'Email "Contact" du site

Le site utilise une adresse email principale pour envoyer les confirmations de commande et recevoir les alertes.

*   **Pour le changer :** Si tu changes d'adresse pro, préviens l'administrateur technique. Il mettra à jour la configuration du serveur et cela se répercutera partout (Factures, Emails clients, Alertes).
