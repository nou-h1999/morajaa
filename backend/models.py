#dessiner les tables
from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

# 1. LA TABLE UTILISATEURS
class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    prenom = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    mot_de_passe_hache = Column(String(255), nullable=False)
    date_creation = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Les liens vers les autres tables
    profil = relationship("ProfilApprentissage", back_populates="utilisateur", uselist=False)
    annonce = relationship("Annonce", back_populates="auteur", uselist=False)

# 2. LA TABLE DES PROFILS D'APPRENTISSAGE
class ProfilApprentissage(Base):
    __tablename__ = "profils_apprentissage"

    id = Column(Integer, primary_key=True, index=True)
    utilisateur_id = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False, unique=True)
    
    niveau = Column(String(50))
    matieres = Column(String(255))
    objectifs = Column(Text)

    utilisateur = relationship("Utilisateur", back_populates="profil")
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

# 1. LA TABLE VILLE
class Ville(Base):
    __tablename__ = "villes"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), unique=True, nullable=False) # Ex: "Rabat"
    
    # Relation : Une ville contient plusieurs quartiers et plusieurs annonces
    quartiers = relationship("Quartier", back_populates="ville")
    annonces = relationship("Annonce", back_populates="ville_ref")

# 2. LA TABLE QUARTIER
class Quartier(Base):
    __tablename__ = "quartiers"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), nullable=False) # Ex: "Agdal"
    
    # Clé étrangère : Chaque quartier appartient à une ville
    ville_id = Column(Integer, ForeignKey("villes.id"), nullable=False)
    
    # Relations
    ville = relationship("Ville", back_populates="quartiers")
    annonces = relationship("Annonce", back_populates="quartier_ref")

# 3. MODIFICATION DE LA TABLE ANNONCE (Mise à jour de l'existant)

class Annonce(Base):
    __tablename__ = "annonces"

    id = Column(Integer, primary_key=True, index=True)
    # L'auteur sera défini par le serveur
    auteur_id = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False)
    
    # Champs textuels selon ton contrat
    parcours = Column(Text, nullable=False)
    description = Column(Text, nullable=False) # Remplace presentation/approche
    disponibilites = Column(Text, nullable=True) # Nouveau champ facultatif
    
    # Critères
    matiere = Column(String(50), index=True, nullable=False)
    niveau = Column(String(50), index=True, nullable=False)
    format = Column(String(50), nullable=False) # Remplace format_cours
    
    # Localisation (Peuvent être vides pour le 100% en ligne)
    ville_id = Column(Integer, ForeignKey("villes.id"), nullable=True)
    quartier_id = Column(Integer, ForeignKey("quartiers.id"), nullable=True)
    
    # Prix et statut
    tarif = Column(Numeric(10, 2), nullable=False)
    statut = Column(String(50), default="pending_review") # Le serveur attribue ce statut
    date_creation = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relations
    auteur = relationship("Utilisateur", back_populates="annonce")
    ville_ref = relationship("Ville", back_populates="annonces")
    quartier_ref = relationship("Quartier", back_populates="annonces")

class Matiere(Base):
    __tablename__ = "matieres"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), unique=True, nullable=False)