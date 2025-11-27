# 📘 Guide Quotidien du Développeur - Projet Kt'i

Ce document est destiné à tous les membres de l'équipe travaillant sur le site Kt'i.
**Objectif :** S'assurer que tout le monde travaille sur la même version du site et que le travail est bien sauvegardé à la fin de la journée.

---

## ☀️ 1. Au début de la session (Le Matin)

Avant de commencer à modifier quoi que ce soit, il faut s'assurer que votre ordinateur est à jour avec le travail des autres et lancer les outils nécessaires.

### Étape A : Ouvrir le Terminal
Ouvrez votre terminal Linux et naviguez vers le dossier du projet.
```bash
cd ~/Dev/kti/kti
```
*(Adaptez le chemin si votre dossier est rangé ailleurs)*

### Étape B : Récupérer les dernières modifications
C'est l'étape la plus importante pour éviter les conflits !
```bash
git pull
```
*   **Si tout va bien**, il affichera "Already up to date" ou une liste de fichiers modifiés.
*   **Si vous voyez une erreur**, ne touchez à rien et contactez le responsable technique.

### Étape C : Installer les nouvelles "briques" (Optionnel mais recommandé)
Parfois, de nouveaux outils sont ajoutés au projet. Pour être sûr de les avoir :
```bash
npm install
```

### Étape D : Lancer l'environnement (La technique des "2 Fenêtres")
Pour que le site fonctionne avec les paiements (Stripe), nous avons besoin de deux terminaux ouverts en parallèle.

**Fenêtre Terminal 1 : Le lien avec Stripe**
Copiez-collez cette commande pour permettre à Stripe de communiquer avec votre ordinateur local :
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
> **Important :** Une fois la commande lancée, elle va afficher une ligne commençant par `whsec_...`.
> Vérifiez que cette clé correspond bien à celle dans votre fichier `.env.local` (variable `STRIPE_WEBHOOK_SECRET`). Si ce n'est pas le cas, mettez à jour le fichier `.env.local`.

**Fenêtre Terminal 2 : Le Site Web**
Ouvrez un **nouveau** terminal (ou un nouvel onglet), retournez dans le dossier (`cd ~/Dev/kti/kti`) et lancez :
```bash
npm run dev
```

✅ **C'est prêt !** Vous pouvez ouvrir `http://localhost:3000` dans votre navigateur.

---

## 🌙 2. À la fin de la session (Le Soir)

Une fois votre travail terminé, il faut "enregistrer" vos modifications dans l'historique du projet et les envoyer sur le serveur (ce qui mettra à jour le site en production sur Vercel).

### Étape A : Arrêter les serveurs
Dans vos terminaux, faites la combinaison de touches `CTRL + C` pour arrêter le site et Stripe.

### Étape B : Vérifier ce que vous avez fait
```bash
git status
```
Les fichiers en **rouge** sont ceux que vous avez modifiés mais pas encore validés.

### Étape C : Préparer l'envoi (Le Carton)
On met tous les fichiers modifiés dans le "carton" d'expédition :
```bash
git add .
```

### Étape D : Étiqueter le travail (Le Commit)
On ferme le carton avec une étiquette explicative. Soyez précis !
*   *Mauvais exemple :* "modif"
*   *Bon exemple :* "Correction du texte sur la page contact" ou "Ajout photo produit bougie"

```bash
git commit -m "Votre message explicatif ici"
```

### Étape E : Envoyer vers le Cloud (Le Push)
C'est l'étape qui envoie votre travail sur GitHub et déclenche la mise à jour du site public.
```bash
git push
```
Si le terminal ne signale aucune erreur, c'est gagné ! 🎉

---

## 🆘 En cas de problème

Si lors du `git pull` ou du `git push` vous voyez des messages parlant de **"CONFLICT"** (Conflit) ou **"MERGE"** :
1.  Ne paniquez pas.
2.  Ne forcez aucune commande.
3.  Appelez le responsable technique pour résoudre le conflit proprement.
