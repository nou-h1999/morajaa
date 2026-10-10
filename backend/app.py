from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import Optional
from fastapi import Depends
from sqlalchemy import func

# On importe nos 3 autres fichiers
import models, schemas, database
from database import engine, SessionLocal

# 1. On demande à SQLAlchemy de créer la table dans MariaDB si elle n'existe pas
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Morajaa API")

# --- CONFIGURATION CORS (Comme vu précédemment) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- OUTIL DE HACHAGE DES MOTS DE PASSE ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hacher_mot_de_passe(mot_de_passe_clair: str):
    return pwd_context.hash(mot_de_passe_clair)

# --- GESTIONNAIRE DE BASE DE DONNÉES ---
# Cette fonction ouvre la connexion à MariaDB le temps de la requête, puis la referme proprement
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- LA ROUTE D'INSCRIPTION ---
@app.post("/api/v1/auth/register", response_model=schemas.UserResponse)
def inscrire_utilisateur(utilisateur: schemas.UserCreate, db: Session = Depends(get_db)):
    # ÉTAPE A : Vérifier si l'email existe déjà dans MariaDB
    # On fait une requête SQL : SELECT * FROM utilisateurs WHERE email = "..."
    utilisateur_existant = db.query(models.Utilisateur).filter(models.Utilisateur.email == utilisateur.email).first()
    
    if utilisateur_existant:
        raise HTTPException(status_code=409, detail="Cet email est déjà utilisé.")

    # ÉTAPE B : Hacher le mot de passe pour la sécurité
    mot_de_passe_securise = hacher_mot_de_passe(utilisateur.password)

    # ÉTAPE C : Créer le nouvel objet Utilisateur pour la base de données
    nouvel_utilisateur = models.Utilisateur(
        prenom=utilisateur.firstName,
        email=utilisateur.email,
        mot_de_passe_hache=mot_de_passe_securise
    )

    # ÉTAPE D : Sauvegarder dans MariaDB
    db.add(nouvel_utilisateur) # On prépare l'ajout
    db.commit()                # On valide et on écrit sur le disque dur
    db.refresh(nouvel_utilisateur) # On récupère l'ID généré par MariaDB

    # ÉTAPE E : On renvoie les informations (FastAPI va filtrer grâce à UserResponse)
    # On passe à firstName car c'est ce que notre UserResponse (et notre front-end) attend
    return {
        "id": nouvel_utilisateur.id,
        "firstName": nouvel_utilisateur.prenom,
        "email": nouvel_utilisateur.email
    }





@app.get("/api/v1/annonces/recherche")
def rechercher_annonces(
    matiere: Optional[str] = None, # Optional veut dire que le champ n'est pas obligatoire
    ville: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # 1. On prépare la requête de base : "Prends toutes les annonces"
    # On ajoute souvent un filtre pour ne prendre que les annonces publiées
    requete = db.query(models.Annonce).filter(models.Annonce.statut == "published")
    
    # 2. On ajoute les filtres dynamiquement (seulement si l'utilisateur les a remplis)
    if matiere:
        # SQL généré : WHERE matiere = '...'
        requete = requete.filter(models.Annonce.matiere == matiere)
        
    if ville:
        # SQL généré : WHERE ville = '...'
        requete = requete.filter(models.Annonce.ville == ville)
        
    # 3. On exécute la requête et on récupère les résultats
    resultats = requete.all()
    
    # FastAPI va automatiquement transformer cette liste d'objets en vrai JSON pour le navigateur
    return resultats

@app.get("/api/v1/referentiels/villes-actives")
def lister_villes_actives(db: Session = Depends(get_db)):
    
    # Le fonctionnement interne (SQLAlchemy) :
    # 1. On part de la table Ville.
    # 2. On fait une jointure (join) avec la table Annonce. Si une ville n'a pas d'annonce, elle est éliminée.
    # 3. On filtre pour ne garder que les annonces qui sont 'published'.
    # 4. On utilise 'distinct()' pour que "Rabat" n'apparaisse qu'une seule fois, 
    #    même s'il y a 50 annonces à Rabat.
    
    villes_actives = db.query(models.Ville)\
        .join(models.Annonce, models.Ville.id == models.Annonce.ville_id)\
        .filter(models.Annonce.statut == "published")\
        .distinct()\
        .all()
        
    # On renvoie une liste propre au front-end
    return [{"id": ville.id, "nom": ville.nom} for ville in villes_actives]