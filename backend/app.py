from fastapi import FastAPI

app = FastAPI(title="Morajaa API")

@app.get("/")
def lire_racine():
    return {"message": "Bienvenue sur l'API de Morajaa ! Le serveur fonctionne."}

@app.get("/statut")
def statut_serveur():
    return {"statut": "en ligne", "version": "1.0"}