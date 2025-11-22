# Guide de Méthode : GitHub, Stripe CLI & Travail en Équipe
**Projet :** Kti E-commerce  
**Date de mise à jour :** 22 Novembre 2025

Ce document explique comment travailler sur le projet avec plusieurs machines (Linux, Windows 10, Windows 11), comment gérer les paiements avec Stripe CLI (qui remplace Ngrok), et comment synchroniser le travail via GitHub.

---

## 1. Comprendre la nouvelle logique (Stripe CLI)

Nous n'utilisons plus **Ngrok**. Nous utilisons désormais **Stripe CLI** pour tester les paiements.

### Le concept clé : Les clés de sécurité (Important !)
Contrairement au code du site qui est partagé par tout le monde, **les clés de sécurité sont personnelles et temporaires**.

*   **En Production (Le vrai site sur Vercel) :** Il utilise une clé fixe et définitive configurée dans les réglages de Vercel. Personne n'y touche.
*   **En Local (Sur votre ordinateur) :** Chaque fois que vous lancez Stripe, il vous donne une clé "jetable" pour la session (commençant par `whsec_...`).
*   **La Règle d'Or :** Chaque développeur (AmiralJP, Sœur, etc.) aura sa propre clé `whsec_` différente sur sa machine. **Il ne faut jamais essayer de synchroniser ou d'envoyer le fichier `.env.local` sur GitHub.**

---

## 2. Installation (À faire une seule fois par machine)

### A. Pour les machines SOUS LINUX (Déjà fait sur la machine principale)
1.  Télécharger le fichier `.deb` depuis les releases GitHub de Stripe.
2.  Installer avec `sudo dpkg -i stripe.deb`.
3.  Lier au compte : Taper `stripe login` dans le terminal et suivre le lien.

### B. Pour les machines SOUS WINDOWS (10 et 11)
La procédure est identique pour Windows 10 et 11.

1.  **Télécharger :** Allez sur [GitHub Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases/latest).
2.  Cherchez la section "Assets" et téléchargez le fichier `stripe_X.X.X_windows_x86_64.zip`.
3.  **Installer (Méthode simple) :**
    *   Décompressez le fichier ZIP. Vous obtiendrez un fichier `stripe.exe`.
    *   Copiez ce fichier `stripe.exe` et collez-le **directement dans le dossier du projet `kti`** (là où se trouve `package.json`). C'est le plus simple pour éviter les problèmes de "Chemin/Path".
4.  **Lier au compte :**
    *   Ouvrez votre terminal (PowerShell ou Invite de commande) dans le dossier du projet.
    *   Tapez `./stripe login` (le `./` est important sur PowerShell).
    *   Appuyez sur Entrée. Un code s'affiche.
    *   Appuyez à nouveau sur Entrée pour ouvrir le navigateur et connectez-vous au compte Stripe du projet.
    *   C'est validé !

---

## 3. Routine de Travail Quotidienne (La "Checklist")

À chaque fois que vous commencez à travailler sur le site, suivez cet ordre précis :

### Étape 1 : Récupérer les nouveautés (GitHub)
Avant de toucher à quoi que ce soit, assurez-vous d'avoir la dernière version du code des autres.
Dans le terminal :
```bash
git pull
```
*   *Si de nouveaux "paquets" ont été installés (fichier package.json modifié)* : lancez `npm install`.
*   *Si la base de données a changé* : Comme nous utilisons Supabase (Cloud), la base de données est commune. Si quelqu'un ajoute une colonne (comme nous l'avons fait pour `shipping_address`), elle est disponible pour tout le monde immédiatement. Rien à faire !

### Étape 2 : Lancer Stripe (Pour les paiements)
Ouvrez un **premier terminal** et lancez :

**Sous Linux :**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Sous Windows :**
```powershell
.\stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

1.  Une fois lancé, repérez la ligne : `Your webhook signing secret is whsec_xxxxxxxxxxxxxxxx`
2.  Copiez cette clé (`whsec_...`).
3.  Laissez ce terminal **OUVERT**.

### Étape 3 : Configurer la clé secrète
1.  Ouvrez le fichier `.env.local` dans votre éditeur de code.
2.  Cherchez la ligne : `STRIPE_WEBHOOK_SECRET=...`
3.  Remplacez l'ancienne clé par la nouvelle que vous venez de copier.
4.  Sauvegardez le fichier.

### Étape 4 : Lancer le site
Ouvrez un **second terminal** et lancez :
```bash
npm run dev
```

Vous êtes prêt à travailler !

---

## 4. Résolution des problèmes fréquents

**Problème : "La commande n'apparaît pas dans Supabase après le paiement"**
*   **Cause :** Votre site a rejeté le message de Stripe car la clé de sécurité est incorrecte.
*   **Solution :** Vérifiez que la clé `whsec_` affichée dans le terminal Stripe est bien exactement la même que celle dans votre fichier `.env.local`. Si vous avez changé le fichier, n'oubliez pas de **redémarrer** le serveur (`npm run dev`).

**Problème : "Commande non trouvée" sous Windows**
*   **Cause :** Windows ne trouve pas `stripe.exe`.
*   **Solution :** Assurez-vous d'avoir mis le fichier `stripe.exe` dans le dossier où vous êtes, et utilisez bien `.\stripe` (avec le point et l'anti-slash) au lieu de juste `stripe`.

**Problème : Conflit lors du `git pull`**
*   **Cause :** Vous et une autre personne avez modifié exactement la même ligne de code.
*   **Solution :** C'est le seul cas où il faut des compétences techniques. Si ça arrive, ne forcez rien et demandez de l'aide pour "fusionner" (merge) les fichiers.

---

## 5. Mise en ligne (Vercel)

Pour mettre à jour le vrai site public :
1.  Faites vos modifications en local.
2.  Validez vos changements :
    ```bash
    git add .
    git commit -m "Description de ce que j'ai fait"
    git push
    ```
3.  Vercel détectera automatiquement le `git push` et mettra à jour le site en quelques minutes.
4.  **Important :** Sur Vercel, Stripe fonctionne avec une clé fixe. Vous n'avez PAS besoin de faire la manip `stripe listen`.
