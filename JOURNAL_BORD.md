# 📒 Journal de Bord - Projet Kti

Ce document récapitule nos échanges, les décisions prises et l'avancement du projet de manière simple, sans code technique.

---

## 📅 Dimanche 12 Avril 2026

### 🛠️ Sauvetage après plantage (Session de reprise)
*   **Contexte :** Une déconnexion est survenue en plein milieu d'une opération Git (sauvegarde), provoquant une inquiétude sur l'intégrité du projet.
*   **Actions menées :**
    *   Vérification de l'état du projet : les fichiers étaient bien présents mais la "fusion" (merge) n'était pas finalisée.
    *   Finalisation manuelle de la sauvegarde (Commit de fusion).
    *   Envoi définitif vers GitHub (Push).
*   **Résultat :** Le site **kti.badie.eu** est désormais à jour et en ligne avec toutes les dernières modifications (Migration Administration Supabase, Atelier, Stocks).
*   **Décision :** Création de ce journal de bord pour garder une trace lisible de nos conversations et éviter de perdre le fil en cas de nouveau plantage.

---

### 🎨 Amélioration Visuelle & "Paresse Intelligente" (Version finale)
*   **Design de l'accueil :**
    *   **Bannière :** Correction de l'affichage. L'image de la bannière s'affiche désormais en entier (largeur x hauteur) sans être coupée, quel que soit l'écran.
    *   **Nouveautés :** Réduction de la taille des vignettes produits pour une présentation plus élégante et aérée.
*   **Gestion de l'Atelier (Stocks & Production) :**
    *   **Réparations :** Correction des boutons "Modifier" et "Enregistrer" qui étaient bloqués dans les menus Stocks et Modèles.
    *   **Le Bouton "Paresseux" Évolué :** Désormais, lors de la suppression d'une fabrication dans le menu Production, vous avez le choix :
        *   **Option "Erreur de saisie" :** Le système rend automatiquement les matières au stock.
        *   **Option "Perte / Don" :** Le système supprime la ligne mais ne touche pas au stock.
    *   **Verrou de Sécurité :** Impossible de supprimer un modèle de sac (la recette) par accident s'il a déjà été fabriqué. Un message clair vous explique la procédure pour le faire en toute sécurité.
*   **Format des images :** Définition d'un standard de 2000x800 pixels pour vos futures bannières afin qu'elles soient toujours parfaites.

---
