import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { Plus, Users, Target, Calendar, FileText, TrendingUp, Phone, Mail, Building, User, Calculator, PieChart, BarChart3, Search, Filter, Edit, Trash2, Eye, Euro, Clock, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Pie } from "recharts";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./components/ui/alert-dialog";
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

// Composant de recherche et filtres
const SearchAndFilter = ({ searchTerm, setSearchTerm, filters, setFilters, filterOptions }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {filterOptions.map((filter) => (
        <Select
          key={filter.key}
          value={filters[filter.key] || "all"}
          onValueChange={(value) => setFilters(prev => ({...prev, [filter.key]: value === "all" ? "" : value}))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
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
  const [editingProspect, setEditingProspect] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
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
      if (editingProspect) {
        await axios.put(`${API}/prospects/${editingProspect.id}`, formData);
        toast.success("Prospect modifié avec succès");
      } else {
        await axios.post(`${API}/prospects`, formData);
        toast.success("Prospect créé avec succès");
      }
      setShowForm(false);
      setEditingProspect(null);
      resetForm();
      fetchProspects();
    } catch (error) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      entreprise: "",
      poste: "",
      notes: ""
    });
  };

  const editProspect = (prospect) => {
    setEditingProspect(prospect);
    setFormData({
      nom: prospect.nom,
      prenom: prospect.prenom,
      email: prospect.email,
      telephone: prospect.telephone,
      entreprise: prospect.entreprise,
      poste: prospect.poste || "",
      notes: prospect.notes || ""
    });
    setShowForm(true);
  };

  const deleteProspect = async (prospectId) => {
    try {
      await axios.delete(`${API}/prospects/${prospectId}`);
      toast.success("Prospect supprimé");
      fetchProspects();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
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

  // Filtrage et recherche
  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = !searchTerm || 
      prospect.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.statut || prospect.statut === filters.statut;
    
    return matchesSearch && matchesStatus;
  });

  const filterOptions = [
    {
      key: "statut",
      placeholder: "Filtrer par statut",
      options: [
        { value: "nouveau", label: "Nouveau" },
        { value: "qualifie", label: "Qualifié" },
        { value: "interesse", label: "Intéressé" },
        { value: "non_interesse", label: "Non intéressé" },
        { value: "converti", label: "Converti" }
      ]
    }
  ];

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-600">Gérez vos prospects et convertissez-les en clients</p>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setEditingProspect(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau prospect
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingProspect ? "Modifier le prospect" : "Créer un nouveau prospect"}
              </DialogTitle>
              <DialogDescription>
                {editingProspect ? "Modifiez les informations du prospect." : "Ajoutez les informations du prospect pour le suivi commercial."}
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
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingProspect(null);
                  resetForm();
                }}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingProspect ? "Modifier" : "Créer"} le prospect
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
      />

      <Card>
        <CardHeader>
          <CardTitle>Liste des prospects</CardTitle>
          <CardDescription>
            {filteredProspects.length} prospect{filteredProspects.length > 1 ? 's' : ''} {searchTerm || Object.keys(filters).length > 0 ? 'trouvé(s)' : 'enregistré(s)'}
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
              {filteredProspects.map((prospect) => (
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
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editProspect(prospect)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {prospect.statut !== 'converti' && (
                        <Button
                          size="sm"
                          onClick={() => convertToClient(prospect.id)}
                          className="mr-2"
                        >
                          Convertir
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer ce prospect ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteProspect(prospect.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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

// Clients
const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});

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

  // Filtrage et recherche
  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchTerm || 
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Gérez votre portefeuille client</p>
        </div>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        filterOptions={[]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>
            {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} {searchTerm ? 'trouvé(s)' : 'actif(s)'}
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
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
                    <div className="flex items-center">
                      <Euro className="w-4 h-4 mr-1 text-green-600" />
                      {client.chiffre_affaire_total.toLocaleString()} €
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(client.date_creation).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Link to={`/affaires?client=${client.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-2" />
                        Voir affaires
                      </Button>
                    </Link>
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

// Affaires
const Affaires = () => {
  const [affaires, setAffaires] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAffaire, setEditingAffaire] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState({
    client_id: "",
    titre: "",
    description: "",
    montant_previsionnel: 0,
    probabilite: 50,
    date_cloture_prevue: ""
  });

  useEffect(() => {
    fetchAffaires();
    fetchClients();
  }, []);

  const fetchAffaires = async () => {
    try {
      const response = await axios.get(`${API}/affaires`);
      setAffaires(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des affaires");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/clients`);
      setClients(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des clients");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        montant_previsionnel: parseFloat(formData.montant_previsionnel),
        probabilite: parseInt(formData.probabilite),
        date_cloture_prevue: formData.date_cloture_prevue ? new Date(formData.date_cloture_prevue).toISOString() : null
      };

      if (editingAffaire) {
        await axios.put(`${API}/affaires/${editingAffaire.id}`, data);
        toast.success("Affaire modifiée avec succès");
      } else {
        await axios.post(`${API}/affaires`, data);
        toast.success("Affaire créée avec succès");
      }
      setShowForm(false);
      setEditingAffaire(null);
      resetForm();
      fetchAffaires();
    } catch (error) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      titre: "",
      description: "",
      montant_previsionnel: 0,
      probabilite: 50,
      date_cloture_prevue: ""
    });
  };

  const editAffaire = (affaire) => {
    setEditingAffaire(affaire);
    setFormData({
      client_id: affaire.client_id,
      titre: affaire.titre,
      description: affaire.description || "",
      montant_previsionnel: affaire.montant_previsionnel,
      probabilite: affaire.probabilite,
      date_cloture_prevue: affaire.date_cloture_prevue ? new Date(affaire.date_cloture_prevue).toISOString().split('T')[0] : ""
    });
    setShowForm(true);
  };

  const deleteAffaire = async (affaireId) => {
    try {
      await axios.delete(`${API}/affaires/${affaireId}`);
      toast.success("Affaire supprimée");
      fetchAffaires();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatutBadge = (statut) => {
    const colors = {
      prospect: "bg-blue-100 text-blue-800",
      negociation: "bg-yellow-100 text-yellow-800",
      proposition: "bg-orange-100 text-orange-800",
      gagne: "bg-green-100 text-green-800",
      perdu: "bg-red-100 text-red-800"
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.prenom} ${client.nom} (${client.entreprise})` : "Client inconnu";
  };

  // Filtrage et recherche
  const filteredAffaires = affaires.filter(affaire => {
    const clientName = getClientName(affaire.client_id);
    const matchesSearch = !searchTerm || 
      affaire.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.statut || affaire.statut === filters.statut;
    const matchesClient = !filters.client_id || affaire.client_id === filters.client_id;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const filterOptions = [
    {
      key: "statut",
      placeholder: "Filtrer par statut",
      options: [
        { value: "prospect", label: "Prospect" },
        { value: "negociation", label: "Négociation" },
        { value: "proposition", label: "Proposition" },
        { value: "gagne", label: "Gagné" },
        { value: "perdu", label: "Perdu" }
      ]
    },
    {
      key: "client_id",
      placeholder: "Filtrer par client",
      options: clients.map(client => ({
        value: client.id,
        label: `${client.prenom} ${client.nom} (${client.entreprise})`
      }))
    }
  ];

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Affaires</h1>
          <p className="text-gray-600">Gérez vos opportunités commerciales</p>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setEditingAffaire(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle affaire
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingAffaire ? "Modifier l'affaire" : "Créer une nouvelle affaire"}
              </DialogTitle>
              <DialogDescription>
                {editingAffaire ? "Modifiez les informations de l'affaire." : "Ajoutez une nouvelle opportunité commerciale."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="client_id">Client *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({...formData, client_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.prenom} {client.nom} ({client.entreprise})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({...formData, titre: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="montant">Montant prévisionnel (€) *</Label>
                  <Input
                    id="montant"
                    type="number"
                    value={formData.montant_previsionnel}
                    onChange={(e) => setFormData({...formData, montant_previsionnel: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="probabilite">Probabilité (%)</Label>
                  <Input
                    id="probabilite"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probabilite}
                    onChange={(e) => setFormData({...formData, probabilite: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="date_cloture">Date de clôture prévue</Label>
                <Input
                  id="date_cloture"
                  type="date"
                  value={formData.date_cloture_prevue}
                  onChange={(e) => setFormData({...formData, date_cloture_prevue: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingAffaire(null);
                  resetForm();
                }}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingAffaire ? "Modifier" : "Créer"} l'affaire
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
      />

      <Card>
        <CardHeader>
          <CardTitle>Liste des affaires</CardTitle>
          <CardDescription>
            {filteredAffaires.length} affaire{filteredAffaires.length > 1 ? 's' : ''} {searchTerm || Object.keys(filters).length > 0 ? 'trouvée(s)' : 'enregistrée(s)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Probabilité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date clôture</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAffaires.map((affaire) => (
                <TableRow key={affaire.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{affaire.titre}</div>
                      {affaire.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {affaire.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{getClientName(affaire.client_id)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      <Euro className="w-4 h-4 mr-1 text-green-600" />
                      {affaire.montant_previsionnel.toLocaleString()} €
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${affaire.probabilite}%`}}
                        ></div>
                      </div>
                      {affaire.probabilite}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatutBadge(affaire.statut)}>
                      {affaire.statut}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {affaire.date_cloture_prevue ? (
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(affaire.date_cloture_prevue).toLocaleDateString('fr-FR')}
                      </div>
                    ) : (
                      <span className="text-gray-400">Non définie</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editAffaire(affaire)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Link to={`/actions?affaire=${affaire.id}`}>
                        <Button size="sm" variant="outline">
                          <Calendar className="w-3 h-3" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer cette affaire ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteAffaire(affaire.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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

// Actions
const Actions = () => {
  const [actions, setActions] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState({
    affaire_id: "",
    type_action: "appel",
    titre: "",
    description: "",
    date_prevue: ""
  });

  useEffect(() => {
    fetchActions();
    fetchAffaires();
    fetchClients();
  }, []);

  const fetchActions = async () => {
    try {
      const response = await axios.get(`${API}/actions`);
      setActions(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des actions");
    } finally {
      setLoading(false);
    }
  };

  const fetchAffaires = async () => {
    try {
      const response = await axios.get(`${API}/affaires`);
      setAffaires(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des affaires");
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/clients`);
      setClients(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des clients");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        date_prevue: new Date(formData.date_prevue).toISOString()
      };

      if (editingAction) {
        await axios.put(`${API}/actions/${editingAction.id}`, data);
        toast.success("Action modifiée avec succès");
      } else {
        await axios.post(`${API}/actions`, data);
        toast.success("Action créée avec succès");
      }
      setShowForm(false);
      setEditingAction(null);
      resetForm();
      fetchActions();
    } catch (error) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const resetForm = () => {
    setFormData({
      affaire_id: "",
      type_action: "appel",
      titre: "",
      description: "",
      date_prevue: ""
    });
  };

  const editAction = (action) => {
    setEditingAction(action);
    setFormData({
      affaire_id: action.affaire_id,
      type_action: action.type_action,
      titre: action.titre,
      description: action.description || "",
      date_prevue: new Date(action.date_prevue).toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const deleteAction = async (actionId) => {
    try {
      await axios.delete(`${API}/actions/${actionId}`);
      toast.success("Action supprimée");
      fetchActions();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatutBadge = (statut) => {
    const colors = {
      a_faire: "bg-blue-100 text-blue-800",
      en_cours: "bg-yellow-100 text-yellow-800",
      termine: "bg-green-100 text-green-800",
      annule: "bg-red-100 text-red-800"
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  const getTypeIcon = (type) => {
    const icons = {
      appel: Phone,
      email: Mail,
      rendez_vous: Calendar,
      relance: AlertCircle,
      autre: Target
    };
    return icons[type] || Target;
  };

  const getAffaireName = (affaireId) => {
    const affaire = affaires.find(a => a.id === affaireId);
    if (!affaire) return "Affaire inconnue";
    
    const client = clients.find(c => c.id === affaire.client_id);
    return `${affaire.titre} (${client ? client.entreprise : 'Client inconnu'})`;
  };

  // Filtrage et recherche
  const filteredActions = actions.filter(action => {
    const affaireName = getAffaireName(action.affaire_id);
    const matchesSearch = !searchTerm || 
      action.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affaireName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.statut || action.statut === filters.statut;
    const matchesType = !filters.type_action || action.type_action === filters.type_action;
    const matchesAffaire = !filters.affaire_id || action.affaire_id === filters.affaire_id;
    
    return matchesSearch && matchesStatus && matchesType && matchesAffaire;
  });

  const filterOptions = [
    {
      key: "statut",
      placeholder: "Filtrer par statut",
      options: [
        { value: "a_faire", label: "À faire" },
        { value: "en_cours", label: "En cours" },
        { value: "termine", label: "Terminé" },
        { value: "annule", label: "Annulé" }
      ]
    },
    {
      key: "type_action",
      placeholder: "Filtrer par type",
      options: [
        { value: "appel", label: "Appel" },
        { value: "email", label: "Email" },
        { value: "rendez_vous", label: "Rendez-vous" },
        { value: "relance", label: "Relance" },
        { value: "autre", label: "Autre" }
      ]
    },
    {
      key: "affaire_id",
      placeholder: "Filtrer par affaire",
      options: affaires.map(affaire => ({
        value: affaire.id,
        label: affaire.titre
      }))
    }
  ];

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Actions</h1>
          <p className="text-gray-600">Planifiez et suivez vos actions commerciales</p>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setEditingAction(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle action
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingAction ? "Modifier l'action" : "Créer une nouvelle action"}
              </DialogTitle>
              <DialogDescription>
                {editingAction ? "Modifiez les informations de l'action." : "Planifiez une nouvelle action commerciale."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="affaire_id">Affaire *</Label>
                <Select
                  value={formData.affaire_id}
                  onValueChange={(value) => setFormData({...formData, affaire_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une affaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {affaires.map((affaire) => (
                      <SelectItem key={affaire.id} value={affaire.id}>
                        {getAffaireName(affaire.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type_action">Type d'action *</Label>
                <Select
                  value={formData.type_action}
                  onValueChange={(value) => setFormData({...formData, type_action: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appel">Appel</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="rendez_vous">Rendez-vous</SelectItem>
                    <SelectItem value="relance">Relance</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({...formData, titre: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="date_prevue">Date prévue *</Label>
                <Input
                  id="date_prevue"
                  type="date"
                  value={formData.date_prevue}
                  onChange={(e) => setFormData({...formData, date_prevue: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingAction(null);
                  resetForm();
                }}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingAction ? "Modifier" : "Créer"} l'action
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
      />

      <Card>
        <CardHeader>
          <CardTitle>Liste des actions</CardTitle>
          <CardDescription>
            {filteredActions.length} action{filteredActions.length > 1 ? 's' : ''} {searchTerm || Object.keys(filters).length > 0 ? 'trouvée(s)' : 'planifiée(s)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Affaire</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date prévue</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.map((action) => {
                const TypeIcon = getTypeIcon(action.type_action);
                return (
                  <TableRow key={action.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{action.titre}</div>
                        {action.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {action.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{getAffaireName(action.affaire_id)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <TypeIcon className="w-4 h-4 mr-2" />
                        {action.type_action}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(action.date_prevue).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatutBadge(action.statut)}>
                        {action.statut.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editAction(action)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cette action ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteAction(action.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Devis
const Devis = () => {
  const [devisList, setDevisList] = useState([]);
  const [clients, setClients] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDevis, setEditingDevis] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [formData, setFormData] = useState({
    client_id: "",
    affaire_id: "none",
    titre: "",
    lignes: [],
    taux_tva: 20.0,
    date_validite: ""
  });
  const [currentLigne, setCurrentLigne] = useState({
    description: "",
    quantite: 1,
    prix_unitaire: 0,
    montant: 0
  });

  useEffect(() => {
    fetchDevis();
    fetchClients();
    fetchAffaires();
  }, []);

  const fetchDevis = async () => {
    try {
      const response = await axios.get(`${API}/devis`);
      setDevisList(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des devis");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/clients`);
      setClients(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des clients");
    }
  };

  const fetchAffaires = async () => {
    try {
      const response = await axios.get(`${API}/affaires`);
      setAffaires(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des affaires");
    }
  };

  const calculateMontantLigne = () => {
    const montant = parseFloat(currentLigne.quantite) * parseFloat(currentLigne.prix_unitaire);
    setCurrentLigne(prev => ({...prev, montant}));
  };

  useEffect(() => {
    calculateMontantLigne();
  }, [currentLigne.quantite, currentLigne.prix_unitaire]);

  const addLigne = () => {
    if (currentLigne.description && currentLigne.quantite > 0 && currentLigne.prix_unitaire >= 0) {
      setFormData(prev => ({
        ...prev,
        lignes: [...prev.lignes, {...currentLigne}]
      }));
      setCurrentLigne({
        description: "",
        quantite: 1,
        prix_unitaire: 0,
        montant: 0
      });
    }
  };

  const removeLigne = (index) => {
    setFormData(prev => ({
      ...prev,
      lignes: prev.lignes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        affaire_id: formData.affaire_id === "none" ? "" : formData.affaire_id,
        taux_tva: parseFloat(formData.taux_tva),
        date_validite: formData.date_validite ? new Date(formData.date_validite).toISOString() : null
      };

      if (editingDevis) {
        await axios.put(`${API}/devis/${editingDevis.id}`, data);
        toast.success("Devis modifié avec succès");
      } else {
        await axios.post(`${API}/devis`, data);
        toast.success("Devis créé avec succès");
      }
      setShowForm(false);
      setEditingDevis(null);
      resetForm();
      fetchDevis();
    } catch (error) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      affaire_id: "none",
      titre: "",
      lignes: [],
      taux_tva: 20.0,
      date_validite: ""
    });
    setCurrentLigne({
      description: "",
      quantite: 1,
      prix_unitaire: 0,
      montant: 0
    });
  };

  const editDevis = (devis) => {
    setEditingDevis(devis);
    setFormData({
      client_id: devis.client_id,
      affaire_id: devis.affaire_id || "none",
      titre: devis.titre,
      lignes: [...devis.lignes],
      taux_tva: devis.taux_tva,
      date_validite: devis.date_validite ? new Date(devis.date_validite).toISOString().split('T')[0] : ""
    });
    setShowForm(true);
  };

  const deleteDevis = async (devisId) => {
    try {
      await axios.delete(`${API}/devis/${devisId}`);
      toast.success("Devis supprimé");
      fetchDevis();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatutBadge = (statut) => {
    const colors = {
      brouillon: "bg-gray-100 text-gray-800",
      envoye: "bg-blue-100 text-blue-800",
      accepte: "bg-green-100 text-green-800",
      refuse: "bg-red-100 text-red-800",
      expire: "bg-orange-100 text-orange-800"
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.prenom} ${client.nom} (${client.entreprise})` : "Client inconnu";
  };

  // Filtrage et recherche
  const filteredDevis = devisList.filter(devis => {
    const clientName = getClientName(devis.client_id);
    const matchesSearch = !searchTerm || 
      devis.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devis.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.statut || devis.statut === filters.statut;
    const matchesClient = !filters.client_id || devis.client_id === filters.client_id;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const filterOptions = [
    {
      key: "statut",
      placeholder: "Filtrer par statut",
      options: [
        { value: "brouillon", label: "Brouillon" },
        { value: "envoye", label: "Envoyé" },
        { value: "accepte", label: "Accepté" },
        { value: "refuse", label: "Refusé" },
        { value: "expire", label: "Expiré" }
      ]
    },
    {
      key: "client_id",
      placeholder: "Filtrer par client",
      options: clients.map(client => ({
        value: client.id,
        label: `${client.prenom} ${client.nom} (${client.entreprise})`
      }))
    }
  ];

  const calculateTotals = () => {
    const montantHT = formData.lignes.reduce((sum, ligne) => sum + ligne.montant, 0);
    const montantTVA = montantHT * (formData.taux_tva / 100);
    const montantTTC = montantHT + montantTVA;
    return { montantHT, montantTVA, montantTTC };
  };

  const { montantHT, montantTVA, montantTTC } = calculateTotals();

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Devis</h1>
          <p className="text-gray-600">Créez et gérez vos devis clients</p>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setEditingDevis(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau devis
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDevis ? "Modifier le devis" : "Créer un nouveau devis"}
              </DialogTitle>
              <DialogDescription>
                {editingDevis ? "Modifiez les informations du devis." : "Créez un nouveau devis avec les lignes de prestations."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client_id">Client *</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData({...formData, client_id: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.prenom} {client.nom} ({client.entreprise})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="affaire_id">Affaire (optionnel)</Label>
                  <Select
                    value={formData.affaire_id}
                    onValueChange={(value) => setFormData({...formData, affaire_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une affaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune affaire</SelectItem>
                      {affaires
                        .filter(affaire => !formData.client_id || affaire.client_id === formData.client_id)
                        .map((affaire) => (
                        <SelectItem key={affaire.id} value={affaire.id}>
                          {affaire.titre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="titre">Titre du devis *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({...formData, titre: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taux_tva">Taux TVA (%)</Label>
                  <Input
                    id="taux_tva"
                    type="number"
                    step="0.1"
                    value={formData.taux_tva}
                    onChange={(e) => setFormData({...formData, taux_tva: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="date_validite">Date de validité</Label>
                  <Input
                    id="date_validite"
                    type="date"
                    value={formData.date_validite}
                    onChange={(e) => setFormData({...formData, date_validite: e.target.value})}
                  />
                </div>
              </div>

              {/* Lignes du devis */}
              <div>
                <Label className="text-base font-semibold">Lignes du devis</Label>
                
                {/* Formulaire d'ajout de ligne */}
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={currentLigne.description}
                        onChange={(e) => setCurrentLigne({...currentLigne, description: e.target.value})}
                        placeholder="Description de la prestation"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantite">Quantité</Label>
                      <Input
                        id="quantite"
                        type="number"
                        step="0.01"
                        value={currentLigne.quantite}
                        onChange={(e) => setCurrentLigne({...currentLigne, quantite: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="prix_unitaire">Prix unitaire (€)</Label>
                      <Input
                        id="prix_unitaire"
                        type="number"
                        step="0.01"
                        value={currentLigne.prix_unitaire}
                        onChange={(e) => setCurrentLigne({...currentLigne, prix_unitaire: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Montant (€)</Label>
                      <div className="px-3 py-2 bg-white border rounded text-right">
                        {currentLigne.montant.toFixed(2)} €
                      </div>
                    </div>
                  </div>
                  <Button type="button" onClick={addLigne} size="sm">
                    <Plus className="w-3 h-3 mr-1" />
                    Ajouter la ligne
                  </Button>
                </div>

                {/* Liste des lignes */}
                {formData.lignes.length > 0 && (
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantité</TableHead>
                          <TableHead>Prix unitaire</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.lignes.map((ligne, index) => (
                          <TableRow key={index}>
                            <TableCell>{ligne.description}</TableCell>
                            <TableCell>{ligne.quantite}</TableCell>
                            <TableCell>{ligne.prix_unitaire.toFixed(2)} €</TableCell>
                            <TableCell>{ligne.montant.toFixed(2)} €</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => removeLigne(index)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Totaux */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-right space-y-1">
                        <div>Total HT: <span className="font-semibold">{montantHT.toFixed(2)} €</span></div>
                        <div>TVA ({formData.taux_tva}%): <span className="font-semibold">{montantTVA.toFixed(2)} €</span></div>
                        <div className="text-lg border-t pt-1">
                          Total TTC: <span className="font-bold">{montantTTC.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingDevis(null);
                  resetForm();
                }}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingDevis ? "Modifier" : "Créer"} le devis
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
      />

      <Card>
        <CardHeader>
          <CardTitle>Liste des devis</CardTitle>
          <CardDescription>
            {filteredDevis.length} devis {searchTerm || Object.keys(filters).length > 0 ? 'trouvé(s)' : 'enregistré(s)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevis.map((devis) => (
                <TableRow key={devis.id}>
                  <TableCell>
                    <div className="font-mono font-medium">{devis.numero}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{devis.titre}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{getClientName(devis.client_id)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      <Euro className="w-4 h-4 mr-1 text-green-600" />
                      {devis.montant_ttc.toFixed(2)} €
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatutBadge(devis.statut)}>
                      {devis.statut}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(devis.date_creation).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editDevis(devis)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteDevis(devis.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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

// Optimisation Fiscale SASU (code existant maintenu)
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
                  <strong>IS :</strong> 15% (≤42,5k€), 25% (&gt;42,5k€)
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
              <Route path="/affaires" element={<Affaires />} />
              <Route path="/actions" element={<Actions />} />
              <Route path="/devis" element={<Devis />} />
              <Route path="/optimisation-fiscale" element={<OptimisationFiscale />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;