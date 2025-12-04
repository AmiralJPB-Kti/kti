# 🛍️ Guide du Vendeur - Kt'i (Spécial Expositions)

Ce guide est conçu pour t'accompagner lors de tes ventes sur les salons, marchés ou en direct à l'atelier. Il te permet d'enregistrer les ventes, de tenir ta comptabilité à jour instantanément et de générer des factures pro.

> **⚠️ Pré-requis indispensable :** Même pour les ventes "physiques", **tu as besoin d'une connexion Internet** (Partage de connexion 4G avec ton téléphone ou WiFi du salon) pour accéder à cette interface.

---

## 1. Accéder à ton Espace Vendeur

1.  Ouvre ton navigateur web (Chrome, Firefox, Safari...).
2.  Tape l'adresse du site : `https://kti.badie.eu/admin` (Tu peux le mettre en favori !).
3.  Si tu n'es pas connectée, entre tes identifiants (Email : `kti@badie.eu` + ton mot de passe).

---

## 2. Enregistrer une nouvelle vente (Le Formulaire)

C'est ici que tu vas passer le plus de temps. Quand un client t'achète quelque chose :

1.  Clique sur le bouton **"+ Nouvelle Vente"** (ou va dans le menu "Saisie Vente").
2.  **Date :** C'est celle d'aujourd'hui par défaut. Tu peux la changer si tu saisis des ventes de la veille.
3.  **Moyen de Paiement :** Choisis comment le client te paie :
    *   💳 **TPE (Carte Bancaire) :** Si tu as utilisé ton terminal SumUp ou autre.
    *   💶 **Espèces :** Pour le liquide.
    *   📝 **Chèque :** Pour les chèques.
4.  **Infos Client (Facultatif) :**
    *   *Nom :* Pratique pour te souvenir de qui a acheté quoi (ex: "Dame au chapeau rouge").
    *   *Email :* **Important** si la personne veut une facture ! Remplis-le pour pouvoir lui envoyer par mail plus tard.
5.  **Produits :**
    *   *Nom :* Écris ce que tu vends (ex: "Lampe bois flotté").
    *   *Qté :* La quantité (généralement 1).
    *   *Prix U :* Le prix unitaire (ex: 45).
    *   *Plusieurs objets ?* Clique sur **"+ Ajouter une ligne"**.
6.  **Validation :** Vérifie le **Total** en bas, puis clique sur le gros bouton bleu **"Valider la Vente"**.

✅ **Résultat :** Un message vert apparaît "Commande validée ! Facture : FAC-2025-XXXXX". C'est enregistré !

> **👨‍💻 Note Technique pour AmiralJP (Conséquences de l'action) :**
> *   **API Call :** Le formulaire envoie une requête `POST` vers `/api/admin/offline-orders`.
> *   **Numérotation :** Le serveur appelle la fonction SQL `get_next_invoice_number`. Il verrouille la séquence pour garantir qu'il n'y aura jamais deux factures avec le même numéro (ex: FAC-2025-00123), même si deux ventes se font en même temps.
> *   **Base de données :** Une ligne est créée dans la table `orders` avec `source = 'offline'` et le statut `paid`. Les produits sont ajoutés dans `order_items`.
> *   **Pas d'email auto :** Contrairement aux ventes web, **aucun email n'est envoyé automatiquement** au client à cette étape (pour éviter les erreurs de saisie ou le spam si l'email est faux). C'est à toi d'envoyer la facture manuellement si besoin (voir étape 4).

---

## 3. Voir les ventes de la journée (Le Tableau de Bord)

Pour voir où tu en es :
1.  Clique sur **"Tableau de Bord"** dans le menu de gauche.
2.  Tu vois la liste de toutes les commandes (les tiennes "Salon" et celles du "Site Web").
3.  Tu peux voir le **Montant**, la **Date** et le **Numéro de Facture**.

> **👨‍💻 Note Technique pour AmiralJP :**
> *   **Data Fetching :** La page appelle `/api/admin/orders`. Cette route utilise la clé `SERVICE_ROLE` de Supabase pour contourner les restrictions de sécurité (RLS) habituelles, car l'admin doit voir *toutes* les commandes, pas seulement les siennes.
> *   **Sécurité :** C'est pour cela que l'accès à `/admin` est protégé par le composant `AdminLayout` qui vérifie strictement l'email de l'utilisateur connecté.

---

## 4. Donner une facture au client

Si un client te demande une facture :
1.  Va sur le **"Tableau de Bord"**.
2.  Trouve la ligne de sa commande.
3.  Clique sur le bouton blanc **"📄 Facture"** à droite.
4.  Un fichier PDF (ex: `Facture-FAC-2025-00123.pdf`) se télécharge sur ton ordinateur/tablette.
5.  Ouvre-le pour vérifier.
6.  Tu peux maintenant **l'envoyer par email** au client depuis ta propre messagerie (Gmail, Outlook...).

> **👨‍💻 Note Technique pour AmiralJP :**
> *   **Génération Client-Side :** Le PDF est généré **instantanément** par le navigateur de ta sœur (via la librairie `jspdf`).
> *   **Pas de stockage :** Le fichier PDF *n'est pas* stocké sur le serveur. Il est recréé à la volée à chaque clic à partir des données brutes de la commande. Cela économise de l'espace de stockage et garantit que la facture est toujours à jour si tu modifies le nom du produit dans la base de données plus tard.
> *   **Mentions Légales :** Le PDF inclut automatiquement la mention "TVA non applicable, art. 293 B du CGI" nécessaire pour les auto-entrepreneurs.

---

## 🆘 En cas de problème

*   **"Ça tourne dans le vide" :** Vérifie ta connexion internet (4G/WiFi). Recharge la page (F5).
*   **"J'ai fait une erreur dans le prix !" :** Pas de panique. Note le numéro de la commande (ou l'heure) sur un papier. Tu ne peux pas (encore) modifier une commande validée depuis cette interface. Dis-le à AmiralJP le soir, il corrigera directement dans la base de données.
*   **"Je ne vois pas ma vente" :** Si le message vert est apparu, c'est enregistré. Recharge la page du Tableau de Bord.

Bonnes ventes ! 🚀
