#filtrer les données JSON qui entrent et sortent
from pydantic import BaseModel, EmailStr

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
        orm_mode = True