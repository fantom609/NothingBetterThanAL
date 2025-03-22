# Projet Final

Bienvenue au projet de développement d’une application pour le cinéma **NothingBetterThanAL**, ouvert du lundi au vendredi de 9h à 20h.  
Ce projet consiste à créer une API RESTful en Node.js et TypeScript avec plusieurs fonctionnalités clés autour de la gestion d’un cinéma.  
Vous trouverez ci-dessous les détails et exigences :

---

## Gestion des Salles de Cinéma

### Objectif

- Implémenter les opérations CRUD (Créer, Lire, Mettre à jour, Supprimer) pour les salles de cinéma.
- Chaque salle doit avoir :
  - Un nom
  - Une description
  - Des images
  - Un type
  - Une capacité
  - Optionnellement un accès pour les personnes handicapées
- Il est nécessaire d’avoir au moins **10 salles**.

### Contraintes

- La capacité de chaque salle varie, **de 15 places minimum à 30 places maximum**.
- Les salles peuvent être mises en maintenance par les administrateurs, empêchant toute séance de s’y tenir (les utilisateurs ne doivent même plus voir ces séances dans cette salle).
- Tout utilisateur authentifié doit pouvoir consulter le planning d’une salle sur la période de son choix (passé ou futur). Par exemple, connaître l’intégralité du planning de la salle 6 sur une semaine donnée.

---

## Gestion des Séances

### Objectif

- Permettre aux **administrateurs** l’ajout, la modification et la suppression de séances.
- **N’importe quel** utilisateur peut consulter les séances programmées.
- Il est important de planifier au moins **un mois** de séances à l’avance.

### Contraintes

- Éviter les chevauchements de séances pour un même film dans différentes salles.
- Chaque séance doit durer au moins la durée du film **+ 30 minutes** (pour les publicités et le nettoyage).
- Tout utilisateur authentifié doit être capable de regarder le planning des séances sur une période choisie.
- L’utilisateur doit également pouvoir consulter pour chaque séance :
  - Le nombre de billets vendus
  - Le nombre de spectateurs ayant assisté à la séance

---

## Gestion des Films

### Objectif

- Permettre aux **administrateurs** d’ajouter, de modifier et de supprimer des films.
- **N’importe quel** utilisateur peut consulter la liste des films disponibles.
- Tout utilisateur authentifié doit être capable de consulter le planning des films diffusés dans le cinéma sur une période choisie (par exemple, voir toutes les séances de “La Reine des Neiges” sur une semaine).

---

## Utilisateurs de l’API

### Rôles

- **Administrateurs** : droits avancés (gestion des salles, séances, films, etc.).
- **(BONUS) Super Administrateurs** : peuvent, en plus, gérer le planning des employés.
- **Clients** : peuvent consulter les plannings des salles, des séances, des films, etc.

### Fonctionnalités

- Un utilisateur doit pouvoir se créer un compte, s’authentifier et se déconnecter (logout : suppression de tous ses tokens).
- Chaque route de l’API ne doit être accessible **qu’aux utilisateurs authentifiés**.
- Les administrateurs doivent pouvoir :
  - Visualiser les utilisateurs de l’API
  - Voir des données précises sur leur compte et leur activité dans le cinéma (films vus, par exemple)

---

## Gestion des Billets

### Objectif

- Implémenter un système de billetterie permettant la **validation** de l’accès aux séances.
- Proposer deux types de billets :
  - **Billet simple** : donne accès à une séance.
  - **Super Billet** : permet d’accéder à **10 séances**.
- Les utilisateurs doivent pouvoir savoir quels billets ils ont utilisés et pour quelles séances.

---

## Gestion de l’Argent

### Objectif

- Permettre aux utilisateurs de :
  - Gérer leur compte en euros
  - Acheter des billets
  - Consulter leurs transactions et leur solde
- Les administrateurs peuvent voir les transactions de tous les clients.
- Un utilisateur doit pouvoir :
  - Déposer de l’argent sur son compte
  - En retirer
  - Consulter l’historique de ses transactions datées (achats de billets)

---

## Statistiques et Fréquentation

### Objectif

- Suivre **quotidiennement** et **hebdomadairement** l’affluence dans les salles et dans le cinéma en général.
- Inclure un suivi **en temps réel** du taux de fréquentation.
- Récupérer les statistiques de fréquentation sur une période donnée.

---

## Conseils et Exigences

- Mettre en **production** l’application et la base de données est **obligatoire**.
- Une **documentation** de l’API (Swagger/OpenAPI recommandé) est **indispensable**.
- Utiliser des formats de dates **standardisés** (ISO-8601 conseillé).
- Architecturer l’API soigneusement pour en simplifier l’utilisation.
- Certaines règles implicites doivent être prises en compte (logique métier), par exemple :
  - On ne peut pas créer de séance quand le cinéma est fermé (avant 9h ou après 20h).
  - On ne peut pas vendre un billet à un utilisateur qui n’a pas assez d’argent sur son compte.

---

## (Bonus) Gestion du Planning des Employés

### Objectif

- Gérer le planning des employés du cinéma, incluant des postes spécifiques.
- **Restriction** : un seul employé par poste à un instant T.
- Postes : confiserie, accueil, projectionniste.
- Pour que le cinéma ouvre, **chaque poste** doit avoir un travailleur.
- CRUD pour la gestion des employés.

---

## Techniquement

- Authentification **via token stateful** en utilisant un mécanisme de **refresh token**.
- Les `access_token` doivent avoir une durée de validité de **5 minutes max**.
- L’application doit être mise en production, disponible via **HTTPS** et **dockerisée**.
- Une **image de production** ne doit pas contenir du TypeScript (code transpilé uniquement).

---

## Bonus

- Conteneuriser l’application et la base de données (développement et production).
- Intégrer des tests (unitaires, d’intégration ou end-to-end).
- Mettre en place un système de **sauvegarde des données** (backup).
- Ajouter de l’**observabilité** (Prometheus, Grafana).
- Mettre en place un **système de logs** (Loki, logs formatés en JSON, etc.).
- Mettre en place une **intégration continue** (CI) : GitLab-CI, GitHub Actions, Jenkins...
- Gérer les **conditions de concurrence** (ex. vente de places pour une séance).
- Toute amélioration supplémentaire sera appréciée (belle architecture, infrastructure, front-end…).

---

## Soutenance

- Préparer l’API pour une démonstration.
- Inclure un scénario de requêtes illustrant **chaque fonctionnalité implémentée**.
