# Morajaa frontend — Accueil V2

Reconstruction du 3 octobre 2026. Cette version reprend la capture du modèle validé ; les dimensions et couleurs sont reconstruites, sans prétendre restituer le code original.

Ouvrir index.html dans un navigateur, ou lancer `python -m http.server 8000` depuis ce dossier puis visiter http://localhost:8000.

## Fichiers sources

- index.html : page d’accueil.
- assets/css/styles.css : palette et styles responsive.
- assets/js/home.js : interactions de démonstration sans backend.

La recherche valide les champs et affiche le choix ; elle n’envoie aucune demande. Le bouton d’offre affiche un état provisoire. Les autres pages seront ajoutées progressivement. Logo graphique validé inclus. Mise en page reconstruite selon la capture reçue. Palette : prune #51465e, crème #fffdfa, sable #f1ebdf.

## Conservation

Chaque livraison comporte une archive des sources enregistrée et téléchargeable. Conserver aussi une copie locale et ajouter les fichiers au dépôt GitHub pour disposer d’un historique durable. Ne pas confondre l’aperçu inline avec les fichiers sources.

## Backend

Prévu pour FastAPI, sans dépendance frontend ni clé secrète. Les appels API seront ajoutés après validation du contrat. Ne pas présenter ce prototype comme une application avec comptes, publication ou stockage fonctionnels.
