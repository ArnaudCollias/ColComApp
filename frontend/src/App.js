import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { Plus, Users, Target, Calendar, FileText, TrendingUp, Phone, Mail, Building, User, Calculator, PieChart, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line } from "recharts";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Composant de navigation
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Tableau de bord", icon: TrendingUp },
    { path: "/prospects", label: "Prospects", icon: Users },
    { path: "/clients", label: "Clients", icon: Building },
    { path: "/affaires", label: "Affaires", icon: Target },
    { path: "/actions", label: "Actions", icon: Calendar },
    { path: "/devis", label: "Devis", icon: FileText },
    { path: "/optimisation-fiscale", label: "Optimisation fiscale", icon: Calculator },
  ];

  return (
    <nav className="bg-white border-r border-gray-200 w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SmartBiz CRM</h1>
        <p className="text-sm text-gray-600">Gestion d'entreprise</p>
      </div>
      
      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

// Dashboard
const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité commerciale</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prospects_count || 0}</div>
            <p className="text-xs text-muted-foreground">prospects actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clients_count || 0}</div>
            <p className="text-xs text-muted-foreground">clients convertis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affaires ouvertes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.affaires_ouvertes || 0}</div>
            <p className="text-xs text-muted-foreground">en cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Prévisionnel</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.ca_previsionnel || 0).toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">pipeline actuel</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Prospects
const Prospects = () => {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    entreprise: "",
    poste: "",
    notes: ""
  });

  useEffect(() => {
    fetchProspects();
  }, []);

  const fetchProspects = async () => {
    try {
      const response = await axios.get(`${API}/prospects`);
      setProspects(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des prospects");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/prospects`, formData);
      toast.success("Prospect créé avec succès");
      setShowForm(false);
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        entreprise: "",
        poste: "",
        notes: ""
      });
      fetchProspects();
    } catch (error) {
      toast.error("Erreur lors de la création du prospect");
    }
  };

  const convertToClient = async (prospectId) => {
    try {
      await axios.post(`${API}/prospects/${prospectId}/convert`);
      toast.success("Prospect converti en client");
      fetchProspects();
    } catch (error) {
      toast.error("Erreur lors de la conversion");
    }
  };

  const getStatutBadge = (statut) => {
    const colors = {
      nouveau: "bg-blue-100 text-blue-800",
      qualifie: "bg-yellow-100 text-yellow-800",
      interesse: "bg-green-100 text-green-800",
      non_interesse: "bg-red-100 text-red-800",
      converti: "bg-purple-100 text-purple-800"
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-600">Gérez vos prospects et convertissez-les en clients</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau prospect
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau prospect</DialogTitle>
              <DialogDescription>
                Ajoutez les informations du prospect pour le suivi commercial.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="entreprise">Entreprise *</Label>
                <Input
                  id="entreprise"
                  value={formData.entreprise}
                  onChange={(e) => setFormData({...formData, entreprise: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="poste">Poste</Label>
                <Input
                  id="poste"
                  value={formData.poste}
                  onChange={(e) => setFormData({...formData, poste: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer le prospect</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des prospects</CardTitle>
          <CardDescription>
            {prospects.length} prospect{prospects.length > 1 ? 's' : ''} enregistré{prospects.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{prospect.prenom} {prospect.nom}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {prospect.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {prospect.telephone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{prospect.entreprise}</div>
                      {prospect.poste && <div className="text-sm text-gray-500">{prospect.poste}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatutBadge(prospect.statut)}>
                      {prospect.statut}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(prospect.date_creation).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {prospect.statut !== 'converti' && (
                      <Button
                        size="sm"
                        onClick={() => convertToClient(prospect.id)}
                        className="mr-2"
                      >
                        Convertir
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Clients (similaire à Prospects mais pour les clients)
const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/clients`);
      setClients(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Gérez votre portefeuille client</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>
            {clients.length} client{clients.length > 1 ? 's' : ''} actif{clients.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>CA Total</TableHead>
                <TableHead>Date conversion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{client.prenom} {client.nom}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {client.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {client.telephone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{client.entreprise}</div>
                      {client.poste && <div className="text-sm text-gray-500">{client.poste}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.chiffre_affaire_total.toLocaleString()} €
                  </TableCell>
                  <TableCell>
                    {new Date(client.date_creation).toLocaleDateString('fr-FR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Optimisation Fiscale SASU
const OptimisationFiscale = () => {
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [baremes, setBaremes] = useState(null);
  const [formData, setFormData] = useState({
    ca_previsionnel: 150000,
    charges_deductibles: 30000,
    situation_familiale: "celibataire",
    nombre_parts: 1.0,
    autres_revenus: 0,
    patrimoine_existant: 0
  });

  useEffect(() => {
    fetchBaremes();
  }, []);

  const fetchBaremes = async () => {
    try {
      const response = await axios.get(`${API}/baremes-fiscaux-2025`);
      setBaremes(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des barèmes");
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/optimisation-fiscale`, formData);
      setSimulation(response.data);
      toast.success("Simulation calculée avec succès");
    } catch (error) {
      toast.error("Erreur lors du calcul de la simulation");
    } finally {
      setLoading(false);
    }
  };

  const formatEuros = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (rate) => {
    return `${rate.toFixed(1)}%`;
  };

  // Données pour les graphiques
  const chartData = simulation ? [
    {
      name: 'Scénario Optimal',
      remuneration: simulation.scenario_optimal.remuneration_brute,
      dividendes: simulation.scenario_optimal.dividendes_bruts,
      netDisponible: simulation.scenario_optimal.net_disponible,
      tauxImposition: simulation.scenario_optimal.taux_global_imposition
    },
    {
      name: 'Max Rémunération',
      remuneration: simulation.scenario_remuneration_max.remuneration_brute,
      dividendes: simulation.scenario_remuneration_max.dividendes_bruts,
      netDisponible: simulation.scenario_remuneration_max.net_disponible,
      tauxImposition: simulation.scenario_remuneration_max.taux_global_imposition
    },
    {
      name: 'Max Dividendes',
      remuneration: simulation.scenario_dividendes_max.remuneration_brute,
      dividendes: simulation.scenario_dividendes_max.dividendes_bruts,
      netDisponible: simulation.scenario_dividendes_max.net_disponible,
      tauxImposition: simulation.scenario_dividendes_max.taux_global_imposition
    }
  ] : [];

  const pieData = simulation ? [
    { name: 'Net disponible', value: simulation.scenario_optimal.net_disponible, color: '#10b981' },
    { name: 'IS', value: simulation.scenario_optimal.is_a_payer, color: '#f59e0b' },
    { name: 'Cotisations sociales', value: simulation.scenario_optimal.cotisations_sociales, color: '#ef4444' },
    { name: 'IR', value: simulation.scenario_optimal.ir_sur_remuneration + simulation.scenario_optimal.ir_sur_dividendes, color: '#8b5cf6' }
  ] : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Optimisation Fiscale SASU</h1>
        <p className="text-gray-600">Calculez la répartition optimale rémunération/dividendes avec les barèmes 2025</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire de simulation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Paramètres de simulation
              </CardTitle>
              <CardDescription>
                Saisissez vos données prévisionnelles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ca">Chiffre d'affaires prévisionnel</Label>
                <Input
                  id="ca"
                  type="number"
                  value={formData.ca_previsionnel}
                  onChange={(e) => setFormData({...formData, ca_previsionnel: parseFloat(e.target.value) || 0})}
                  placeholder="150000"
                />
              </div>

              <div>
                <Label htmlFor="charges">Charges déductibles</Label>
                <Input
                  id="charges"
                  type="number"
                  value={formData.charges_deductibles}
                  onChange={(e) => setFormData({...formData, charges_deductibles: parseFloat(e.target.value) || 0})}
                  placeholder="30000"
                />
              </div>

              <div>
                <Label htmlFor="situation">Situation familiale</Label>
                <Select 
                  value={formData.situation_familiale} 
                  onValueChange={(value) => setFormData({...formData, situation_familiale: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celibataire">Célibataire</SelectItem>
                    <SelectItem value="marie">Marié(e)</SelectItem>
                    <SelectItem value="pacs">Pacsé(e)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="parts">Nombre de parts fiscales</Label>
                <Input
                  id="parts"
                  type="number"
                  step="0.5"
                  value={formData.nombre_parts}
                  onChange={(e) => setFormData({...formData, nombre_parts: parseFloat(e.target.value) || 1})}
                  placeholder="1.0"
                />
              </div>

              <div>
                <Label htmlFor="autres">Autres revenus annuels</Label>
                <Input
                  id="autres"
                  type="number"
                  value={formData.autres_revenus}
                  onChange={(e) => setFormData({...formData, autres_revenus: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>

              <Button 
                onClick={runSimulation} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Calcul en cours..." : "Calculer l'optimisation"}
              </Button>
            </CardContent>
          </Card>

          {/* Barèmes fiscaux */}
          {baremes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Barèmes 2025</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div>
                  <strong>IS :</strong> 15% (≤42,5k€), 25% (>42,5k€)
                </div>
                <div>
                  <strong>Dividendes :</strong> Flat tax 30%
                </div>
                <div>
                  <strong>Cotisations dirigeant :</strong> ≈45%
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Résultats */}
        <div className="lg:col-span-2">
          {simulation ? (
            <div className="space-y-6">
              {/* Scénario optimal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">🎯 Scénario Optimal</CardTitle>
                  <CardDescription>
                    Répartition recommandée pour maximiser votre net disponible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatEuros(simulation.scenario_optimal.remuneration_brute)}
                      </div>
                      <div className="text-sm text-gray-600">Rémunération brute</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatEuros(simulation.scenario_optimal.dividendes_bruts)}
                      </div>
                      <div className="text-sm text-gray-600">Dividendes bruts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatEuros(simulation.scenario_optimal.net_disponible)}
                      </div>
                      <div className="text-sm text-gray-600">Net disponible</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPercent(simulation.scenario_optimal.taux_global_imposition)}
                      </div>
                      <div className="text-sm text-gray-600">Taux global</div>
                    </div>
                  </div>

                  {/* Répartition fiscale - Graphique en secteurs */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-4">Répartition fiscale</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatEuros(value)} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comparaison des scénarios */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Comparaison des scénarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `${value/1000}k€`} />
                        <Tooltip formatter={(value) => formatEuros(value)} />
                        <Bar dataKey="netDisponible" name="Net disponible" fill="#10b981" />
                        <Bar dataKey="remuneration" name="Rémunération" fill="#3b82f6" />
                        <Bar dataKey="dividendes" name="Dividendes" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tableau comparatif */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scénario</TableHead>
                        <TableHead>Rémunération</TableHead>
                        <TableHead>Dividendes</TableHead>
                        <TableHead>Net disponible</TableHead>
                        <TableHead>Taux global</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="bg-green-50">
                        <TableCell className="font-medium text-green-700">🎯 Optimal</TableCell>
                        <TableCell>{formatEuros(simulation.scenario_optimal.remuneration_brute)}</TableCell>
                        <TableCell>{formatEuros(simulation.scenario_optimal.dividendes_bruts)}</TableCell>
                        <TableCell className="font-bold">{formatEuros(simulation.scenario_optimal.net_disponible)}</TableCell>
                        <TableCell>{formatPercent(simulation.scenario_optimal.taux_global_imposition)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">💼 Max Rémunération</TableCell>
                        <TableCell>{formatEuros(simulation.scenario_remuneration_max.remuneration_brute)}</TableCell>
                        <TableCell>{formatEuros(simulation.scenario_remuneration_max.dividendes_bruts)}</TableCell>
                        <TableCell>{formatEuros(simulation.scenario_remuneration_max.net_disponible)}</TableCell>
                        <TableCell>{formatPercent(simulation.scenario_remuneration_max.taux_global_imposition)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">💰 Max Dividendes</TableCell>
                        <TableCell>{formatEuros(simulation.scenario_dividendes_max.remuneration_brute)}</TableCell>
                        <TableCell>{formatEuros(simulation.scenario_dividendes_max.dividendes_bruts)}</TableCell>
                        <TableCell>{formatEuros(simulation.scenario_dividendes_max.net_disponible)}</TableCell>
                        <TableCell>{formatPercent(simulation.scenario_dividendes_max.taux_global_imposition)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Recommandations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">💡 Recommandations personnalisées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {simulation.recommandations.map((rec, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        {rec}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calculator className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune simulation disponible
                </h3>
                <p className="text-gray-600">
                  Saisissez vos paramètres et lancez une simulation pour voir les résultats d'optimisation fiscale.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant principal
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="flex min-h-screen bg-gray-50">
          <Navigation />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/prospects" element={<Prospects />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/affaires" element={<div className="p-8">Affaires - En développement</div>} />
              <Route path="/actions" element={<div className="p-8">Actions - En développement</div>} />
              <Route path="/devis" element={<div className="p-8">Devis - En développement</div>} />
              <Route path="/optimisation-fiscale" element={<OptimisationFiscale />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;