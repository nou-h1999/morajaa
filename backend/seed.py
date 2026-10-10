import json
from database import SessionLocal
from models import Ville, Quartier, Matiere

def remplir_base_de_donnees():
    # On ouvre une connexion à MariaDB
    db = SessionLocal()
    try:
        # 1. On lit le fichier JSON
        with open("data.json", "r", encoding="utf-8") as fichier:
            donnees = json.load(fichier)

        print("Démarrage du remplissage automatique...")

        # 2. Remplir les MATIÈRES
        for nom_matiere in donnees["matieres"]:
            # On vérifie si la matière existe déjà pour éviter les erreurs (doublons)
            matiere_existante = db.query(Matiere).filter(Matiere.nom == nom_matiere).first()
            if not matiere_existante:
                db.add(Matiere(nom=nom_matiere))
        
        # On sauvegarde les matières
        db.commit()

        # 3. Remplir les VILLES et QUARTIERS
        for ville_data in donnees["villes"]:
            # Vérifier si la ville existe
            ville = db.query(Ville).filter(Ville.nom == ville_data["nom"]).first()
            if not ville:
                ville = Ville(nom=ville_data["nom"])
                db.add(ville)
                db.commit() # On sauvegarde immédiatement pour que MariaDB génère l'ID de la ville
                db.refresh(ville) # On récupère l'ID fraîchement généré

            # Parcourir les quartiers de cette ville
            for nom_quartier in ville_data["quartiers"]:
                quartier_existant = db.query(Quartier).filter(
                    Quartier.nom == nom_quartier, 
                    Quartier.ville_id == ville.id
                ).first()
                
                if not quartier_existant:
                    nouveau_quartier = Quartier(nom=nom_quartier, ville_id=ville.id)
                    db.add(nouveau_quartier)

        # On valide tous les quartiers d'un coup
        db.commit()
        print("Succès : Les villes, quartiers et matières ont été ajoutés à MariaDB !")

    except Exception as e:
        print(f"Une erreur est survenue : {e}")
    finally:
        # On ferme proprement la connexion
        db.close()

# Cette ligne permet d'exécuter la fonction uniquement si on lance ce fichier directement
if __name__ == "__main__":
    remplir_base_de_donnees()