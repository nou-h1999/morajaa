#pour se connecter à XAMPP ma base de donnée
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. L'URL de connexion
# mysql+pymysql : On utilise le pilote pymysql pour parler à MySQL/MariaDB
# root:@localhost:3306 : L'utilisateur "root" (sans mot de passe par défaut sur XAMPP) sur le port 3306
# /morajaa_db : Le nom de la base de données qu'on vient de créer
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost:3306/morajaa_db"

# 2. Le Moteur (Engine)
# C'est lui qui gère la communication physique avec la base de données.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 3. La Session
# Chaque fois qu'un utilisateur fait une requête (ex: s'inscrire), on ouvre une "Session" temporaire avec la base, puis on la ferme.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. La Base de déclaration
# C'est le moule à partir duquel nous allons créer toutes nos futures tables (Utilisateurs, Demandes, etc.)
Base = declarative_base()