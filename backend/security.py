from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import os
from dotenv import load_dotenv

load_dotenv()

# On récupère les secrets depuis le .env qu'on a configuré précédemment
SECRET_KEY = os.getenv("SECRET_KEY", "une_cle_secrete_de_secours_tres_longue_et_aleatoire")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

def creer_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Prend les données de l'utilisateur (comme son ID) et génère un token JWT signé.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15) # Expire vite par défaut si non spécifié
        
    # On ajoute la date d'expiration aux données du token
    to_encode.update({"exp": expire})
    
    # On génère le token chiffré avec notre clé secrète
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt