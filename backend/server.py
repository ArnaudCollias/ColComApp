from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class StatutProspect(str, Enum):
    NOUVEAU = "nouveau"
    QUALIFIE = "qualifie"
    INTERESSE = "interesse"
    NON_INTERESSE = "non_interesse"
    CONVERTI = "converti"

class StatutAffaire(str, Enum):
    PROSPECT = "prospect"
    NEGOCIATION = "negociation"
    PROPOSITION = "proposition"
    GAGNE = "gagne"
    PERDU = "perdu"

class TypeAction(str, Enum):
    APPEL = "appel"
    EMAIL = "email"
    RENDEZ_VOUS = "rendez_vous"
    RELANCE = "relance"
    AUTRE = "autre"

class StatutAction(str, Enum):
    A_FAIRE = "a_faire"
    EN_COURS = "en_cours"
    TERMINE = "termine"
    ANNULE = "annule"

class StatutDevis(str, Enum):
    BROUILLON = "brouillon"
    ENVOYE = "envoye"
    ACCEPTE = "accepte"
    REFUSE = "refuse"
    EXPIRE = "expire"

# Models
class Prospect(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom: str
    prenom: str
    email: str
    telephone: str
    entreprise: str
    poste: Optional[str] = None
    statut: StatutProspect = StatutProspect.NOUVEAU
    notes: Optional[str] = None
    date_creation: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    date_modification: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProspectCreate(BaseModel):
    nom: str
    prenom: str
    email: str
    telephone: str
    entreprise: str
    poste: Optional[str] = None
    notes: Optional[str] = None

class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom: str
    prenom: str
    email: str
    telephone: str
    entreprise: str
    poste: Optional[str] = None
    adresse: Optional[str] = None
    siret: Optional[str] = None
    notes: Optional[str] = None
    chiffre_affaire_total: float = 0.0
    date_creation: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    date_modification: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    nom: str
    prenom: str
    email: str
    telephone: str
    entreprise: str
    poste: Optional[str] = None
    adresse: Optional[str] = None
    siret: Optional[str] = None
    notes: Optional[str] = None

class Affaire(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    titre: str
    description: Optional[str] = None
    montant_previsionnel: float
    probabilite: int = 50  # Pourcentage
    statut: StatutAffaire = StatutAffaire.PROSPECT
    date_cloture_prevue: Optional[datetime] = None
    date_creation: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    date_modification: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AffaireCreate(BaseModel):
    client_id: str
    titre: str
    description: Optional[str] = None
    montant_previsionnel: float
    probabilite: int = 50
    date_cloture_prevue: Optional[datetime] = None

class Action(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    affaire_id: str
    type_action: TypeAction
    titre: str
    description: Optional[str] = None
    date_prevue: datetime
    statut: StatutAction = StatutAction.A_FAIRE
    date_creation: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    date_modification: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ActionCreate(BaseModel):
    affaire_id: str
    type_action: TypeAction
    titre: str
    description: Optional[str] = None
    date_prevue: datetime

class LigneDevis(BaseModel):
    description: str
    quantite: float
    prix_unitaire: float
    montant: float

class Devis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    affaire_id: Optional[str] = None
    numero: str
    titre: str
    lignes: List[LigneDevis] = []
    montant_ht: float = 0.0
    taux_tva: float = 20.0
    montant_tva: float = 0.0
    montant_ttc: float = 0.0
    statut: StatutDevis = StatutDevis.BROUILLON
    date_creation: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    date_modification: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    date_validite: Optional[datetime] = None

class DevisCreate(BaseModel):
    client_id: str
    affaire_id: Optional[str] = None
    titre: str
    lignes: List[LigneDevis] = []
    taux_tva: float = 20.0
    date_validite: Optional[datetime] = None

# Helper functions
def prepare_for_mongo(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, str) and key in ['date_creation', 'date_modification', 'date_prevue', 'date_cloture_prevue', 'date_validite']:
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
    return item

# Routes CRM

# --- PROSPECTS ---
@api_router.get("/prospects", response_model=List[Prospect])
async def get_prospects():
    prospects = await db.prospects.find().to_list(1000)
    return [Prospect(**parse_from_mongo(prospect)) for prospect in prospects]

@api_router.post("/prospects", response_model=Prospect)
async def create_prospect(prospect_data: ProspectCreate):
    prospect = Prospect(**prospect_data.dict())
    prospect_dict = prepare_for_mongo(prospect.dict())
    await db.prospects.insert_one(prospect_dict)
    return prospect

@api_router.get("/prospects/{prospect_id}", response_model=Prospect)
async def get_prospect(prospect_id: str):
    prospect = await db.prospects.find_one({"id": prospect_id})
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect non trouvé")
    return Prospect(**parse_from_mongo(prospect))

@api_router.put("/prospects/{prospect_id}", response_model=Prospect)
async def update_prospect(prospect_id: str, prospect_data: ProspectCreate):
    prospect = await db.prospects.find_one({"id": prospect_id})
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect non trouvé")
    
    updated_data = prospect_data.dict()
    updated_data["date_modification"] = datetime.now(timezone.utc)
    updated_data = prepare_for_mongo(updated_data)
    
    await db.prospects.update_one({"id": prospect_id}, {"$set": updated_data})
    
    updated_prospect = await db.prospects.find_one({"id": prospect_id})
    return Prospect(**parse_from_mongo(updated_prospect))

@api_router.delete("/prospects/{prospect_id}")
async def delete_prospect(prospect_id: str):
    result = await db.prospects.delete_one({"id": prospect_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prospect non trouvé")
    return {"message": "Prospect supprimé"}

@api_router.post("/prospects/{prospect_id}/convert")
async def convert_prospect_to_client(prospect_id: str):
    prospect = await db.prospects.find_one({"id": prospect_id})
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect non trouvé")
    
    # Créer le client
    client_data = {
        "nom": prospect["nom"],
        "prenom": prospect["prenom"],
        "email": prospect["email"],
        "telephone": prospect["telephone"],
        "entreprise": prospect["entreprise"],
        "poste": prospect.get("poste"),
        "notes": prospect.get("notes")
    }
    client = Client(**client_data)
    client_dict = prepare_for_mongo(client.dict())
    await db.clients.insert_one(client_dict)
    
    # Mettre à jour le statut du prospect
    await db.prospects.update_one(
        {"id": prospect_id}, 
        {"$set": {"statut": StatutProspect.CONVERTI, "date_modification": datetime.now(timezone.utc).isoformat()}}
    )
    
    return client

# --- CLIENTS ---
@api_router.get("/clients", response_model=List[Client])
async def get_clients():
    clients = await db.clients.find().to_list(1000)
    return [Client(**parse_from_mongo(client)) for client in clients]

@api_router.post("/clients", response_model=Client)
async def create_client(client_data: ClientCreate):
    client = Client(**client_data.dict())
    client_dict = prepare_for_mongo(client.dict())
    await db.clients.insert_one(client_dict)
    return client

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str):
    client = await db.clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    return Client(**parse_from_mongo(client))

@api_router.put("/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_data: ClientCreate):
    client = await db.clients.find_one({"id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    
    updated_data = client_data.dict()
    updated_data["date_modification"] = datetime.now(timezone.utc)
    updated_data = prepare_for_mongo(updated_data)
    
    await db.clients.update_one({"id": client_id}, {"$set": updated_data})
    
    updated_client = await db.clients.find_one({"id": client_id})
    return Client(**parse_from_mongo(updated_client))

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str):
    result = await db.clients.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    return {"message": "Client supprimé"}

# --- AFFAIRES ---
@api_router.get("/affaires", response_model=List[Affaire])
async def get_affaires():
    affaires = await db.affaires.find().to_list(1000)
    return [Affaire(**parse_from_mongo(affaire)) for affaire in affaires]

@api_router.post("/affaires", response_model=Affaire)
async def create_affaire(affaire_data: AffaireCreate):
    # Vérifier que le client existe
    client = await db.clients.find_one({"id": affaire_data.client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    
    affaire = Affaire(**affaire_data.dict())
    affaire_dict = prepare_for_mongo(affaire.dict())
    await db.affaires.insert_one(affaire_dict)
    return affaire

@api_router.get("/affaires/{affaire_id}", response_model=Affaire)
async def get_affaire(affaire_id: str):
    affaire = await db.affaires.find_one({"id": affaire_id})
    if not affaire:
        raise HTTPException(status_code=404, detail="Affaire non trouvée")
    return Affaire(**parse_from_mongo(affaire))

@api_router.put("/affaires/{affaire_id}", response_model=Affaire)
async def update_affaire(affaire_id: str, affaire_data: AffaireCreate):
    affaire = await db.affaires.find_one({"id": affaire_id})
    if not affaire:
        raise HTTPException(status_code=404, detail="Affaire non trouvée")
    
    updated_data = affaire_data.dict()
    updated_data["date_modification"] = datetime.now(timezone.utc)
    updated_data = prepare_for_mongo(updated_data)
    
    await db.affaires.update_one({"id": affaire_id}, {"$set": updated_data})
    
    updated_affaire = await db.affaires.find_one({"id": affaire_id})
    return Affaire(**parse_from_mongo(updated_affaire))

@api_router.delete("/affaires/{affaire_id}")
async def delete_affaire(affaire_id: str):
    result = await db.affaires.delete_one({"id": affaire_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Affaire non trouvée")
    return {"message": "Affaire supprimée"}

# --- ACTIONS ---
@api_router.get("/actions", response_model=List[Action])
async def get_actions():
    actions = await db.actions.find().to_list(1000)
    return [Action(**parse_from_mongo(action)) for action in actions]

@api_router.post("/actions", response_model=Action)
async def create_action(action_data: ActionCreate):
    # Vérifier que l'affaire existe
    affaire = await db.affaires.find_one({"id": action_data.affaire_id})
    if not affaire:
        raise HTTPException(status_code=404, detail="Affaire non trouvée")
    
    action = Action(**action_data.dict())
    action_dict = prepare_for_mongo(action.dict())
    await db.actions.insert_one(action_dict)
    return action

@api_router.get("/actions/{action_id}", response_model=Action)
async def get_action(action_id: str):
    action = await db.actions.find_one({"id": action_id})
    if not action:
        raise HTTPException(status_code=404, detail="Action non trouvée")
    return Action(**parse_from_mongo(action))

@api_router.put("/actions/{action_id}", response_model=Action)
async def update_action(action_id: str, action_data: ActionCreate):
    action = await db.actions.find_one({"id": action_id})
    if not action:
        raise HTTPException(status_code=404, detail="Action non trouvée")
    
    updated_data = action_data.dict()
    updated_data["date_modification"] = datetime.now(timezone.utc)
    updated_data = prepare_for_mongo(updated_data)
    
    await db.actions.update_one({"id": action_id}, {"$set": updated_data})
    
    updated_action = await db.actions.find_one({"id": action_id})
    return Action(**parse_from_mongo(updated_action))

@api_router.delete("/actions/{action_id}")
async def delete_action(action_id: str):
    result = await db.actions.delete_one({"id": action_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Action non trouvée")
    return {"message": "Action supprimée"}

# --- DEVIS ---
@api_router.get("/devis", response_model=List[Devis])
async def get_devis():
    devis_list = await db.devis.find().to_list(1000)
    return [Devis(**parse_from_mongo(devis)) for devis in devis_list]

@api_router.post("/devis", response_model=Devis)
async def create_devis(devis_data: DevisCreate):
    # Vérifier que le client existe
    client = await db.clients.find_one({"id": devis_data.client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client non trouvé")
    
    # Générer un numéro de devis unique
    count = await db.devis.count_documents({})
    numero = f"DEV-{(count + 1):04d}"
    
    # Calculer les montants
    montant_ht = sum(ligne.montant for ligne in devis_data.lignes)
    montant_tva = montant_ht * (devis_data.taux_tva / 100)
    montant_ttc = montant_ht + montant_tva
    
    devis = Devis(
        numero=numero,
        montant_ht=montant_ht,
        montant_tva=montant_tva,
        montant_ttc=montant_ttc,
        **devis_data.dict()
    )
    devis_dict = prepare_for_mongo(devis.dict())
    await db.devis.insert_one(devis_dict)
    return devis

@api_router.get("/devis/{devis_id}", response_model=Devis)
async def get_devis_by_id(devis_id: str):
    devis = await db.devis.find_one({"id": devis_id})
    if not devis:
        raise HTTPException(status_code=404, detail="Devis non trouvé")
    return Devis(**parse_from_mongo(devis))

@api_router.put("/devis/{devis_id}", response_model=Devis)
async def update_devis(devis_id: str, devis_data: DevisCreate):
    devis = await db.devis.find_one({"id": devis_id})
    if not devis:
        raise HTTPException(status_code=404, detail="Devis non trouvé")
    
    # Recalculer les montants
    montant_ht = sum(ligne.montant for ligne in devis_data.lignes)
    montant_tva = montant_ht * (devis_data.taux_tva / 100)
    montant_ttc = montant_ht + montant_tva
    
    updated_data = devis_data.dict()
    updated_data.update({
        "montant_ht": montant_ht,
        "montant_tva": montant_tva,
        "montant_ttc": montant_ttc,
        "date_modification": datetime.now(timezone.utc)
    })
    updated_data = prepare_for_mongo(updated_data)
    
    await db.devis.update_one({"id": devis_id}, {"$set": updated_data})
    
    updated_devis = await db.devis.find_one({"id": devis_id})
    return Devis(**parse_from_mongo(updated_devis))

@api_router.delete("/devis/{devis_id}")
async def delete_devis(devis_id: str):
    result = await db.devis.delete_one({"id": devis_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Devis non trouvé")
    return {"message": "Devis supprimé"}

# --- DASHBOARD ---
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    prospects_count = await db.prospects.count_documents({})
    clients_count = await db.clients.count_documents({})
    affaires_ouvertes = await db.affaires.count_documents({"statut": {"$ne": "gagne"}})
    affaires_gagnees = await db.affaires.count_documents({"statut": "gagne"})
    
    # Calcul du chiffre d'affaires prévisionnel
    pipeline = [
        {"$match": {"statut": {"$ne": "perdu"}}},
        {"$group": {"_id": None, "total": {"$sum": "$montant_previsionnel"}}}
    ]
    ca_previsionnel = await db.affaires.aggregate(pipeline).to_list(1)
    ca_previsionnel = ca_previsionnel[0]["total"] if ca_previsionnel else 0
    
    return {
        "prospects_count": prospects_count,
        "clients_count": clients_count,
        "affaires_ouvertes": affaires_ouvertes,
        "affaires_gagnees": affaires_gagnees,
        "ca_previsionnel": ca_previsionnel
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()