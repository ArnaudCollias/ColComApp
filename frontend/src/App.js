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
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;