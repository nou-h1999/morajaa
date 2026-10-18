# Frontend Morajaa

Morajaa met en relation des personnes recherchant un cours au Maroc et des personnes capables de les accompagner. La mise en relation est gratuite au lancement ; les cours sont rémunérés au tarif annoncé. Les annonces sont publiées après validation.

## Ouvrir le site en local

Depuis le dossier frontend du dépôt, lancer :

```bash
python3 -m http.server 5500
```

Ouvrir http://localhost:5500. Pour les fonctions API, le backend doit tourner séparément, être configuré et autoriser cette origine via CORS. Ne pas ouvrir les fichiers avec file://.

## Organisation

| Fichier | Fonction |
| --- | --- |
| index.html | Accueil et choix de recherche |
| recherche.html | Filtres et résultats |
| profil.html | Présentation d’une annonce |
| compte.html | Interfaces d’accès au compte |
| proposer.html | Préparation d’une annonce en trois étapes |
| 404.html | Page introuvable, chemins adaptés au site GitHub Pages |
| contact.html | Aide et contact |
| espace.html et pages d’accompagnement | Espaces en attente de connexion au backend |
| assets/css/styles.css | Palette, mise en page et adaptation mobile |
| assets/js/home.js | Navigation depuis l’accueil |
| assets/js/pages.js | Recherche API, inscription, onglets et aperçu d’annonce |
| assets/js/config.js | Adresse API, activation de l’inscription et contact |

## Parcours

Recherche : accueil → matière et ville → résultats → profil → prise de contact (à connecter).

Annonce : présentation → matière, niveau, lieu, format et tarif → aperçu → envoi (désactivé actuellement) → validation → publication (à connecter).

Compte : inscription → création du compte par l’API → connexion (à développer) → espace personnel.

## Configuration actuelle

Sur localhost, config.js utilise http://127.0.0.1:8000. Sur le site public, apiBaseUrl est vide et l’inscription désactivée. Renseigner une URL HTTPS réelle avant activation publique. Ne pas ajouter de clé secrète ou de mot de passe dans les scripts du navigateur.

La recherche utilise GET /api/v1/annonces/recherche avec matiere et ville. L’inscription utilise POST /api/v1/auth/register avec firstName, email et password. Les filtres statiques et les identifiants MariaDB doivent encore être harmonisés. Une ville ajoutée à backend/data.json ne remplit pas automatiquement les menus.

Les pages de suivi et le formulaire d’annonce ne créent pas de données réelles dans leur état actuel. Un aperçu affiché ne prouve pas un enregistrement en base.

## Contribuer

Conserver le header et la palette prune, sable et crème. Utiliser des labels de formulaire, un focus visible, des messages d’erreur précis et des boutons désactivés pour les fonctions non disponibles. Ne pas remplacer un message d’erreur par un faux succès.

Avant livraison, tester les petits écrans, le clavier, les champs invalides, les retours entre étapes, l’état vide et le service indisponible. Le compte rendu du 18 octobre 2026 est dans docs/qa.

## Publication

Le workflow GitHub Pages publie frontend. Cette documentation doit rester dans docs/frontend à la racine du dépôt, hors du dossier frontend publié. Les données fictives restent dans backend/fixtures et ne doivent pas être chargées dans la base publique.
