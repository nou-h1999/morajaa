# Inscription Morajaa — frontend uniquement

Remplacez frontend/compte.html et frontend/assets/js/pages.js par les fichiers de cette archive. Le thème et le header sont conservés. pages.js conserve aussi les ajustements de validation manuelle préparés précédemment.

En local, servez le frontend via http://localhost (par exemple python -m http.server 5500 depuis frontend), avec FastAPI sur http://127.0.0.1:8000.
Dans compte.html, data-register-url définit l’adresse de l’API. Remplacez-la par l’URL HTTPS du backend pour la mise en ligne. Les appels au backend local depuis un site public sont bloqués.

Contrat attendu : POST /api/v1/auth/register, JSON { "firstName": "Mohamed", "email": "adresse@example.com", "password": "mot de passe" }. Le champ firstName reprend le nom du formulaire ; votre développeur doit confirmer ou adapter ce nom au schéma FastAPI. Une réponse 2xx signifie création réussie ; 409 email déjà utilisé, 422 données invalides, 429 limite de tentatives.

Le backend doit autoriser l’origine du frontend via CORS. Aucun fichier Python n’est modifié. Le frontend n’enregistre pas les identifiants dans state/localStorage et ne prétend pas ouvrir une session. La connexion reste une démonstration en attendant son endpoint.

Vérification : syntaxe JavaScript et tests simulés (succès, doublon, validation, réseau, double soumission, blocage du localhost depuis un site public). La connexion à MariaDB n’a pas été testée.

