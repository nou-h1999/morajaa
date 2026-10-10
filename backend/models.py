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
    # ... (tes autres colonnes : id, tarif, auteur_id, etc.) ...

    # Au lieu d'avoir Column(String(50)), on pointe vers les tables de référence
    ville_id = Column(Integer, ForeignKey("villes.id"), nullable=True)
    quartier_id = Column(Integer, ForeignKey("quartiers.id"), nullable=True)

    # Relations pour permettre à Python de naviguer facilement
    ville_ref = relationship("Ville", back_populates="annonces")
    quartier_ref = relationship("Quartier", back_populates="annonces")

class Matiere(Base):
    __tablename__ = "matieres"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), unique=True, nullable=False)