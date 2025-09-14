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

@api_router.patch("/devis/{devis_id}/statut")
async def update_devis_statut(devis_id: str, statut: dict):
    """Met à jour le statut d'un devis"""
    devis = await db.devis.find_one({"id": devis_id})
    if not devis:
        raise HTTPException(status_code=404, detail="Devis non trouvé")
    
    await db.devis.update_one(
        {"id": devis_id}, 
        {"$set": {
            "statut": statut.get("statut"),
            "date_modification": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    updated_devis = await db.devis.find_one({"id": devis_id})
    return Devis(**parse_from_mongo(updated_devis))

@api_router.delete("/devis/{devis_id}")
async def delete_devis(devis_id: str):
    result = await db.devis.delete_one({"id": devis_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Devis non trouvé")
    return {"message": "Devis supprimé"}

# --- OPTIMISATION FISCALE SASU ---

class SituationFamiliale(str, Enum):
    CELIBATAIRE = "celibataire"
    MARIE = "marie"
    PACS = "pacs"

class OptimisationRequest(BaseModel):
    ca_previsionnel: float
    charges_deductibles: float = 0.0
    situation_familiale: SituationFamiliale = SituationFamiliale.CELIBATAIRE
    nombre_parts: float = 1.0
    autres_revenus: float = 0.0
    patrimoine_existant: float = 0.0

class ScenarioFiscal(BaseModel):
    remuneration_brute: float
    dividendes_bruts: float
    is_a_payer: float
    cotisations_sociales: float
    ir_sur_remuneration: float
    ir_sur_dividendes: float
    prelevement_sociaux_dividendes: float
    total_impots_et_charges: float
    net_disponible: float
    taux_global_imposition: float

class OptimisationResponse(BaseModel):
    ca_previsionnel: float
    resultat_avant_is: float
    scenario_optimal: ScenarioFiscal
    scenario_remuneration_max: ScenarioFiscal
    scenario_dividendes_max: ScenarioFiscal
    recommandations: List[str]

def calcul_is_2025(benefice: float) -> float:
    """Calcul de l'impôt sur les sociétés 2025"""
    if benefice <= 0:
        return 0.0
    
    is_total = 0.0
    
    # Tranche à 15% jusqu'à 42 500€
    if benefice <= 42500:
        is_total = benefice * 0.15
    else:
        # 15% sur les premiers 42 500€
        is_total = 42500 * 0.15
        # 25% sur le surplus
        is_total += (benefice - 42500) * 0.25
    
    return is_total

def calcul_ir_2025(revenu_imposable: float, nombre_parts: float = 1.0) -> float:
    """Calcul de l'impôt sur le revenu 2025 avec barème progressif"""
    if revenu_imposable <= 0:
        return 0.0
    
    # Quotient familial
    quotient = revenu_imposable / nombre_parts
    
    # Barème IR 2025 par part
    tranches = [
        (0, 11294, 0.0),      # 0%
        (11294, 28797, 0.11), # 11%
        (28797, 82341, 0.30), # 30%
        (82341, 177106, 0.41), # 41%
        (177106, float('inf'), 0.45) # 45%
    ]
    
    ir_par_part = 0.0
    
    for i, (min_tranche, max_tranche, taux) in enumerate(tranches):
        if quotient > min_tranche:
            base_imposable = min(quotient, max_tranche) - min_tranche
            ir_par_part += base_imposable * taux
    
    return ir_par_part * nombre_parts

def calcul_cotisations_sociales_dirigeant(remuneration_brute: float) -> float:
    """Calcul des cotisations sociales pour dirigeant SASU"""
    if remuneration_brute <= 0:
        return 0.0
    
    # Approximation globale des cotisations dirigeant SASU (≈ 45%)
    return remuneration_brute * 0.45

def calcul_ir_dividendes(dividendes_nets: float) -> float:
    """Calcul IR sur dividendes avec flat tax 12.8%"""
    return dividendes_nets * 0.128

def calcul_prelevements_sociaux_dividendes(dividendes_nets: float) -> float:
    """Calcul prélèvements sociaux sur dividendes 17.2%"""
    return dividendes_nets * 0.172

def calculer_scenario(ca: float, charges: float, remuneration_brute: float, 
                     situation_familiale: SituationFamiliale, nombre_parts: float,
                     autres_revenus: float) -> ScenarioFiscal:
    """Calcule un scénario fiscal complet"""
    
    # Calcul du résultat avant IS
    cotisations_sociales = calcul_cotisations_sociales_dirigeant(remuneration_brute)
    resultat_avant_is = ca - charges - remuneration_brute - cotisations_sociales
    
    # IS
    is_a_payer = calcul_is_2025(resultat_avant_is)
    
    # Dividendes disponibles
    resultat_net = resultat_avant_is - is_a_payer
    dividendes_bruts = max(0, resultat_net)
    
    # IR sur rémunération (avec abattement de 10% plafonné)
    remuneration_nette = remuneration_brute - cotisations_sociales
    abattement = min(remuneration_nette * 0.10, 12829)  # Plafond 2025
    base_ir_remuneration = max(0, remuneration_nette - abattement)
    revenu_total_ir = base_ir_remuneration + autres_revenus
    
    ir_sur_remuneration = calcul_ir_2025(revenu_total_ir, nombre_parts)
    
    # Fiscalité des dividendes
    ir_sur_dividendes = calcul_ir_dividendes(dividendes_bruts)
    prelevement_sociaux_dividendes = calcul_prelevements_sociaux_dividendes(dividendes_bruts)
    
    # Totaux
    total_impots_et_charges = (cotisations_sociales + is_a_payer + ir_sur_remuneration + 
                              ir_sur_dividendes + prelevement_sociaux_dividendes)
    
    dividendes_nets = dividendes_bruts - ir_sur_dividendes - prelevement_sociaux_dividendes
    net_disponible = remuneration_nette + dividendes_nets
    
    taux_global = (total_impots_et_charges / ca * 100) if ca > 0 else 0
    
    return ScenarioFiscal(
        remuneration_brute=remuneration_brute,
        dividendes_bruts=dividendes_bruts,
        is_a_payer=is_a_payer,
        cotisations_sociales=cotisations_sociales,
        ir_sur_remuneration=ir_sur_remuneration,
        ir_sur_dividendes=ir_sur_dividendes,
        prelevement_sociaux_dividendes=prelevement_sociaux_dividendes,
        total_impots_et_charges=total_impots_et_charges,
        net_disponible=net_disponible,
        taux_global_imposition=taux_global
    )

def generer_recommandations(ca: float, scenario_optimal: ScenarioFiscal, 
                           scenario_rem: ScenarioFiscal, scenario_div: ScenarioFiscal) -> List[str]:
    """Génère des recommandations personnalisées"""
    recommandations = []
    
    if scenario_optimal.remuneration_brute > 0:
        recommandations.append(
            f"💡 Rémunération optimale : {scenario_optimal.remuneration_brute:,.0f}€ bruts annuels"
        )
    
    if scenario_optimal.dividendes_bruts > 0:
        recommandations.append(
            f"💰 Dividendes optimaux : {scenario_optimal.dividendes_bruts:,.0f}€ bruts"
        )
    
    if scenario_optimal.taux_global_imposition < 35:
        recommandations.append("✅ Votre taux global d'imposition est très avantageux")
    elif scenario_optimal.taux_global_imposition < 45:
        recommandations.append("⚠️ Taux d'imposition modéré, possibilité d'optimisation")
    else:
        recommandations.append("🔍 Taux d'imposition élevé, optimisation recommandée")
    
    if ca > 100000:
        recommandations.append("📈 Avec ce niveau de CA, pensez aux investissements déductibles")
    
    if scenario_optimal.remuneration_brute < 45000:
        recommandations.append("💼 Profitez du taux réduit IS de 15% jusqu'à 42 500€ de bénéfices")
    
    return recommandations

class SimulationNetRequest(BaseModel):
    salaire_net_souhaite: float
    situation_familiale: SituationFamiliale = SituationFamiliale.CELIBATAIRE
    nombre_parts: float = 1.0
    autres_revenus: float = 0.0

class SimulationNetResponse(BaseModel):
    salaire_net_souhaite: float
    salaire_brut_necessaire: float
    cotisations_sociales: float
    ir_sur_salaire: float
    salaire_net_reel: float
    charges_patronales_estimees: float
    cout_total_entreprise: float
    taux_charges_sociales: float
    taux_prelevement_total: float
    recommandations: List[str]

def calculer_salaire_brut_depuis_net(salaire_net_cible: float, situation_familiale: SituationFamiliale, 
                                   nombre_parts: float, autres_revenus: float) -> dict:
    """Calcule le salaire brut nécessaire pour obtenir un salaire net donné"""
    
    # Estimation initiale (approximation)
    salaire_brut_estime = salaire_net_cible * 1.8  # Point de départ
    
    # Méthode itérative pour converger vers le bon salaire brut
    for iteration in range(10):  # Maximum 10 itérations
        cotisations = calcul_cotisations_sociales_dirigeant(salaire_brut_estime)
        salaire_net_avant_ir = salaire_brut_estime - cotisations
        
        # Calcul IR avec abattement
        abattement = min(salaire_net_avant_ir * 0.10, 12829)
        base_ir = max(0, salaire_net_avant_ir - abattement)
        revenu_total_ir = base_ir + autres_revenus
        ir_sur_salaire = calcul_ir_2025(revenu_total_ir, nombre_parts)
        
        salaire_net_reel = salaire_net_avant_ir - ir_sur_salaire
        
        # Si on est proche du net souhaité, on arrête
        ecart = abs(salaire_net_reel - salaire_net_cible)
        if ecart < 100:  # Précision de 100€
            break
            
        # Ajustement pour la prochaine itération
        ratio = salaire_net_cible / salaire_net_reel if salaire_net_reel > 0 else 1.1
        salaire_brut_estime *= ratio
    
    return {
        'salaire_brut': salaire_brut_estime,
        'cotisations_sociales': cotisations,
        'ir_sur_salaire': ir_sur_salaire,
        'salaire_net_reel': salaire_net_reel
    }

def calculer_charges_patronales_estimees(salaire_brut: float) -> float:
    """Estimation des charges patronales (approximation)"""
    # Charges patronales approximatives : 42% du brut
    return salaire_brut * 0.42

def generer_recommandations_salaire_net(salaire_net_souhaite: float, calculs: dict, 
                                       charges_patronales: float) -> List[str]:
    """Génère des recommandations pour la simulation par salaire net"""
    recommandations = []
    
    cout_total = calculs['salaire_brut'] + charges_patronales
    taux_prelevement = ((calculs['salaire_brut'] - calculs['salaire_net_reel']) / calculs['salaire_brut'] * 100) if calculs['salaire_brut'] > 0 else 0
    
    recommandations.append(
        f"💰 Pour {salaire_net_souhaite:,.0f}€ net, il faut {calculs['salaire_brut']:,.0f}€ brut"
    )
    
    recommandations.append(
        f"🏢 Coût total pour l'entreprise : {cout_total:,.0f}€ (charges patronales incluses)"
    )
    
    if taux_prelevement < 35:
        recommandations.append("✅ Taux de prélèvement avantageux pour ce niveau de salaire")
    elif taux_prelevement < 45:
        recommandations.append("⚠️ Taux de prélèvement modéré, optimisation possible")
    else:
        recommandations.append("🔍 Taux de prélèvement élevé, envisager l'optimisation dividendes")
    
    if salaire_net_souhaite > 50000:
        recommandations.append("💡 Avec ce niveau de salaire, pensez à la répartition rémunération/dividendes")
    
    if calculs['ir_sur_salaire'] > 10000:
        recommandations.append("📋 IR élevé : vérifiez les possibilités de défiscalisation")
    
    return recommandations

@api_router.post("/simulation-salaire-net", response_model=SimulationNetResponse)
async def simuler_par_salaire_net(request: SimulationNetRequest):
    """Simule les charges et impacts fiscaux à partir d'un salaire net souhaité"""
    
    if request.salaire_net_souhaite <= 0:
        raise HTTPException(status_code=400, detail="Le salaire net souhaité doit être positif")
    
    # Calculs pour obtenir le salaire net souhaité
    calculs = calculer_salaire_brut_depuis_net(
        request.salaire_net_souhaite,
        request.situation_familiale,
        request.nombre_parts,
        request.autres_revenus
    )
    
    # Estimation des charges patronales
    charges_patronales = calculer_charges_patronales_estimees(calculs['salaire_brut'])
    cout_total_entreprise = calculs['salaire_brut'] + charges_patronales
    
    # Taux de charges
    taux_charges_sociales = (calculs['cotisations_sociales'] / calculs['salaire_brut'] * 100) if calculs['salaire_brut'] > 0 else 0
    taux_prelevement_total = ((calculs['salaire_brut'] - calculs['salaire_net_reel']) / calculs['salaire_brut'] * 100) if calculs['salaire_brut'] > 0 else 0
    
    # Recommandations
    recommandations = generer_recommandations_salaire_net(
        request.salaire_net_souhaite, calculs, charges_patronales
    )
    
    return SimulationNetResponse(
        salaire_net_souhaite=request.salaire_net_souhaite,
        salaire_brut_necessaire=calculs['salaire_brut'],
        cotisations_sociales=calculs['cotisations_sociales'],
        ir_sur_salaire=calculs['ir_sur_salaire'],
        salaire_net_reel=calculs['salaire_net_reel'],
        charges_patronales_estimees=charges_patronales,
        cout_total_entreprise=cout_total_entreprise,
        taux_charges_sociales=taux_charges_sociales,
        taux_prelevement_total=taux_prelevement_total,
        recommandations=recommandations
    )
async def optimiser_fiscalite_sasu(request: OptimisationRequest):
    """Calcule l'optimisation fiscale pour une SASU"""
    
    ca = request.ca_previsionnel
    charges = request.charges_deductibles
    resultat_avant_is = ca - charges
    
    if resultat_avant_is <= 0:
        raise HTTPException(status_code=400, detail="Le résultat avant IS doit être positif")
    
    scenarios = []
    
    # Teste différents niveaux de rémunération (de 0 à 80% du résultat)
    for i in range(0, 81, 5):  # Par pas de 5%
        rem_test = (resultat_avant_is * i / 100)
        scenario = calculer_scenario(
            ca, charges, rem_test, 
            request.situation_familiale, request.nombre_parts, request.autres_revenus
        )
        scenarios.append(scenario)
    
    # Trouve le scénario optimal (net disponible maximum)
    scenario_optimal = max(scenarios, key=lambda s: s.net_disponible)
    
    # Scénarios de comparaison
    scenario_remuneration_max = calculer_scenario(
        ca, charges, resultat_avant_is * 0.8,  # 80% en rémunération
        request.situation_familiale, request.nombre_parts, request.autres_revenus
    )
    
    scenario_dividendes_max = calculer_scenario(
        ca, charges, 0,  # 0% en rémunération
        request.situation_familiale, request.nombre_parts, request.autres_revenus
    )
    
    recommandations = generer_recommandations(ca, scenario_optimal, scenario_remuneration_max, scenario_dividendes_max)
    
    return OptimisationResponse(
        ca_previsionnel=ca,
        resultat_avant_is=resultat_avant_is,
        scenario_optimal=scenario_optimal,
        scenario_remuneration_max=scenario_remuneration_max,
        scenario_dividendes_max=scenario_dividendes_max,
        recommandations=recommandations
    )

@api_router.get("/baremes-fiscaux-2025")
async def get_baremes_fiscaux():
    """Retourne les barèmes fiscaux 2025"""
    return {
        "is": {
            "description": "Impôt sur les sociétés 2025",
            "tranches": [
                {"min": 0, "max": 42500, "taux": 15, "description": "Taux réduit PME"},
                {"min": 42500, "max": None, "taux": 25, "description": "Taux normal"}
            ]
        },
        "ir": {
            "description": "Impôt sur le revenu 2025 (par part)",
            "tranches": [
                {"min": 0, "max": 11294, "taux": 0, "description": "Tranche 0%"},
                {"min": 11294, "max": 28797, "taux": 11, "description": "Tranche 11%"},
                {"min": 28797, "max": 82341, "taux": 30, "description": "Tranche 30%"},
                {"min": 82341, "max": 177106, "taux": 41, "description": "Tranche 41%"},
                {"min": 177106, "max": None, "taux": 45, "description": "Tranche 45%"}
            ]
        },
        "dividendes": {
            "description": "Fiscalité des dividendes",
            "prelevement_sociaux": 17.2,
            "ir_flat_tax": 12.8,
            "total_flat_tax": 30.0
        },
        "cotisations_dirigeant": {
            "description": "Cotisations sociales dirigeant SASU",
            "taux_approximatif": 45.0
        }
    }

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