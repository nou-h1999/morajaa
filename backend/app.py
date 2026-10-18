from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import Optional
from fastapi import Depends
from sqlalchemy import func
from fastapi import HTTPException
# On importe nos 3 autres fichiers
import models, schemas, database
from database import engine, SessionLocal
import os
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
import security # Ton nouveau fichier
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt


# On indique à Swagger où aller chercher le token (l'URL de ta route de connexion)


# Charge les variables du fichier .env
load_dotenv() 

# Exemple d'utilisation pour le CORS
frontend_urls = os.getenv("FRONTEND_URL", "").split(",")
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
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_utilisateur_actuel(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    erreur_auth = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Non autorisé : Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # On lit le token avec la clé secrète
        cle_secrete = os.getenv("SECRET_KEY", "cle_secrete_par_defaut") 
        algorithme = os.getenv("ALGORITHM", "HS256")
        
        payload = jwt.decode(token, cle_secrete, algorithms=[algorithme])
        id_utilisateur: str = payload.get("sub")
        
        if id_utilisateur is None:
            raise erreur_auth
    except JWTError:
        raise erreur_auth
        
    # On vérifie que le tuteur existe toujours dans la base de données MariaDB
    utilisateur = db.query(models.Utilisateur).filter(models.Utilisateur.id == id_utilisateur).first()
    if utilisateur is None:
        raise erreur_auth
        
    return utilisateur

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


@app.post("/api/v1/annonces")
def creer_annonce(
    annonce_data: schemas.AnnonceCreate, 
    db: Session = Depends(get_db),
    # La Douane : FastAPI exige un token valide avant même d'exécuter la suite
    utilisateur_courant: models.Utilisateur = Depends(get_utilisateur_actuel) 
):
    
    # 1. RÈGLE MÉTIER : Vérifier que le quartier appartient bien à la ville
    if annonce_data.ville_id and annonce_data.quartier_id:
        quartier_valide = db.query(models.Quartier).filter(
            models.Quartier.id == annonce_data.quartier_id,
            models.Quartier.ville_id == annonce_data.ville_id
        ).first()
        
        if not quartier_valide:
            raise HTTPException(
                status_code=400, 
                detail="Ce quartier n'appartient pas à la ville sélectionnée."
            )

    # 2. RÈGLE MÉTIER : L'auteur (Terminé la simulation !)
    # On récupère le vrai ID extrait du token sécurisé
    utilisateur_connecte_id = utilisateur_courant.id 

    # 3. Création de l'objet pour la base de données
    nouvelle_annonce = models.Annonce(
        auteur_id=utilisateur_connecte_id,
        parcours=annonce_data.parcours,
        description=annonce_data.description,
        disponibilites=annonce_data.disponibilites,
        matiere=annonce_data.matiere,
        niveau=annonce_data.niveau,
        format=annonce_data.format,
        ville_id=annonce_data.ville_id,
        quartier_id=annonce_data.quartier_id,
        tarif=annonce_data.tarif
    )

    db.add(nouvelle_annonce)
    db.commit()
    db.refresh(nouvelle_annonce)

    return {"message": "Annonce soumise avec succès", "statut": nouvelle_annonce.statut}

@app.get("/api/v1/referentiels/villes")
def lister_toutes_les_villes(db: Session = Depends(get_db)):
    # On prend absolument toutes les villes de la table
    villes = db.query(models.Ville).all()
    return [{"id": v.id, "nom": v.nom} for v in villes]

# Ceci indique à FastAPI où les utilisateurs doivent envoyer leurs identifiants pour obtenir le token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# --- LA NOUVELLE ROUTE DE CONNEXION ---
@app.post("/api/v1/auth/login")
def connexion(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. On cherche l'utilisateur par son email (FastAPI met l'email dans form_data.username par convention)
    utilisateur = db.query(models.Utilisateur).filter(models.Utilisateur.email == form_data.username).first()
    
    # 2. Si l'utilisateur n'existe pas ou si le mot de passe est faux
    if not utilisateur or not pwd_context.verify(form_data.password, utilisateur.mot_de_passe_hache):
        raise HTTPException(
            status_code=401,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 3. Les identifiants sont bons, on prépare le token
    access_token_expires = security.timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # On met l'ID de l'utilisateur dans le token (sous le nom "sub" pour "subject")
    access_token = security.creer_access_token(
        data={"sub": str(utilisateur.id)}, expires_delta=access_token_expires
    )
    
    # 4. On renvoie le token au front-end
    return {"access_token": access_token, "token_type": "bearer"}