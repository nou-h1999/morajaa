#filtrer les données JSON qui entrent et sortent
from pydantic import BaseModel, EmailStr, model_validator

# 1. Le schéma d'ENTRÉE (Ce que le Front-end nous envoie)
class UserCreate(BaseModel):
    firstName: str
    email: EmailStr
    password: str # Le mot de passe en clair tapé par l'utilisateur

# 2. Le schéma de SORTIE (Ce qu'on renvoie au Front-end)
class UserResponse(BaseModel):
    id: int
    firstName: str
    email: EmailStr
    # ⚠️ On ne renvoie JAMAIS le mot de passe (même haché) au navigateur !

    class Config:
        # Cette option permet à Pydantic de lire directement les données depuis la base SQL
        model_config = {"from_attributes": True}


class AnnonceCreate(BaseModel):
    parcours: str
    description: str
    matiere: str
    niveau: str
    format: str # Doit être "presentiel", "en-ligne" ou "both"
    tarif: float
    
    # Champs facultatifs (Optional)
    ville_id: Optional[int] = None
    quartier_id: Optional[int] = None
    disponibilites: Optional[str] = None

    @model_validator(mode='after')
    def verifier_coherence_lieu(self):
        # Si le cours implique du présentiel, la ville est obligatoire
        if self.format in ["presentiel", "both"] and not self.ville_id:
            raise ValueError("La ville est obligatoire pour les cours en présentiel.")
        return self