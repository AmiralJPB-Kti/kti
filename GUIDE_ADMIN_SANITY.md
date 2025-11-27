# 📘 Guide Administrateur - Gérer le site avec Sanity

Ce document explique comment modifier le contenu du site (Textes, Produits, Prix de livraison) sans toucher au code.

---

## 1. Accéder à l'interface d'administration (Le Studio)

Le "Studio Sanity" est votre tableau de bord. Il est accessible de deux manières :

### A. En Production (Le vrai site)
C'est la méthode pour modifier le site visible par les clients.
1.  Ouvrez votre navigateur.
2.  Allez à l'adresse : `https://kti.badie.eu/studio` (ou l'URL temporaire Vercel si le domaine n'est pas encore propagé).

### B. En Local (Sur votre ordinateur)
C'est la méthode pour tester des changements avant de les mettre en ligne.
1.  Assurez-vous que le projet tourne (`npm run dev`).
2.  Allez à l'adresse : `http://localhost:3000/studio`

---

## 2. Connexion

Lorsque vous arrivez sur la page du Studio, un écran de connexion apparaît.
*   Cliquez sur **"Log in with Google"** (ou GitHub/Email selon ce que vous avez configuré lors de la création du projet).
*   **Sécurité :** Seules les personnes explicitement invitées dans le projet Sanity peuvent se connecter. Un inconnu verra la page de connexion mais ne pourra pas entrer.

---

## 3. Modifier les Frais de Port (Nouveauté !)

C'est ici que vous réglez les tarifs Colissimo et Point Relais.

1.  Dans la colonne de gauche, cliquez sur **"Paramètres du Site"**.
2.  Une liste apparaît (il n'y a souvent qu'un seul élément), cliquez dessus.
3.  Dans la fenêtre centrale, vous verrez plusieurs onglets en haut :
    *   *Paramètres Généraux*
    *   *Mon Histoire*
    *   **Livraison** (Celui qui nous intéresse !)
4.  Cliquez sur l'onglet **Livraison**.
5.  Vous pouvez maintenant modifier les 4 champs :
    *   Frais de Port : Domicile (Colissimo)
    *   Frais de Port : Domicile (International)
    *   Frais de Port : Point Relais
    *   Frais de Port : Point Relais (International)
    *   Seuil de Livraison Offerte (Mettre 0 pour désactiver)

---

## 4. Ajouter ou Modifier un Produit

1.  Dans la colonne de gauche, cliquez sur **"Produits"**.
2.  **Pour modifier :** Cliquez sur un produit dans la liste.
3.  **Pour ajouter :** Cliquez sur le bouton **Create** (icône crayon) en haut à gauche de la liste.
4.  Remplissez les champs (Nom, Slug, Images, Prix, Description...).

---

## ⚠️ 5. Étape Cruciale : PUBLIER

Sanity fonctionne avec un système de **Brouillon** (Draft) et de **Publication**.

*   Quand vous modifiez un champ, c'est enregistré automatiquement comme **Brouillon**.
*   Le bouton en bas à droite s'appelle **Publish** (Vert).
*   **Tant que vous ne cliquez pas sur "Publish", les modifications ne sont PAS visibles sur le site internet.**
*   Si le bouton est vert vif, c'est qu'il y a des changements en attente. S'il est grisé ("Published"), tout est à jour.

---

## 👥 6. Gérer l'équipe (Ajouter/Supprimer des membres)

La gestion des utilisateurs (qui a le droit d'accéder au Studio) ne se fait pas ici, mais sur le tableau de bord central de Sanity.

1.  Allez sur le site **[sanity.io](https://www.sanity.io/)**.
2.  Connectez-vous avec votre compte administrateur (le même que pour le Studio).
3.  Dans la liste de vos projets, cliquez sur **"Kt'i"**.
4.  Dans le menu de gauche, cliquez sur **"Members"**.
5.  Sur cette page, vous pouvez :
    *   **Inviter un nouveau membre :** Cliquez sur "Add member", entrez son email et choisissez son rôle (**Editor** = peut modifier le contenu, **Administrator** = tous les droits).
    *   **Supprimer un membre :** Cliquez sur les trois petits points à côté d'un nom -> "Remove".
    *   **Changer les droits :** Cliquez sur le nom d'une personne pour modifier son rôle (ex: passer de Viewer à Editor).

---

## 🆘 En cas de problème

*   **Je ne vois pas mes changements sur le site :** Avez-vous cliqué sur "Publish" ? Avez-vous rafraîchi la page du site ?
*   **Le Studio ne charge pas :** Vérifiez votre connexion internet. Sanity est un outil en ligne.
