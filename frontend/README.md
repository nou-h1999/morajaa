# Morajaa frontend — Version complète de démonstration

3 octobre 2026. L’accueil V6 est la base visuelle validée. Les pages intérieures reprennent le même header, logo et thème prune / sable / crème ; elles restent à revoir visuellement.

## Lancer

Depuis ce dossier : `python -m http.server 8000`, puis ouvrir http://localhost:8000/index.html. L’ouverture directe de index.html fonctionne aussi, mais le comportement du stockage local dépend du navigateur. Aucune installation npm nécessaire.

## Pages

- index.html : accueil et recherche.
- recherche.html : filtres matière, ville, quartier, niveau, format et budget.
- profil.html : annonce détaillée et parcours déclaré.
- demande.html : demande de cours préremplie depuis le profil.
- compte.html et mot-de-passe.html : écrans d’accès et récupération.
- proposer.html : création d’une annonce en trois étapes.
- espace.html : vues J’apprends / Je donne des cours et demandes.
- mon-profil.html : profil privé d’apprentissage.
- accompagnements.html : liste des espaces.
- accompagnement.html : séances, notes et documents.
- seance.html : détail et contenus associés à une séance.
- contact.html : FAQ, contact, signalements et réexamen.
- admin.html : administration illustrative, sans protection réelle.
- conditions.html, confidentialite.html, mentions-legales.html : brouillons à finaliser.

## Sources et conservation

HTML des pages à la racine. Styles communs : assets/css/styles.css. Données fictives séparées : assets/js/demo-data.js. Comportements : assets/js/home.js et assets/js/pages.js. Logo original : assets/images/morajaa-logo.png.

Les archives précédentes de l’accueil restent disponibles ; cette archive contient les sources actuelles complètes. Ajouter ce dossier à GitHub pour disposer d’un historique de changements. Aucun secret ni document utilisateur ne doit y figurer.

## Interactions présentes

Recherche filtrée avec quartiers dépendant de la ville et paramètres URL ; profil sélectionné ; demande enregistrée ; formulaire d’annonce avec aperçu ; onglets ; acceptation d’une demande exemple ; création de séances (une ou quatre hebdomadaires) ; statut date passée distinct d’effectuée ; notes rattachées à la séance ; noms de documents ; pause et archive.

Le stockage local utilise la clé morajaa-demo-v1. Utiliser uniquement des informations fictives. Vider cette clé via les paramètres du navigateur remet les exemples à zéro. Rien n’est partagé entre deux personnes ni entre appareils.

## Limites explicites

Pas d’authentification, d’envoi email, de WhatsApp, de modération IA, de permissions effectives, de stockage de fichiers ou de notification serveur. Les mots de passe ne sont ni conservés ni transmis. Les documents ne sont pas téléversés : seuls leurs noms et tailles sont mémorisés. Le formulaire de contact n’envoie rien. Aucun profil n’est une personne réellement inscrite.

L’espace partagé est un seul exemple Salma / Mathématiques. Le compte et l’administration permettent uniquement de parcourir les écrans. Les contrôles de format côté navigateur ne remplacent pas ceux du serveur. Les rappels, modifications de récurrence, modification de notes et contrôle des droits restent à intégrer. Le prototype saisit les dates dans le fuseau du navigateur et les affiche en Africa/Casablanca ; la conversion exacte des saisies sera réalisée côté API.

## Intégration FastAPI

Se référer à docs/Morajaa-Specifications-MVP.md. Valider le contrat puis remplacer les données fictives et localStorage par les appels API. Appliquer authentification, autorisations de chaque ressource privée, validation serveur, stockage privé et URLs temporaires, journalisation et modération. L’état pending_check ne doit pas être interprété comme une publication.

Les textes juridiques sont provisoires. Ne pas déployer cette démonstration comme un service opérationnel.
