import requests
import sys
import json
from datetime import datetime, timezone
import uuid

class CRMAPITester:
    def __init__(self, base_url="https://smartbiz-tracker.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {
            'prospects': [],
            'clients': [],
            'affaires': [],
            'actions': [],
            'devis': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        print("\n" + "="*50)
        print("TESTING DASHBOARD STATS")
        print("="*50)
        
        success, response = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success:
            required_fields = ['prospects_count', 'clients_count', 'affaires_ouvertes', 'affaires_gagnees', 'ca_previsionnel']
            for field in required_fields:
                if field in response:
                    print(f"   ✅ {field}: {response[field]}")
                else:
                    print(f"   ❌ Missing field: {field}")
        
        return success

    def test_prospects_crud(self):
        """Test prospects CRUD operations"""
        print("\n" + "="*50)
        print("TESTING PROSPECTS CRUD")
        print("="*50)
        
        # Test GET prospects (empty list initially)
        success, prospects = self.run_test(
            "Get Prospects (Initial)",
            "GET",
            "prospects",
            200
        )
        if not success:
            return False
        
        print(f"   Initial prospects count: {len(prospects)}")
        
        # Test CREATE prospect
        prospect_data = {
            "nom": "Dupont",
            "prenom": "Jean",
            "email": "jean.dupont@example.com",
            "telephone": "0123456789",
            "entreprise": "Test Corp",
            "poste": "Directeur",
            "notes": "Prospect test"
        }
        
        success, created_prospect = self.run_test(
            "Create Prospect",
            "POST",
            "prospects",
            200,
            data=prospect_data
        )
        if not success:
            return False
        
        prospect_id = created_prospect.get('id')
        if prospect_id:
            self.created_ids['prospects'].append(prospect_id)
            print(f"   Created prospect ID: {prospect_id}")
        
        # Test GET specific prospect
        success, prospect = self.run_test(
            "Get Specific Prospect",
            "GET",
            f"prospects/{prospect_id}",
            200
        )
        if not success:
            return False
        
        # Test UPDATE prospect
        updated_data = prospect_data.copy()
        updated_data["notes"] = "Updated notes"
        
        success, updated_prospect = self.run_test(
            "Update Prospect",
            "PUT",
            f"prospects/{prospect_id}",
            200,
            data=updated_data
        )
        if not success:
            return False
        
        # Test GET prospects (should have 1 now)
        success, prospects = self.run_test(
            "Get Prospects (After Create)",
            "GET",
            "prospects",
            200
        )
        if success:
            print(f"   Prospects count after create: {len(prospects)}")
        
        return success

    def test_prospect_conversion(self):
        """Test prospect to client conversion"""
        print("\n" + "="*50)
        print("TESTING PROSPECT CONVERSION")
        print("="*50)
        
        if not self.created_ids['prospects']:
            print("❌ No prospects available for conversion test")
            return False
        
        prospect_id = self.created_ids['prospects'][0]
        
        # Test conversion
        success, converted_client = self.run_test(
            "Convert Prospect to Client",
            "POST",
            f"prospects/{prospect_id}/convert",
            200
        )
        
        if success:
            client_id = converted_client.get('id')
            if client_id:
                self.created_ids['clients'].append(client_id)
                print(f"   Converted to client ID: {client_id}")
        
        return success

    def test_clients_crud(self):
        """Test clients CRUD operations"""
        print("\n" + "="*50)
        print("TESTING CLIENTS CRUD")
        print("="*50)
        
        # Test GET clients
        success, clients = self.run_test(
            "Get Clients",
            "GET",
            "clients",
            200
        )
        if not success:
            return False
        
        print(f"   Clients count: {len(clients)}")
        
        # Test CREATE client directly
        client_data = {
            "nom": "Martin",
            "prenom": "Marie",
            "email": "marie.martin@example.com",
            "telephone": "0987654321",
            "entreprise": "Direct Client Corp",
            "poste": "CEO",
            "adresse": "123 Rue Test",
            "siret": "12345678901234",
            "notes": "Client direct"
        }
        
        success, created_client = self.run_test(
            "Create Client Directly",
            "POST",
            "clients",
            200,
            data=client_data
        )
        
        if success:
            client_id = created_client.get('id')
            if client_id:
                self.created_ids['clients'].append(client_id)
                print(f"   Created client ID: {client_id}")
        
        return success

    def test_affaires_crud(self):
        """Test affaires CRUD operations"""
        print("\n" + "="*50)
        print("TESTING AFFAIRES CRUD")
        print("="*50)
        
        if not self.created_ids['clients']:
            print("❌ No clients available for affaires test")
            return False
        
        client_id = self.created_ids['clients'][0]
        
        # Test CREATE affaire
        affaire_data = {
            "client_id": client_id,
            "titre": "Projet Test",
            "description": "Description du projet test",
            "montant_previsionnel": 50000.0,
            "probabilite": 75
        }
        
        success, created_affaire = self.run_test(
            "Create Affaire",
            "POST",
            "affaires",
            200,
            data=affaire_data
        )
        
        if success:
            affaire_id = created_affaire.get('id')
            if affaire_id:
                self.created_ids['affaires'].append(affaire_id)
                print(f"   Created affaire ID: {affaire_id}")
        
        # Test GET affaires
        success, affaires = self.run_test(
            "Get Affaires",
            "GET",
            "affaires",
            200
        )
        if success:
            print(f"   Affaires count: {len(affaires)}")
        
        return success

    def test_actions_crud(self):
        """Test actions CRUD operations"""
        print("\n" + "="*50)
        print("TESTING ACTIONS CRUD")
        print("="*50)
        
        if not self.created_ids['affaires']:
            print("❌ No affaires available for actions test")
            return False
        
        affaire_id = self.created_ids['affaires'][0]
        
        # Test CREATE action
        action_data = {
            "affaire_id": affaire_id,
            "type_action": "appel",
            "titre": "Appel de suivi",
            "description": "Appel pour faire le point",
            "date_prevue": datetime.now(timezone.utc).isoformat()
        }
        
        success, created_action = self.run_test(
            "Create Action",
            "POST",
            "actions",
            200,
            data=action_data
        )
        
        if success:
            action_id = created_action.get('id')
            if action_id:
                self.created_ids['actions'].append(action_id)
                print(f"   Created action ID: {action_id}")
        
        # Test GET actions
        success, actions = self.run_test(
            "Get Actions",
            "GET",
            "actions",
            200
        )
        if success:
            print(f"   Actions count: {len(actions)}")
        
        return success

    def test_devis_crud(self):
        """Test devis CRUD operations"""
        print("\n" + "="*50)
        print("TESTING DEVIS CRUD")
        print("="*50)
        
        if not self.created_ids['clients']:
            print("❌ No clients available for devis test")
            return False
        
        client_id = self.created_ids['clients'][0]
        
        # Test CREATE devis
        devis_data = {
            "client_id": client_id,
            "titre": "Devis Test",
            "lignes": [
                {
                    "description": "Service 1",
                    "quantite": 2.0,
                    "prix_unitaire": 1000.0,
                    "montant": 2000.0
                },
                {
                    "description": "Service 2",
                    "quantite": 1.0,
                    "prix_unitaire": 500.0,
                    "montant": 500.0
                }
            ],
            "taux_tva": 20.0
        }
        
        success, created_devis = self.run_test(
            "Create Devis",
            "POST",
            "devis",
            200,
            data=devis_data
        )
        
        if success:
            devis_id = created_devis.get('id')
            if devis_id:
                self.created_ids['devis'].append(devis_id)
                print(f"   Created devis ID: {devis_id}")
                print(f"   Devis number: {created_devis.get('numero')}")
                print(f"   Montant HT: {created_devis.get('montant_ht')} €")
                print(f"   Montant TTC: {created_devis.get('montant_ttc')} €")
        
        # Test GET devis
        success, devis_list = self.run_test(
            "Get Devis",
            "GET",
            "devis",
            200
        )
        if success:
            print(f"   Devis count: {len(devis_list)}")
        
        return success

    def test_devis_status_change(self):
        """Test devis status change functionality (NEW FEATURE)"""
        print("\n" + "="*50)
        print("TESTING DEVIS STATUS CHANGE (NEW FEATURE)")
        print("="*50)
        
        if not self.created_ids['devis']:
            print("❌ No devis available for status change test")
            return False
        
        devis_id = self.created_ids['devis'][0]
        
        # Test all status changes
        statuses = ["envoye", "accepte", "refuse", "expire", "brouillon"]
        
        for status in statuses:
            status_data = {"statut": status}
            
            success, updated_devis = self.run_test(
                f"Change Devis Status to {status}",
                "PATCH",
                f"devis/{devis_id}/statut",
                200,
                data=status_data
            )
            
            if success:
                actual_status = updated_devis.get('statut')
                if actual_status == status:
                    print(f"   ✅ Status successfully changed to: {status}")
                else:
                    print(f"   ❌ Status change failed: expected {status}, got {actual_status}")
                    return False
            else:
                return False
        
        return True

    def test_error_handling(self):
        """Test error handling"""
        print("\n" + "="*50)
        print("TESTING ERROR HANDLING")
        print("="*50)
        
        # Test 404 errors
        fake_id = str(uuid.uuid4())
        
        success, _ = self.run_test(
            "Get Non-existent Prospect",
            "GET",
            f"prospects/{fake_id}",
            404
        )
        
        success2, _ = self.run_test(
            "Get Non-existent Client",
            "GET",
            f"clients/{fake_id}",
            404
        )
        
        # Test invalid data
        invalid_prospect = {
            "nom": "",  # Empty required field
            "email": "invalid-email"  # Invalid email
        }
        
        success3, _ = self.run_test(
            "Create Invalid Prospect",
            "POST",
            "prospects",
            422  # Validation error
        )
        
        return success and success2

    def test_optimisation_fiscale(self):
        """Test tax optimization endpoints"""
        print("\n" + "="*50)
        print("TESTING OPTIMISATION FISCALE SASU")
        print("="*50)
        
        # Test GET baremes fiscaux 2025
        success, baremes = self.run_test(
            "Get Baremes Fiscaux 2025",
            "GET",
            "baremes-fiscaux-2025",
            200
        )
        
        if success:
            print("   ✅ Baremes retrieved successfully")
            # Verify structure
            required_sections = ['is', 'ir', 'dividendes', 'cotisations_dirigeant']
            for section in required_sections:
                if section in baremes:
                    print(f"   ✅ {section} section present")
                else:
                    print(f"   ❌ Missing section: {section}")
        
        # Test scenario 1: CA 200k€, charges 50k€, autres revenus 10k€
        scenario1_data = {
            "ca_previsionnel": 200000,
            "charges_deductibles": 50000,
            "situation_familiale": "celibataire",
            "nombre_parts": 1.0,
            "autres_revenus": 10000,
            "patrimoine_existant": 0
        }
        
        success1, result1 = self.run_test(
            "Optimisation Scenario 1 (CA: 200k€, charges: 50k€)",
            "POST",
            "optimisation-fiscale",
            200,
            data=scenario1_data
        )
        
        if success1:
            print(f"   ✅ Scenario 1 calculated successfully")
            print(f"   📊 CA prévisionnel: {result1.get('ca_previsionnel', 0):,.0f}€")
            print(f"   📊 Résultat avant IS: {result1.get('resultat_avant_is', 0):,.0f}€")
            
            optimal = result1.get('scenario_optimal', {})
            print(f"   🎯 Optimal - Rémunération: {optimal.get('remuneration_brute', 0):,.0f}€")
            print(f"   🎯 Optimal - Dividendes: {optimal.get('dividendes_bruts', 0):,.0f}€")
            print(f"   🎯 Optimal - Net disponible: {optimal.get('net_disponible', 0):,.0f}€")
            print(f"   🎯 Optimal - Taux global: {optimal.get('taux_global_imposition', 0):.1f}%")
            
            # Verify expected values for this scenario
            expected_resultat = 150000  # 200k - 50k
            actual_resultat = result1.get('resultat_avant_is', 0)
            if abs(actual_resultat - expected_resultat) < 1:
                print("   ✅ Résultat avant IS calculation correct")
            else:
                print(f"   ❌ Résultat avant IS incorrect: expected {expected_resultat}, got {actual_resultat}")
        
        # Test scenario 2: CA 100k€, charges 20k€, célibataire
        scenario2_data = {
            "ca_previsionnel": 100000,
            "charges_deductibles": 20000,
            "situation_familiale": "celibataire",
            "nombre_parts": 1.0,
            "autres_revenus": 0,
            "patrimoine_existant": 0
        }
        
        success2, result2 = self.run_test(
            "Optimisation Scenario 2 (CA: 100k€, charges: 20k€)",
            "POST",
            "optimisation-fiscale",
            200,
            data=scenario2_data
        )
        
        if success2:
            print(f"   ✅ Scenario 2 calculated successfully")
            optimal2 = result2.get('scenario_optimal', {})
            print(f"   🎯 Net disponible: {optimal2.get('net_disponible', 0):,.0f}€")
            print(f"   🎯 Taux global: {optimal2.get('taux_global_imposition', 0):.1f}%")
        
        # Test scenario 3: CA 300k€, charges 80k€, marié 2 parts
        scenario3_data = {
            "ca_previsionnel": 300000,
            "charges_deductibles": 80000,
            "situation_familiale": "marie",
            "nombre_parts": 2.0,
            "autres_revenus": 0,
            "patrimoine_existant": 0
        }
        
        success3, result3 = self.run_test(
            "Optimisation Scenario 3 (CA: 300k€, charges: 80k€, marié)",
            "POST",
            "optimisation-fiscale",
            200,
            data=scenario3_data
        )
        
        if success3:
            print(f"   ✅ Scenario 3 calculated successfully")
            optimal3 = result3.get('scenario_optimal', {})
            print(f"   🎯 Net disponible: {optimal3.get('net_disponible', 0):,.0f}€")
            print(f"   🎯 Taux global: {optimal3.get('taux_global_imposition', 0):.1f}%")
        
        # Test error handling - negative CA
        error_data = {
            "ca_previsionnel": -50000,
            "charges_deductibles": 30000,
            "situation_familiale": "celibataire",
            "nombre_parts": 1.0,
            "autres_revenus": 0,
            "patrimoine_existant": 0
        }
        
        success_error, _ = self.run_test(
            "Optimisation Error - Negative Result",
            "POST",
            "optimisation-fiscale",
            400,  # Should return error
            data=error_data
        )
        
        if success_error:
            print("   ✅ Error handling for negative result works correctly")
        
        # Test tax calculation accuracy
        if success1 and result1:
            print("\n   🧮 VERIFYING TAX CALCULATIONS:")
            optimal = result1.get('scenario_optimal', {})
            
            # Verify IS calculation (15% up to 42,500€, then 25%)
            is_paye = optimal.get('is_a_payer', 0)
            print(f"   📊 IS payé: {is_paye:,.0f}€")
            
            # Verify total makes sense
            total_charges = optimal.get('total_impots_et_charges', 0)
            net_dispo = optimal.get('net_disponible', 0)
            ca = result1.get('ca_previsionnel', 0)
            charges = scenario1_data['charges_deductibles']
            
            total_check = net_dispo + total_charges + charges
            if abs(total_check - ca) < 10:  # Allow small rounding differences
                print("   ✅ Total calculation consistency check passed")
            else:
                print(f"   ❌ Total calculation inconsistent: {total_check} vs {ca}")
        
        return success and success1 and success2 and success3 and success_error

    def test_optimisation_fiscale_avec_contrainte(self):
        """Test new tax optimization with net salary constraint feature"""
        print("\n" + "="*50)
        print("TESTING OPTIMISATION FISCALE AVEC CONTRAINTE RÉMUNÉRATION (NEW FEATURE)")
        print("="*50)
        
        # Test scenario 1: CA 120k€, contrainte 35k€ net (réalisable)
        scenario1_data = {
            "ca_previsionnel": 120000,
            "charges_deductibles": 0,
            "situation_familiale": "celibataire",
            "nombre_parts": 1.0,
            "autres_revenus": 0,
            "patrimoine_existant": 0,
            "remuneration_nette_souhaitee": 35000
        }
        
        success1, result1 = self.run_test(
            "Optimisation avec contrainte 35k€ net (réalisable)",
            "POST",
            "optimisation-fiscale",
            200,
            data=scenario1_data
        )
        
        if success1:
            print(f"   ✅ Contrainte 35k€ net acceptée et calculée")
            optimal = result1.get('scenario_optimal', {})
            print(f"   🎯 Rémunération brute: {optimal.get('remuneration_brute', 0):,.0f}€")
            print(f"   🎯 Dividendes bruts: {optimal.get('dividendes_bruts', 0):,.0f}€")
            print(f"   🎯 Net disponible total: {optimal.get('net_disponible', 0):,.0f}€")
            print(f"   🎯 Taux global: {optimal.get('taux_global_imposition', 0):.1f}%")
            
            # Vérifier que la contrainte est respectée (approximativement)
            net_dispo = optimal.get('net_disponible', 0)
            dividendes_nets = optimal.get('dividendes_bruts', 0) * 0.7  # Approximation après fiscalité
            remuneration_nette_calculee = net_dispo - dividendes_nets
            
            if abs(remuneration_nette_calculee - 35000) < 2000:  # Tolérance de 2k€
                print("   ✅ Contrainte de rémunération nette respectée")
            else:
                print(f"   ⚠️ Contrainte approximative: calculé {remuneration_nette_calculee:,.0f}€ vs souhaité 35,000€")
        
        # Test scenario 2: CA 120k€, contrainte 40k€ net (impossible)
        scenario2_data = {
            "ca_previsionnel": 120000,
            "charges_deductibles": 0,
            "situation_familiale": "celibataire",
            "nombre_parts": 1.0,
            "autres_revenus": 0,
            "patrimoine_existant": 0,
            "remuneration_nette_souhaitee": 40000
        }
        
        success2, result2 = self.run_test(
            "Optimisation avec contrainte 40k€ net (impossible)",
            "POST",
            "optimisation-fiscale",
            400,  # Should return error
            data=scenario2_data
        )
        
        if success2:
            print("   ✅ Contrainte impossible correctement rejetée")
            # Vérifier le message d'erreur
            if 'detail' in result2 and 'impossible' in result2['detail'].lower():
                print("   ✅ Message d'erreur approprié fourni")
        
        # Test scenario 3: CA 200k€, contrainte 30k€ net (réalisable avec dividendes)
        scenario3_data = {
            "ca_previsionnel": 200000,
            "charges_deductibles": 20000,
            "situation_familiale": "celibataire",
            "nombre_parts": 1.0,
            "autres_revenus": 0,
            "patrimoine_existant": 0,
            "remuneration_nette_souhaitee": 30000
        }
        
        success3, result3 = self.run_test(
            "Optimisation avec contrainte 30k€ net sur CA 200k€",
            "POST",
            "optimisation-fiscale",
            200,
            data=scenario3_data
        )
        
        if success3:
            print(f"   ✅ Contrainte 30k€ net sur gros CA calculée")
            optimal3 = result3.get('scenario_optimal', {})
            print(f"   🎯 Rémunération brute: {optimal3.get('remuneration_brute', 0):,.0f}€")
            print(f"   🎯 Dividendes bruts: {optimal3.get('dividendes_bruts', 0):,.0f}€")
            print(f"   🎯 Net disponible total: {optimal3.get('net_disponible', 0):,.0f}€")
            print(f"   🎯 Taux global: {optimal3.get('taux_global_imposition', 0):.1f}%")
            
            # Vérifier qu'il y a bien des dividendes disponibles
            dividendes = optimal3.get('dividendes_bruts', 0)
            if dividendes > 10000:
                print("   ✅ Dividendes disponibles après contrainte rémunération")
            else:
                print("   ⚠️ Peu ou pas de dividendes disponibles")
        
        # Test scenario 4: Comparaison avec/sans contrainte
        scenario_sans_contrainte = {
            "ca_previsionnel": 150000,
            "charges_deductibles": 30000,
            "situation_familiale": "celibataire",
            "nombre_parts": 1.0,
            "autres_revenus": 0,
            "patrimoine_existant": 0
            # Pas de remuneration_nette_souhaitee
        }
        
        success4a, result_sans = self.run_test(
            "Optimisation SANS contrainte (référence)",
            "POST",
            "optimisation-fiscale",
            200,
            data=scenario_sans_contrainte
        )
        
        scenario_avec_contrainte = scenario_sans_contrainte.copy()
        scenario_avec_contrainte["remuneration_nette_souhaitee"] = 25000
        
        success4b, result_avec = self.run_test(
            "Optimisation AVEC contrainte 25k€ net",
            "POST",
            "optimisation-fiscale",
            200,
            data=scenario_avec_contrainte
        )
        
        if success4a and success4b:
            print("   ✅ Comparaison avec/sans contrainte réussie")
            
            net_sans = result_sans.get('scenario_optimal', {}).get('net_disponible', 0)
            net_avec = result_avec.get('scenario_optimal', {}).get('net_disponible', 0)
            
            print(f"   📊 Net disponible SANS contrainte: {net_sans:,.0f}€")
            print(f"   📊 Net disponible AVEC contrainte: {net_avec:,.0f}€")
            
            if net_sans >= net_avec:
                print("   ✅ Logique respectée: optimisation libre ≥ optimisation contrainte")
            else:
                print("   ❌ Problème: contrainte donne plus que optimisation libre")
        
        # Test scenario 5: Contrainte avec situation familiale complexe
        scenario5_data = {
            "ca_previsionnel": 180000,
            "charges_deductibles": 40000,
            "situation_familiale": "marie",
            "nombre_parts": 2.5,  # Marié avec enfants
            "autres_revenus": 15000,
            "patrimoine_existant": 0,
            "remuneration_nette_souhaitee": 32000
        }
        
        success5, result5 = self.run_test(
            "Optimisation avec contrainte - situation complexe",
            "POST",
            "optimisation-fiscale",
            200,
            data=scenario5_data
        )
        
        if success5:
            print(f"   ✅ Contrainte avec situation familiale complexe calculée")
            optimal5 = result5.get('scenario_optimal', {})
            print(f"   🎯 Taux global avec 2.5 parts: {optimal5.get('taux_global_imposition', 0):.1f}%")
        
        # Vérifier les recommandations spécifiques aux contraintes
        if success1 and result1:
            recommendations = result1.get('recommandations', [])
            contrainte_mentions = [r for r in recommendations if 'contrainte' in r.lower() or 'respectée' in r.lower()]
            if len(contrainte_mentions) > 0:
                print("   ✅ Recommandations spécifiques aux contraintes présentes")
                for rec in contrainte_mentions[:2]:
                    print(f"   💡 {rec}")
            else:
                print("   ⚠️ Pas de recommandations spécifiques aux contraintes")
        
        return success1 and success2 and success3 and success4a and success4b and success5

    def test_simulation_salaire_net(self):
        """Test new salary net simulation endpoint"""
        print("\n" + "="*50)
        print("TESTING SIMULATION SALAIRE NET (NEW FEATURE)")
        print("="*50)
        
        # Test scenario 1: 30k€ net souhaité, célibataire
        scenario1_data = {
            "salaire_net_souhaite": 30000,
            "situation_familiale": "celibataire",
            "nombre_parts": 1.0,
            "autres_revenus": 0
        }
        
        success1, result1 = self.run_test(
            "Simulation Salaire Net - 30k€ célibataire",
            "POST",
            "simulation-salaire-net",
            200,
            data=scenario1_data
        )
        
        if success1:
            print(f"   ✅ Simulation 30k€ calculée avec succès")
            print(f"   💰 Salaire net souhaité: {result1.get('salaire_net_souhaite', 0):,.0f}€")
            print(f"   💼 Salaire brut nécessaire: {result1.get('salaire_brut_necessaire', 0):,.0f}€")
            print(f"   📊 Cotisations sociales: {result1.get('cotisations_sociales', 0):,.0f}€")
            print(f"   🏛️ IR sur salaire: {result1.get('ir_sur_salaire', 0):,.0f}€")
            print(f"   🏢 Coût total entreprise: {result1.get('cout_total_entreprise', 0):,.0f}€")
            print(f"   📈 Taux charges sociales: {result1.get('taux_charges_sociales', 0):.1f}%")
            print(f"   📈 Taux prélèvement total: {result1.get('taux_prelevement_total', 0):.1f}%")
            
            # Verify calculation consistency
            salaire_brut = result1.get('salaire_brut_necessaire', 0)
            cotisations = result1.get('cotisations_sociales', 0)
            ir = result1.get('ir_sur_salaire', 0)
            net_reel = result1.get('salaire_net_reel', 0)
            
            calculated_net = salaire_brut - cotisations - ir
            if abs(calculated_net - net_reel) < 100:  # Allow 100€ tolerance
                print("   ✅ Calculation consistency check passed")
            else:
                print(f"   ❌ Calculation inconsistent: {calculated_net} vs {net_reel}")
        
        # Test scenario 2: 50k€ net souhaité, marié 2 parts
        scenario2_data = {
            "salaire_net_souhaite": 50000,
            "situation_familiale": "marie",
            "nombre_parts": 2.0,
            "autres_revenus": 5000
        }
        
        success2, result2 = self.run_test(
            "Simulation Salaire Net - 50k€ marié",
            "POST",
            "simulation-salaire-net",
            200,
            data=scenario2_data
        )
        
        if success2:
            print(f"   ✅ Simulation 50k€ marié calculée avec succès")
            print(f"   💼 Salaire brut nécessaire: {result2.get('salaire_brut_necessaire', 0):,.0f}€")
            print(f"   🏢 Coût total entreprise: {result2.get('cout_total_entreprise', 0):,.0f}€")
            print(f"   📈 Taux prélèvement total: {result2.get('taux_prelevement_total', 0):.1f}%")
        
        # Test scenario 3: 80k€ net souhaité (high salary)
        scenario3_data = {
            "salaire_net_souhaite": 80000,
            "situation_familiale": "celibataire",
            "nombre_parts": 1.0,
            "autres_revenus": 0
        }
        
        success3, result3 = self.run_test(
            "Simulation Salaire Net - 80k€ célibataire",
            "POST",
            "simulation-salaire-net",
            200,
            data=scenario3_data
        )
        
        if success3:
            print(f"   ✅ Simulation 80k€ calculée avec succès")
            print(f"   💼 Salaire brut nécessaire: {result3.get('salaire_brut_necessaire', 0):,.0f}€")
            print(f"   🏢 Coût total entreprise: {result3.get('cout_total_entreprise', 0):,.0f}€")
            print(f"   📈 Taux prélèvement total: {result3.get('taux_prelevement_total', 0):.1f}%")
        
        # Test error handling - negative salary
        error_data = {
            "salaire_net_souhaite": -10000,
            "situation_familiale": "celibataire",
            "nombre_parts": 1.0,
            "autres_revenus": 0
        }
        
        success_error, _ = self.run_test(
            "Simulation Error - Negative Salary",
            "POST",
            "simulation-salaire-net",
            400,  # Should return error
            data=error_data
        )
        
        if success_error:
            print("   ✅ Error handling for negative salary works correctly")
        
        # Test edge case - very low salary
        low_salary_data = {
            "salaire_net_souhaite": 15000,
            "situation_familiale": "celibataire",
            "nombre_parts": 1.0,
            "autres_revenus": 0
        }
        
        success_low, result_low = self.run_test(
            "Simulation Salaire Net - 15k€ (low salary)",
            "POST",
            "simulation-salaire-net",
            200,
            data=low_salary_data
        )
        
        if success_low:
            print(f"   ✅ Low salary simulation works")
            print(f"   💼 Salaire brut nécessaire: {result_low.get('salaire_brut_necessaire', 0):,.0f}€")
        
        # Verify recommendations are provided
        if success1 and result1:
            recommendations = result1.get('recommandations', [])
            if len(recommendations) > 0:
                print(f"   ✅ Recommendations provided: {len(recommendations)} items")
                for i, rec in enumerate(recommendations[:2]):  # Show first 2
                    print(f"   💡 {rec}")
            else:
                print("   ❌ No recommendations provided")
        
        return success1 and success2 and success3 and success_error and success_low

    def cleanup(self):
        """Clean up created test data"""
        print("\n" + "="*50)
        print("CLEANING UP TEST DATA")
        print("="*50)
        
        # Delete in reverse order due to dependencies
        for devis_id in self.created_ids['devis']:
            self.run_test(f"Delete Devis {devis_id}", "DELETE", f"devis/{devis_id}", 200)
        
        for action_id in self.created_ids['actions']:
            self.run_test(f"Delete Action {action_id}", "DELETE", f"actions/{action_id}", 200)
        
        for affaire_id in self.created_ids['affaires']:
            self.run_test(f"Delete Affaire {affaire_id}", "DELETE", f"affaires/{affaire_id}", 200)
        
        for client_id in self.created_ids['clients']:
            self.run_test(f"Delete Client {client_id}", "DELETE", f"clients/{client_id}", 200)
        
        for prospect_id in self.created_ids['prospects']:
            self.run_test(f"Delete Prospect {prospect_id}", "DELETE", f"prospects/{prospect_id}", 200)

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting CRM API Tests")
        print("="*60)
        
        # Test dashboard first (doesn't require data)
        dashboard_ok = self.test_dashboard_stats()
        
        # Test CRUD operations
        prospects_ok = self.test_prospects_crud()
        conversion_ok = self.test_prospect_conversion() if prospects_ok else False
        clients_ok = self.test_clients_crud()
        affaires_ok = self.test_affaires_crud() if clients_ok else False
        actions_ok = self.test_actions_crud() if affaires_ok else False
        devis_ok = self.test_devis_crud() if clients_ok else False
        
        # Test new features
        devis_status_ok = self.test_devis_status_change() if devis_ok else False
        
        # Test error handling
        errors_ok = self.test_error_handling()
        
        # Test tax optimization (new module)
        fiscal_ok = self.test_optimisation_fiscale()
        
        # Test new salary net simulation (NEW FEATURE)
        salary_net_ok = self.test_simulation_salaire_net()
        
        # Test new tax optimization with net salary constraint (NEWEST FEATURE)
        fiscal_contrainte_ok = self.test_optimisation_fiscale_avec_contrainte()
        
        # Clean up
        self.cleanup()
        
        # Print results
        print("\n" + "="*60)
        print("📊 TEST RESULTS SUMMARY")
        print("="*60)
        print(f"Total tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        print("\n📋 Feature Test Results:")
        print(f"✅ Dashboard Stats: {'PASS' if dashboard_ok else 'FAIL'}")
        print(f"✅ Prospects CRUD: {'PASS' if prospects_ok else 'FAIL'}")
        print(f"✅ Prospect Conversion: {'PASS' if conversion_ok else 'FAIL'}")
        print(f"✅ Clients CRUD: {'PASS' if clients_ok else 'FAIL'}")
        print(f"✅ Affaires CRUD: {'PASS' if affaires_ok else 'FAIL'}")
        print(f"✅ Actions CRUD: {'PASS' if actions_ok else 'FAIL'}")
        print(f"✅ Devis CRUD: {'PASS' if devis_ok else 'FAIL'}")
        print(f"✅ Devis Status Change (NEW): {'PASS' if devis_status_ok else 'FAIL'}")
        print(f"✅ Error Handling: {'PASS' if errors_ok else 'FAIL'}")
        print(f"✅ Optimisation Fiscale: {'PASS' if fiscal_ok else 'FAIL'}")
        print(f"✅ Simulation Salaire Net (NEW): {'PASS' if salary_net_ok else 'FAIL'}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = CRMAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())