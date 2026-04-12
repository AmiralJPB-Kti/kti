# 📒 Journal de Bord - Projet Kti

Ce document récapitule nos échanges, les décisions prises et l'avancement du projet de manière simple, sans code technique.

---

## 📅 Dimanche 12 Avril 2026

### 🛠️ Sauvetage après plantage (Session de reprise)
*   **Contexte :** Une déconnexion est survenue en plein milieu d'une opération Git, rendant le projet instable.
*   **Actions menées :** Finalisation manuelle de la sauvegarde et mise en ligne du site.
*   **Résultat :** Le site est parfaitement à jour.

### 🎨 Amélioration Visuelle & "Paresse Intelligente" (Version finale)
*   **Design :** Bannière affichée en entier (sans rognage) et vignettes optimisées.
*   **Gestion Atelier :** 
    *   Correction des formulaires de modification (Stocks & Modèles).
    *   **Bouton "Paresseux" :** Suppression intelligente dans la production avec retour automatique des matériaux en stock.
    *   **Verrou de sécurité :** Impossible de supprimer par erreur un modèle en cours d'utilisation.
*   **Gestion des images :** Résolution du blocage sur l'importation des photos via l'interface de gestion des produits (autorisations de stockage Supabase).
*   **Méthodologie :** Mise en place d'une charte de rigueur pour les injections SQL (fichiers dédiés dans `/SQL/`, traçabilité Git).
